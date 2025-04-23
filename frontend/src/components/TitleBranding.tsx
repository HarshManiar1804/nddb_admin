import React from "react";
import { useTreeData } from "@/contexts/TreeDataContext";

const TitleBranding: React.FC = () => {
    const { dashboardType, setDashboardType } = useTreeData();

    return (
        <header className="flex items-center p-2 py-0">
            {/* Logo on the left */}
            <img src="/logo.png" alt="NDDB Logo" className="h-10 my-4" />

            {/* Title centered */}
            <div className="flex-1 text-[#00958F] text-center text-2xl font-semibold font-[Times_New_Roman]">
                NDDB DIGITAL BIODIVERSITY MAP
            </div>

            {/* Dashboard Type Toggle on the right */}
            <div className="flex items-center bg-white bg-opacity-70 rounded-md shadow-md px-2 py-1">
                <button
                    onClick={() => setDashboardType("Trees")}
                    className={`px-4 py-1 transition-all duration-300 rounded-md ${dashboardType === "Trees"
                        ? "font-bold text-[#00958F]"
                        : "font-light text-gray-500"
                        }`}
                >
                    Trees
                </button>
                <button
                    onClick={() => setDashboardType("Birds")}
                    className={`px-4 py-1 transition-all duration-300 rounded-md ${dashboardType === "Birds"
                        ? "font-bold text-[#00958F]"
                        : "font-light text-gray-500"
                        }`}
                >
                    Birds
                </button>
            </div>
        </header>
    );
};

export default TitleBranding;
