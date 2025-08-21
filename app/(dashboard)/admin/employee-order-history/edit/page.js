"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OrderEditModal from "@/components/OrderEditModal/OrderEditModal";

export default function OrderHistoryView() {
  const router = useRouter();
  const [selectedOrderType, setSelectedOrderType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (type) => {
    setSelectedOrderType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen justify-center items-center px-4">
      <div className="flex flex-wrap justify-center items-center gap-8 w-full max-w-8xl">
        <button
          onClick={() => handleOpenModal("sysco")}
          className="w-60 h-60 text-lg flex flex-col items-center justify-center font-semibold border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300 hover:text-red-500"
        >
          SYSCO
        </button>

        <button
          onClick={() => handleOpenModal("restaurant-depot")}
          className="w-60 h-60  text-lg flex flex-col items-center justify-center font-semibold border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300 hover:text-red-500"
        >
          RESTAURANT DEPOT
        </button>

        <button
          onClick={() => handleOpenModal("uschef")}
          className="w-60 h-60  text-lg flex flex-col items-center justify-center font-semibold border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300 hover:text-red-500"
        >
          USCHEF
        </button>

        <button
          onClick={() => handleOpenModal("special-online")}
          className="w-60 h-60  text-lg flex flex-col items-center justify-center font-semibold border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300 hover:text-red-500"
        >
          SPECIAL ONLINE ORDER
        </button>
      </div>

      {selectedOrderType && (
        <OrderEditModal 
          orderType={selectedOrderType} 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}
