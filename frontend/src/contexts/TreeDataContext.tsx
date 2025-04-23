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
    birdsData: BirdData[]; // New birds data
    loading: boolean;
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
    const [birdsData, setBirdsData] = useState<BirdData[]>([]); // New birds data state
    const [loading, setLoading] = useState(false);
    const [dashboardType, setDashboardType] = useState<"Trees" | "Birds">("Trees");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    useEffect(() => {
        if (dashboardType === "Birds") {
            setLoading(true);
            axios.get('http://localhost:5001/api/birds')
                .then((response) => {
                    setBirdsData(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching birds data:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [dashboardType]);

    // Fetch botany list on mount or when dashboard type changes
    useEffect(() => {
        const endpoint = "/botany";

        setSelectedBotany([]);
        setSelectedSpecies([]);

        axios.get(`${backendUrl}${endpoint}`)
            .then((response) => setBotanyList(response.data))
            .catch((error) => console.error(`Error fetching ${dashboardType.toLowerCase()} data:`, error));
    }, [backendUrl, dashboardType]);

    // Fetch species when selectedBotany changes
    useEffect(() => {
        if (selectedBotany.length === 0) {
            setSpeciesList([]); // Clear species list if no botany is selected
            return;
        }

        setLoading(true);

        const endpoint = dashboardType === "Trees" ? "/species" : "/bird-species";

        axios.post(`${backendUrl}${endpoint}`, { botanyIds: selectedBotany.map(Number) })
            .then((response) => setSpeciesList(response.data))
            .catch((error) => console.error(`Error fetching ${dashboardType.toLowerCase()} species data:`, error))
            .finally(() => setLoading(false));
    }, [selectedBotany, backendUrl, dashboardType]);

    // Fetch coordinates when selectedSpecies changes
    useEffect(() => {
        if (selectedSpecies.length === 0) {
            setTreeCoordinates([]); // Clear coordinates if no species is selected
            return;
        }

        setLoading(true);

        const endpoint = dashboardType === "Trees" ? "/geolocation" : "/bird-geolocation";

        axios.post(`${backendUrl}${endpoint}`, { speciesIDs: selectedSpecies.map(Number) })
            .then((response) => setTreeCoordinates(response.data))
            .catch((error) => console.error(`Error fetching ${dashboardType.toLowerCase()} geolocation data:`, error))
            .finally(() => setLoading(false));
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
                birdsData, // Expose birds data
                loading,
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