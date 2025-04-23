import React, { useState, useRef, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { useTreeData } from "@/contexts/TreeDataContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { X, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { campusColors } from "@/utils/utils";
import L from "leaflet";
import GeoTIFFLayer from "./GeoTiffLayer";

const mapOptions = [
    { name: "satellite", url: "https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}" },
    { name: "hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
    { name: "terrain", url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}" },
];
interface MarkerIcons {
    [key: number]: L.Icon | L.DivIcon;
}
interface MapType {
    mapType: string;
}

const MapSection: React.FC<MapType> = ({ mapType }) => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const selectedMap = mapOptions.find((option) => option.name === mapType) || mapOptions[0];

    const { treeCoordinates } = useTreeData();
    interface TreeDetails {
        id: number;
        treename: string;
        scientificname?: string;
        hindiname?: string;
        treeimageurl?: string;
        latitude: string;
        longitude: string;
        iucnstatus?: string;
        centreoforigin?: string;
        geographicaldistribution?: string;
        link?: string;
    }

    const [selectedTree, setSelectedTree] = useState<TreeDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [markersLoading, setMarkersLoading] = useState(false);
    const [tiffLoading, setTiffLoading] = useState(true); // New state for GeoTIFF loading
    const [error, setError] = useState("");
    const [markerIcons, setMarkerIcons] = useState<{ [key: number]: L.Icon | L.DivIcon }>({});
    const [showMarkers, setShowMarkers] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0); // Track progress percentage
    const cancelFetchRef = useRef(false);

    // Define the default icon once
    const defaultIcon = useMemo(() => L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }), []);

    // Create a colored circle SVG icon for different tree species
    const createColoredIcon = (color: string) => {
        return L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #FFF; box-shadow: 0 0 3px rgba(0,0,0,0.5);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });
    };

    // Handle cancel button click
    const handleCancelIconConversion = () => {
        cancelFetchRef.current = true;
        setMarkersLoading(false);
        setMarkerIcons({});
        setProcessingProgress(0);
    };

    useEffect(() => {
        const fetchTreeSpecies = async () => {
            if (treeCoordinates.length === 0) return;

            cancelFetchRef.current = false;
            setMarkersLoading(true);
            setShowMarkers(false);
            setMarkerIcons({});
            setProcessingProgress(0);

            const speciesMap = new Map<string, number>();
            let speciesCounter = 0;
            const newIcons: MarkerIcons = {};
            const totalTrees = treeCoordinates.length;

            // Process trees in batches with delay to prevent skipping
            const processBatch = async (startIndex: number, batchSize: number) => {
                if (cancelFetchRef.current) return;

                const endIndex = Math.min(startIndex + batchSize, totalTrees);
                const promises = [];

                for (let i = startIndex; i < endIndex; i++) {
                    const tree = treeCoordinates[i];
                    const treeGeoID = tree.id;

                    const promise = fetch(`${BACKEND_URL}/species/details/${treeGeoID}`)
                        .then(response => response.json())
                        .then(data => {
                            if (cancelFetchRef.current) return;

                            const speciesKey = data.scientificname || data.treename || 'unknown';

                            if (!speciesMap.has(speciesKey)) {
                                speciesMap.set(speciesKey, speciesCounter++);
                            }

                            const colorIndex = speciesMap.get(speciesKey)!;
                            const color = campusColors[colorIndex];

                            newIcons[i] = createColoredIcon(color);
                        })
                        .catch(() => {
                            if (cancelFetchRef.current) return;
                            newIcons[i] = defaultIcon;
                        });

                    promises.push(promise);
                }

                await Promise.allSettled(promises);

                // Update progress
                setProcessingProgress(Math.round((endIndex / totalTrees) * 100));

                // If there are more trees to process, schedule the next batch
                if (endIndex < totalTrees && !cancelFetchRef.current) {
                    // Add a delay between batches to prevent overwhelming the browser
                    await new Promise(resolve => setTimeout(resolve, 30));
                    return processBatch(endIndex, batchSize);
                } else {
                    // All done or cancelled
                    if (!cancelFetchRef.current) {
                        setMarkerIcons(newIcons);
                        setMarkersLoading(false);
                        setShowMarkers(true);
                    }
                    return;
                }
            };

            // Start processing in batches of 20 trees
            await processBatch(0, 20);
        };

        fetchTreeSpecies();

        return () => {
            cancelFetchRef.current = true;
        };
    }, [treeCoordinates, defaultIcon]);

    const fetchTreeDetails = async (treeGeoID: number) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${BACKEND_URL}/species/details/${treeGeoID}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch tree details");
            }
            setSelectedTree(data);
        } catch {
            setError("Failed to fetch tree details");
        } finally {
            setLoading(false);
        }
    };

    // Function to get correct position for tree markers
    const getCorrectPosition = (tree: { latitude: number; longitude: number }): [number, number] => {
        // Check if the coordinates are in the correct format
        // Latitude should be between -90 and 90, Longitude between -180 and 180
        const lat = tree.latitude;
        const lng = tree.longitude;

        // If coordinates are swapped (which appears to be the case)
        if (lat > 90 || lat < -90 || lng > 180 || lng < -180) {
            // Swap lat and lng
            return [tree.longitude, tree.latitude];
        }

        return [lat, lng];
    };

    return (
        <div className="h-full w-full relative rounded-lg">
            {/* Map Container */}
            <MapContainer center={[22.540208, 72.965064]} zoom={17} className="h-full w-full rounded-lg z-0">
                <TileLayer url={selectedMap.url} attribution="&copy; OpenStreetMap contributors" />
                <GeoTIFFLayer setTiffLoading={setTiffLoading} />

                {/* Show markers only after all have been processed */}
                {showMarkers && treeCoordinates.map((tree, index) => {
                    // Get correct position with swapped coordinates if needed
                    const position = getCorrectPosition(tree);

                    return (
                        <Marker
                            key={index}
                            position={position}
                            icon={markerIcons[index] || defaultIcon}
                            eventHandlers={{
                                click: () => fetchTreeDetails(tree.id),
                                mouseover: (e: L.LeafletMouseEvent) => {
                                    e.target.openPopup();
                                },
                                mouseout: (e: L.LeafletMouseEvent) => {
                                    e.target.closePopup();
                                }
                            }}
                        >
                            <Popup>
                                <div>
                                    <strong>Tree Name:</strong> {tree.treename}<br />
                                    <strong>Coordinates:</strong> {position[0]}, {position[1]}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* GeoTIFF Loading Overlay */}
            {tiffLoading && (
                <div className="absolute inset-0  bg-opacity-40 flex flex-col items-center justify-center rounded-lg z-20">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <Loader className="h-12 w-12 mx-auto text-green-500 animate-spin mb-4" />
                    </div>
                </div>
            )}

            {/* Loading Overlay for markers */}
            {markersLoading && (
                <div className="absolute inset-0  bg-opacity-50 flex flex-col items-center justify-center rounded-lg z-10">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <Loader className="h-12 w-12 mx-auto text-green-500 animate-spin mb-4" />
                        <p className="text-lg font-medium text-gray-800">Loading Trees ...</p>
                        <p className="text-sm text-gray-600 mt-2">Processing {processingProgress}% complete</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                            <div
                                className="bg-green-600 h-2.5 rounded-full"
                                style={{ width: `${processingProgress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Button for Marker Loading */}
            {markersLoading && (
                <Button
                    onClick={handleCancelIconConversion}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 z-20 flex items-center gap-2"
                >
                    <X size={18} />
                    <span>Cancel</span>
                </Button>
            )}

            {/* Sidebar for Tree Details */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transition-transform transform ${selectedTree ? "translate-x-0" : "translate-x-full"
                    } duration-300 ease-in-out overflow-y-auto font-sans`}
            >
                <div className="p-6 space-y-6">
                    {/* Header with close button */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-semibold text-gray-800 font-serif">Tree Details</h2>
                        <button
                            className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                            onClick={() => setSelectedTree(null)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
                            <p>{error}</p>
                        </div>
                    ) : selectedTree ? (
                        <div className="space-y-6">
                            {/* Image with rounded corners and subtle shadow */}
                            <div className="rounded-lg overflow-hidden shadow-md">
                                <img
                                    src={selectedTree.treeimageurl}
                                    alt={selectedTree.treename || "Tree"}
                                    className="w-full h-48 object-cover"
                                />
                            </div>

                            {/* Tree name section */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-green-800 font-serif mb-1">{selectedTree.treename}</h3>
                                <p className="text-sm text-green-700 italic">{selectedTree.scientificname}</p>
                                {selectedTree.hindiname && (
                                    <p className="text-sm text-green-700 mt-1">हिंदी: {selectedTree.hindiname}</p>
                                )}
                            </div>

                            {/* Details section */}
                            <div className="space-y-3">
                                <h4 className="text-sm uppercase tracking-wider text-gray-500 font-medium">Details</h4>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Latitude</p>
                                        <p className="font-medium">
                                            {parseFloat(selectedTree.longitude).toFixed(5)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Longitude</p>
                                        <p className="font-medium">
                                            {parseFloat(selectedTree.latitude).toFixed(5)}
                                        </p>
                                    </div>
                                    {selectedTree.iucnstatus && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500">IUCN Status</p>
                                            <p className={`font-medium ${selectedTree.iucnstatus.toLowerCase().includes('endangered') ? 'text-red-600' :
                                                selectedTree.iucnstatus.toLowerCase().includes('vulnerable') ? 'text-orange-600' :
                                                    'text-green-600'
                                                }`}>
                                                {selectedTree.iucnstatus}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Origin and distribution with more space */}
                                {(selectedTree.centreoforigin || selectedTree.geographicaldistribution) && (
                                    <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
                                        {selectedTree.centreoforigin && (
                                            <div>
                                                <h5 className="text-gray-500 mb-1">Centre of Origin</h5>
                                                <p className="text-sm">{selectedTree.centreoforigin}</p>
                                            </div>
                                        )}
                                        {selectedTree.geographicaldistribution && (
                                            <div>
                                                <h5 className="text-gray-500 mb-1">Geographical Distribution</h5>
                                                <p className="text-sm">{selectedTree.geographicaldistribution}</p>
                                            </div>
                                        )}
                                        {selectedTree.link && (
                                            <Button asChild className="bg-green-600 hover:bg-green-800 cursor-pointer flex items-end">
                                                <a href={selectedTree.link} target="_blank" rel="noopener noreferrer">
                                                    More Info
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500 text-center">
                            <div>
                                <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="mt-2">Select a tree on the map to view its details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapSection;