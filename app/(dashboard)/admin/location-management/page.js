import SquareButton from "@/components/Button/SquareButton";
import { add_location, edit_location } from "@/public/images";

export default function Page() {
  return (
    <div className="flex h-screen justify-center items-center">
      {/* Location Management Options */}
      <div className="flex justify-center items-center gap-12">
        {/* Add Location */}
        <SquareButton
          text="Add Location"
          imageUrl={add_location}
          redirectUrl="/admin/location-management/add-location"
        />

        {/* View/Edit Locations */}
        <SquareButton
          text="Manage Locations"
          imageUrl={edit_location}
          redirectUrl="/admin/location-management/manage-locations"
        />
      </div>
    </div>
  );
}
