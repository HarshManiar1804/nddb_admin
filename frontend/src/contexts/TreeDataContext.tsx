import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Botany, Species } from "../utils/utils";

interface TreeCoordinates {
    latitude: number;
    longitude: number;
    treename: string;
    id: number;
}

interface BirdData {
    bird_type_name: string;
    id: number;
    birdname: string;
    scientificname: string;
    birds_type: number;
    iucnstatus: string;
    migrationstatus: string;
    foodpreference: string;
    habitatpreference: string;
    globaldistribution: string;
    ecologicalrole: string;
    birdimage?: string;
    urllink?: string;
    coordinates?: string;
    isactive: boolean;
    qrcode?: string;
}

interface TreeDataContextType {
    botanyList: Botany[];
    selectedBotany: string[];
    setSelectedBotany: React.Dispatch<React.SetStateAction<string[]>>;
    speciesList: Species[];
    selectedSpecies: string[];
    setSelectedSpecies: React.Dispatch<React.SetStateAction<string[]>>;
    treeCoordinates: TreeCoordinates[];
    birdsData: BirdData[];
    loading: boolean;
    error: string | null;
    dashboardType: "Trees" | "Birds";
    setDashboardType: React.Dispatch<React.SetStateAction<"Trees" | "Birds">>;
}

const TreeDataContext = createContext<TreeDataContextType | undefined>(undefined);

export const TreeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [botanyList, setBotanyList] = useState<Botany[]>([]);
    const [selectedBotany, setSelectedBotany] = useState<string[]>([]);
    const [speciesList, setSpeciesList] = useState<Species[]>([]);
    const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
    const [treeCoordinates, setTreeCoordinates] = useState<TreeCoordinates[]>([]);
    const [birdsData, setBirdsData] = useState<BirdData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dashboardType, setDashboardType] = useState<"Trees" | "Birds">("Trees");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Reset selections and fetch initial data when dashboard type changes
    useEffect(() => {
        setLoading(true);
        setError(null);

        // Reset selections when dashboard type changes
        setSelectedBotany([]);
        setSelectedSpecies([]);

        // Fetch botany list
        axios.get(`${backendUrl}/botany`)
            .then((response) => setBotanyList(response.data))
            .catch((error) => {
                console.error(`Error fetching botany data:`, error);
                setError(`Failed to fetch botany data: ${error.message}`);
            })
            .finally(() => setLoading(false));

        // Only fetch birds data when dashboardType is "Birds"
        if (dashboardType === "Birds") {
            setLoading(true);
            axios.get(`${backendUrl}/birds`)
                .then((response) => {
                    setBirdsData(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching birds data:", error);
                    setError(`Failed to fetch birds data: ${error.message}`);
                })
                .finally(() => setLoading(false));
        }
    }, [backendUrl, dashboardType]);

    // Fetch species when selectedBotany changes
    useEffect(() => {
        if (selectedBotany.length === 0) {
            setSpeciesList([]);
            return;
        }

        if (dashboardType === "Trees") {
            setLoading(true);
            setError(null);

            axios.post(`${backendUrl}/species`, { botanyIds: selectedBotany.map(Number) })
                .then((response) => setSpeciesList(response.data))
                .catch((error) => {
                    console.error(`Error fetching tree species data:`, error);
                    setError(`Failed to fetch tree species data: ${error.message}`);
                })
                .finally(() => setLoading(false));
        }
        // Not making any API call for bird species since the endpoint doesn't exist
    }, [selectedBotany, backendUrl, dashboardType]);

    // Fetch coordinates/data when selectedSpecies changes
    useEffect(() => {
        if (selectedSpecies.length === 0) {
            if (dashboardType === "Trees") {
                setTreeCoordinates([]);
            }
            return;
        }

        if (dashboardType === "Trees") {
            setLoading(true);
            setError(null);


            axios.post(`${backendUrl}/geolocation`, { speciesIDs: selectedSpecies.map(Number) })
                .then((response) => {
                    setTreeCoordinates(response.data);
                })
                .catch((error) => {
                    console.error(`Error fetching tree location data:`, error);
                    setError(`Failed to fetch tree location data: ${error.message}`);
                })
                .finally(() => setLoading(false));

        }
        // No /bird-geolocation endpoint to call
    }, [selectedSpecies, backendUrl, dashboardType]);

    return (
        <TreeDataContext.Provider
            value={{
                botanyList,
                selectedBotany,
                setSelectedBotany,
                speciesList,
                selectedSpecies,
                setSelectedSpecies,
                treeCoordinates,
                birdsData,
                loading,
                error,
                dashboardType,
                setDashboardType
            }}
        >
            {children}
        </TreeDataContext.Provider>
    );
};

export const useTreeData = () => {
    const context = useContext(TreeDataContext);
    if (!context) {
        throw new Error("useTreeData must be used within a TreeDataProvider");
    }
    return context;
};