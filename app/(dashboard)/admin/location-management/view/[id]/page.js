"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLocationById } from "@/lib/actions/location";
import { useToast } from "@/hooks/use-toast";

export default function ViewLocation() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const result = await getLocationById(id);
        if (result.status === "SUCCESS") {
          setLocation(result.data);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Failed to fetch location details",
          });
          router.push("/admin/location-management/manage-locations");
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching location details",
        });
        router.push("/admin/location-management/manage-locations");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLocation();
    }
  }, [id, router, toast]);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="mt-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen p-8">
        <div className="mt-8 text-center">
          <p className="text-xl text-gray-600">Location not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      
      <div className="mt-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">{location.name}</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Location Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">ID:</span> {location.locationId}
                </div>
                <div>
                  <span className="font-medium">Full Address:</span>
                  <p className="mt-1">
                    {location.address}<br />
                    {location.city}, {location.state} {location.zipCode}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Phone Number:</span> {location.phoneNumber || "N/A"}
                </div>
              </div>
            </div>
            
            <div className="md:border-l md:pl-6">
              <h2 className="text-lg font-semibold mb-2">Management Options</h2>
              <div className="space-y-4">
                <button
                  onClick={() => router.push(`/admin/location-management/edit/${location._id}`)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
                >
                  Edit Location
                </button>
                <button
                  onClick={() => router.back()}
                  className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
