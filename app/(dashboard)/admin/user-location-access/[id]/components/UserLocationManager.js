"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  getUserLocationAccess,
  getAvailableLocationsForUser,
  addUserLocationAccess,
  removeUserLocationAccess
} from "@/lib/actions/userLocationAccess";
import { useSession } from "@/context/SessionContext";

export default function UserLocationManager({ user }) {
  const { toast } = useToast();
  const currentUser = useSession();
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [selectedToAssign, setSelectedToAssign] = useState([]);
  const [selectedToRemove, setSelectedToRemove] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch assigned locations
        const assignedResult = await getUserLocationAccess(user._id);
        if (assignedResult.status === "SUCCESS") {
          setAssignedLocations(assignedResult.data || []);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: assignedResult.error || "Failed to fetch assigned locations"
          });
        }

        // Fetch available locations
        const availableResult = await getAvailableLocationsForUser(user._id);
        if (availableResult.status === "SUCCESS") {
          setAvailableLocations(availableResult.data || []);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: availableResult.error || "Failed to fetch available locations"
          });
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user._id, toast, refreshKey]);

  const handleAssignLocations = async () => {
    if (selectedToAssign.length === 0) {
      toast({
        variant: "default",
        title: "Info",
        description: "No locations selected to assign"
      });
      return;
    }

    try {
      const result = await addUserLocationAccess(user._id, selectedToAssign);
      if (result.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Success",
          description: "Location access assigned successfully"
        });
        setSelectedToAssign([]);
        setRefreshKey(prev => prev + 1); // Trigger a refresh
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to assign location access"
        });
      }
    } catch (error) {
      console.error("Error assigning locations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    }
  };

  const handleRemoveLocations = async () => {
    if (selectedToRemove.length === 0) {
      toast({
        variant: "default",
        title: "Info",
        description: "No locations selected to remove"
      });
      return;
    }

    try {
      const result = await removeUserLocationAccess(user._id, selectedToRemove);
      if (result.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Success",
          description: "Location access removed successfully"
        });
        setSelectedToRemove([]);
        setRefreshKey(prev => prev + 1); // Trigger a refresh
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to remove location access"
        });
      }
    } catch (error) {
      console.error("Error removing locations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    }
  };

  const toggleAssignSelection = (locationId) => {
    setSelectedToAssign(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const toggleRemoveSelection = (locationId) => {
    setSelectedToRemove(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-auto pb-8">
      {/* Current Access Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Current Access</h2>
        
        {assignedLocations.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded text-center">
            <p className="text-gray-500">No locations assigned</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="max-h-[60vh] overflow-y-auto border rounded-md">
                {assignedLocations.map(location => (
                  <div 
                    key={location._id}
                    className={`p-3 border-b flex items-center gap-3 hover:bg-gray-50 ${
                      selectedToRemove.includes(location._id) ? 'bg-red-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`remove-${location._id}`}
                      checked={selectedToRemove.includes(location._id)}
                      onChange={() => toggleRemoveSelection(location._id)}
                      className="h-5 w-5 text-red-600 rounded"
                    />
                    <label htmlFor={`remove-${location._id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{location.name}</div>
                      <div className="text-xs text-gray-500">
                        {location.address}, {location.city}, {location.state}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleRemoveLocations}
                disabled={selectedToRemove.length === 0}
                className={`px-4 py-2 text-white rounded-md font-medium transition duration-300 ${
                  selectedToRemove.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Remove Selected ({selectedToRemove.length})
              </button>
            </div>
          </>
        )}
      </div>

      {/* Available Locations Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Available Locations</h2>
        
        {availableLocations.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded text-center">
            <p className="text-gray-500">No available locations to assign</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="max-h-[60vh] overflow-y-auto border rounded-md">
                {availableLocations.map(location => (
                  <div 
                    key={location._id}
                    className={`p-3 border-b flex items-center gap-3 hover:bg-gray-50 ${
                      selectedToAssign.includes(location._id) ? 'bg-green-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`assign-${location._id}`}
                      checked={selectedToAssign.includes(location._id)}
                      onChange={() => toggleAssignSelection(location._id)}
                      className="h-5 w-5 text-green-600 rounded"
                    />
                    <label htmlFor={`assign-${location._id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{location.name}</div>
                      <div className="text-xs text-gray-500">
                        {location.address}, {location.city}, {location.state}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleAssignLocations}
                disabled={selectedToAssign.length === 0}
                className={`px-4 py-2 text-white rounded-md font-medium transition duration-300 ${
                  selectedToAssign.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#ED1C24] hover:bg-red-600'
                }`}
              >
                Assign Selected ({selectedToAssign.length})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
