import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trees, FileText, Bird } from "lucide-react";

const ProjectInformation: React.FC = () => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [speciesCount, setSpeciesCount] = useState<number>(0);
    const [treeCount, setTreeCount] = useState<number>(0);
    const [birdCount, setBirdCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/stats`)
            .then((response) => {
                setSpeciesCount(response.data.speciesCount);
                setTreeCount(response.data.treeCount);
                setBirdCount(response.data.birdCount);
            })
            .catch((error) => console.error("Error fetching stats:", error))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-4 bg-white shadow-lg rounded-xl max-w-md mx-auto border border-gray-100">
            <h2 className="text-xl font-serif mb-4 text-gray-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#00958F]" />

                <span className="text-[#00958F]">About The Project</span>
            </h2>
            {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center py-1 border-b border-gray-100">
                        <div className="flex items-center text-gray-700 w-48">
                            <Trees className="w-4 h-4 mr-2 text-[#00958F]" />
                            <span className="text-sm font-medium">Tree Species:</span>
                        </div>
                        <span className="text-sm font-semibold ml-2">{speciesCount}</span>
                    </div>

                    <div className="flex items-center py-1 border-b border-gray-100">
                        <div className="flex items-center text-gray-700 w-48">
                            <Trees className="w-4 h-4 mr-2 text-[#00958F]" />
                            <span className="text-sm font-medium">Total No. of Trees:</span>
                        </div>
                        <span className="text-sm font-semibold ml-2">{treeCount}</span>
                    </div>

                    <div className="flex items-center py-1">
                        <div className="flex items-center text-gray-700 w-48">
                            <Bird className="w-4 h-4 mr-2 text-[#00958F]" />
                            <span className="text-sm font-medium">Bird Species:</span>
                        </div>
                        <span className="text-sm font-semibold ml-2">{birdCount}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectInformation;
