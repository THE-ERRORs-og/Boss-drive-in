import ScrollViewer from "@/components/ScrollViewer/ScrollViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownWideNarrow, ListFilter, Search } from "lucide-react";

export default function DailySafeBalance() {
 
  return (
    <div className="p-8 h-screen w-screen flex flex-col items-center space-y-4 ">
      <div className="flex w-full lg:w-1/2 items-center space-x-2 ">
        <Button className="bg-white text-xl text-black border border-gray-300 hover:bg-gray-300 " varient="outline">
          Filter   <ListFilter  className="!size-6"/>
        </Button>
      
        <div className="relative w-full">
          <Input type="search" className="bg-white text-black border border-gray-300" placeholder="Search for keyword" />
          <div className="absolute bg-white m-1 inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search />
          </div>
        </div>
        
        <Button className="bg-white text-xl text-black border border-gray-300 hover:bg-gray-300 " varient="outline">
          Sort <ArrowDownWideNarrow  className="!size-6"/>
        </Button>
      
      </div>
      <ScrollViewer />
    </div>
  );
}
