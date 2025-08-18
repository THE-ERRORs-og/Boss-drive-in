"use server";

import { auth } from "@/auth";
import connectDB from "./mongodb";
import User from "@/models/User";
import Location from "@/models/Location";

/**
 * Custom error class for unauthorized location access
 */
export class UnauthorizedLocationError extends Error {
  constructor(message = "You do not have access to this location") {
    super(message);
    this.name = "UnauthorizedLocationError";
    this.statusCode = 403;
  }
}

/**
 * Get session with guaranteed location access information
 * @returns {Promise<Object|null>} Session object with locationIds or null if not authenticated
 */
export async function getSessionWithLocations() {
  // With our optimized auth.js, the session will already include locationIds
  const session = await auth();
  
  if (!session || !session.user) {
    return null;
  }
  
  // Session should already have locationIds, but if not (for any reason),
  // set reasonable defaults instead of making another DB call
  if (!session.user.locationIds) {
    if (session.user.role === "superadmin") {
      session.user.hasAllLocationsAccess = true;
      session.user.locationIds = ["__all__"];
    } else {
      session.user.hasAllLocationsAccess = false;
      session.user.locationIds = [];
    }
  }
  
  return session;
}

/**
 * Check if the user has access to the specified location
 * @param {string} locationId - The location ID to check access for
 * @param {Object} session - The session object (optional, will be fetched if not provided)
 * @returns {Promise<boolean>} True if user has access, throws UnauthorizedLocationError otherwise
 */
export async function requireLocationAccess(locationId, session = null) {
  // Get session if not provided
  const userSession = session || await getSessionWithLocations();
  
  if (!userSession || !userSession.user) {
    throw new UnauthorizedLocationError("Authentication required");
  }
  
  // Superadmins have access to all locations
  if (userSession.user.hasAllLocationsAccess || 
      userSession.user.locationIds?.includes("__all__") ||
      userSession.user.role === "superadmin") {
    return true;
  }
  
  // Check if user has access to this specific location
  if (!userSession.user.locationIds?.includes(locationId)) {
    throw new UnauthorizedLocationError();
  }
  
  return true;
}

/**
 * Check if the user has access to the specified location, without throwing
 * @param {string} locationId - The location ID to check access for
 * @param {Object} session - The session object (optional, will be fetched if not provided)
 * @returns {Promise<boolean>} True if user has access, false otherwise
 */
export async function hasLocationAccess(locationId, session = null) {
  try {
    await requireLocationAccess(locationId, session);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get all locations the user has access to
 * @param {Object} session - The session object (optional, will be fetched if not provided)
 * @returns {Promise<Array>} Array of location objects the user has access to
 */
export async function getAccessibleLocations(session = null) {
  const userSession = session || await getSessionWithLocations();
  
  if (!userSession || !userSession.user) {
    return [];
  }
  
  try {
    await connectDB();
    
    // For superadmins, return all active locations
    if (userSession.user.hasAllLocationsAccess || 
        userSession.user.locationIds?.includes("__all__") ||
        userSession.user.role === "superadmin") {
      const allLocations = await Location.find({ isActive: true })
        .select('_id locationId name address city state')
        .lean();
      
      return allLocations.map(loc => ({
        ...loc,
        _id: loc._id.toString()
      }));
    }
    
    // For others, return only their accessible locations
    if (userSession.user.locationIds?.length > 0) {
      const locationIds = userSession.user.locationIds.filter(id => id !== "__all__");
      
      const locations = await Location.find({
        _id: { $in: locationIds },
        isActive: true
      })
        .select('_id locationId name address city state')
        .lean();
      
      return locations.map(loc => ({
        ...loc,
        _id: loc._id.toString()
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching accessible locations:", error);
    return [];
  }
}

/**
 * Higher-order function to wrap server actions with location authorization
 * @param {Function} action - The server action to wrap
 * @param {Object} options - Options for checking location access
 * @returns {Function} Wrapped action with location auth enforcement
 */
export function withLocationAuth(action, options = {}) {
  const { 
    locationIdParam = 0,          // Index of the locationId parameter
    locationIdPath = 'locationId', // Path to locationId in an object parameter
    checkParam = true             // Whether to check parameters at all
  } = options;
  
  return async function(...args) {
    try {
      const session = await getSessionWithLocations();
      
      if (!session || !session.user) {
        return {
          status: "ERROR",
          error: "Authentication required"
        };
      }
      
      // Skip location checking for superadmins
      if (session.user.hasAllLocationsAccess || session.user.locationIds?.includes("__all__")) {
        return action(...args, { session });
      }
      
      // Check location access if needed
      if (checkParam) {
        let locationId = null;
        
        // Try to extract locationId from parameters
        if (typeof locationIdParam === 'number' && args[locationIdParam]) {
          if (typeof args[locationIdParam] === 'string') {
            // Direct locationId parameter
            locationId = args[locationIdParam];
          } else if (typeof args[locationIdParam] === 'object') {
            // LocationId in a nested path
            const paths = locationIdPath.split('.');
            let value = args[locationIdParam];
            
            for (const path of paths) {
              value = value?.[path];
              if (value === undefined) break;
            }
            
            locationId = value;
          }
        }
        
        // If locationId was found, check access
        if (locationId) {
          await requireLocationAccess(locationId, session);
        }
      }
      
      // Pass the session to the wrapped action
      return action(...args, { session });
    } catch (error) {
      if (error instanceof UnauthorizedLocationError) {
        return {
          status: "ERROR",
          error: error.message
        };
      }
      
      console.error("Error in withLocationAuth:", error);
      return {
        status: "ERROR",
        error: "An unexpected error occurred"
      };
    }
  };
}

/**
 * Filter a query by user's accessible locations
 * @param {Object} query - Base query object for MongoDB
 * @param {Object} session - User session
 * @returns {Object} Query with location access filters applied
 */
export async function withLocationFilter(query = {}, session = null) {
  const userSession = session || await getSessionWithLocations();
  
  if (!userSession || !userSession.user) {
    throw new UnauthorizedLocationError("Authentication required");
  }
  
  // No filtering needed for superadmins
  if (userSession.user.hasAllLocationsAccess || 
      userSession.user.locationIds?.includes("__all__") ||
      userSession.user.role === "superadmin") {
    return query;
  }
  
  // For others, restrict to their accessible locations
  if (!userSession.user.locationIds || userSession.user.locationIds.length === 0) {
    // If user has no locations, return a query that matches nothing
    return { _id: { $exists: false } };
  }
  
  // Apply location filter to query
  return {
    ...query,
    locationId: { $in: userSession.user.locationIds }
  };
}
