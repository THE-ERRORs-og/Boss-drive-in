"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import connectDB from "../mongodb";
import Location from "../../models/Location";

/**
 * Retrieves all active locations from the database for which he is authorised
 * @returns {Promise<Object>} List of locations or error response
 */
export async function getAllLocations() {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const locationIds = session.user.locationIds || [];

    const query = { isActive: true };
    if(session.user.role!=="superadmin"){
      query._id = { $in: locationIds };
    }
    const locations = await Location.find(query)
      .select('_id locationId name address city state zipCode phoneNumber')
      .lean();

    // Ensure we return serializable data
    const serializedLocations = locations.map(location => ({
      ...location,
      _id: location._id.toString()
    }));

    return {
      status: "SUCCESS",
      data: serializedLocations
    };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch locations"
    };
  }
}

/**
 * Creates a new location in the database
 * @param {Object} locationData - The location data to create
 * @returns {Promise<Object>} Created location or error response
 */
export async function createLocation(locationData) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Check if locationId already exists
    const existingLocation = await Location.findOne({ locationId: locationData.locationId.toLowerCase() });
    if (existingLocation) {
      return parseServerActionResponse({
        error: "Location ID already exists",
        status: "ERROR",
      });
    }

    // Create new location
    const newLocation = await Location.create({
      ...locationData,
      locationId: locationData.locationId.toLowerCase(),
      createdBy: session.user.id,
      isActive: true
    });

    // Ensure we return serializable data
    const serializedLocation = {
      _id: newLocation._id.toString(),
      locationId: newLocation.locationId,
      name: newLocation.name,
      address: newLocation.address,
      city: newLocation.city,
      state: newLocation.state,
      zipCode: newLocation.zipCode,
      phoneNumber: newLocation.phoneNumber
    };

    return {
      status: "SUCCESS",
      data: serializedLocation
    };
  } catch (error) {
    console.error("Error creating location:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to create location"
    };
  }
}

/**
 * Deletes a location by ID (soft delete - sets isActive to false)
 * @param {string} locationId - The ID of the location to delete
 * @returns {Promise<Object>} Deleted location or error response
 */
export async function deleteLocation(locationId) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Soft delete by setting isActive to false
    const deletedLocation = await Location.findByIdAndUpdate(
      locationId,
      { $set: { isActive: false } },
      { new: true }
    ).select('_id locationId name').lean();

    if (!deletedLocation) {
      return parseServerActionResponse({
        error: "Location not found",
        status: "ERROR",
      });
    }

    // Ensure we return serializable data
    const serializedLocation = {
      ...deletedLocation,
      _id: deletedLocation._id.toString()
    };

    return {
      status: "SUCCESS",
      data: serializedLocation
    };
  } catch (error) {
    console.error("Error deleting location:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to delete location"
    };
  }
}

/**
 * Gets a single location by ID
 * @param {string} locationId - The ID of the location to retrieve
 * @returns {Promise<Object>} Location or error response
 */
export async function getLocationById(locationId) {
  const session = await auth();
  if (!session || !session.user ) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const location = await Location.findOne({ _id: locationId, isActive: true })
      .select('_id locationId name address city state zipCode phoneNumber')
      .lean();

    if (!location) {
      return parseServerActionResponse({
        error: "Location not found",
        status: "ERROR",
      });
    }

    // Ensure we return serializable data
    const serializedLocation = {
      ...location,
      _id: location._id.toString()
    };

    return {
      status: "SUCCESS",
      data: serializedLocation
    };
  } catch (error) {
    console.error("Error fetching location:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch location"
    };
  }
}

/**
 * Updates an existing location in the database
 * @param {Object} locationData - The location data to update
 * @returns {Promise<Object>} Updated location or error response
 */
export async function updateLocation(locationData) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Extract the _id from the locationData
    const { _id, ...updateData } = locationData;

    if (!_id) {
      return parseServerActionResponse({
        error: "Location ID is required",
        status: "ERROR",
      });
    }

    // Remove locationId from updateData if it exists, as we don't want to update that
    const { locationId, ...fieldsToUpdate } = updateData;

    // Update the location
    const updatedLocation = await Location.findByIdAndUpdate(
      _id,
      { $set: fieldsToUpdate },
      { new: true }
    ).select('_id locationId name address city state zipCode phoneNumber').lean();

    if (!updatedLocation) {
      return parseServerActionResponse({
        error: "Location not found",
        status: "ERROR",
      });
    }

    // Ensure we return serializable data
    const serializedLocation = {
      ...updatedLocation,
      _id: updatedLocation._id.toString()
    };

    return {
      status: "SUCCESS",
      data: serializedLocation
    };
  } catch (error) {
    console.error("Error updating location:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to update location"
    };
  }
}
