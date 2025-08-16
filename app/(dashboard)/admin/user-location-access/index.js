import SquareButton from "@/components/Button/SquareButton";
import { edit_staff, staff_management } from "@/public/images";

export default function UserLocationAccessIndex() {
  return (
    <div className="h-screen overflow-auto p-4">
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex justify-center items-center gap-12">
          <SquareButton
            text="Manage User Location Access"
            imageUrl={staff_management}
            redirectUrl="/admin/user-location-access/manage"
          />
        </div>
      </div>
    </div>
  );
}
