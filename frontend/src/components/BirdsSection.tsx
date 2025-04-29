import { useState, useRef, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { X, Loader } from "lucide-react";
import { Button } from "./ui/button";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { birdColors } from "@/utils/utils";
import GeoTIFFLayer from "./GeoTiffLayer";

const mapOptions = [
    { name: "satellite", url: "https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}" },
    { name: "hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
    { name: "terrain", url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}" },
];

const BirdsSection = ({ mapType = "satellite" }) => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const selectedMap = mapOptions.find((option) => option.name === mapType) || mapOptions[0];
    const [tiffLoading, setTiffLoading] = useState(true); // New state for GeoTIFF loading
    const [birds, setBirds] = useState<Bird[]>([]);
    interface Bird {
        id: number;
        birdname: string;
        scientificname: string;
        bird_type_name?: string;
        birdimage?: string;
        iucnstatus?: string;
        migrationstatus?: string;
        foodpreference?: string;
        habitatpreference?: string;
        globaldistribution?: string;
        ecologicalrole?: string;
        urllink?: string;
        coordinates?: string;
        birds_type?: string;
    }

    const [selectedBird, setSelectedBird] = useState<Bird | null>(null);
    const [loading, setLoading] = useState(false);
    const [markersLoading, setMarkersLoading] = useState(false);
    const [error, setError] = useState("");
    const [markerIcons, setMarkerIcons] = useState<Record<number, L.Icon | L.DivIcon>>({});

    const [showMarkers, setShowMarkers] = useState(false);
    const cancelFetchRef = useRef(false);
    // Define the bird icon using the provided URL
    const defaultIcon = useMemo(() => L.icon({
        iconUrl: 'https://img.icons8.com/?size=100&id=zOoA9kbGQM3w&format=png&color=000000',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }), []);

    // Create a colored bird icon with the specified color
    const createColoredBirdIcon = (color: string) => {
        // Using the bird icon URL but with color parameter
        const iconUrl = `https://img.icons8.com/?size=100&id=zOoA9kbGQM3w&format=png&color=${color.replace('#', '')}`;

        // Create a custom HTML element with a white background
        const iconHtml = `
            <div style="
                position: relative;
                width: 36px;
                height: 36px;
                background-color: white;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            ">
                <img src="${iconUrl}" style="width: 28px; height: 28px;" />
            </div>
        `;

        return L.divIcon({
            html: iconHtml,
            className: 'custom-bird-icon',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
        });
    };

    // Handle cancel button click
    const handleCancelIconConversion = () => {
        cancelFetchRef.current = true;
        setMarkersLoading(false);
        setMarkerIcons({});

    };

    // Fetch birds data from API
    useEffect(() => {
        const fetchBirds = async () => {
            try {
                setMarkersLoading(true);
                const response = await fetch(`${BACKEND_URL}/birds`);
                const data = await response.json();

                // Filter out birds with empty coordinates
                const seenCoordinates = new Set();

                const birdsWithCoordinates = data.filter((bird: { coordinates: string; }) => {
                    const coords = bird.coordinates?.trim();
                    if (!coords || !coords.includes(",")) return false;
                    if (seenCoordinates.has(coords)) return false;
                    seenCoordinates.add(coords);
                    return true;
                });
                setBirds(birdsWithCoordinates);
                processMarkerIcons(birdsWithCoordinates);
            } catch (err) {
                console.error("Failed to fetch birds:", err);
                setError("Failed to load birds data");
                setMarkersLoading(false);
            }
        };

        fetchBirds();

        return () => {
            cancelFetchRef.current = true;
        };
    }, [BACKEND_URL]);

    // Process marker icons for different bird types
    interface BirdData {
        id: number;
        birdname: string;
        scientificname: string;
        bird_type_name?: string;
        birdimage?: string;
        iucnstatus?: string;
        migrationstatus?: string;
        foodpreference?: string;
        habitatpreference?: string;
        globaldistribution?: string;
        ecologicalrole?: string;
        urllink?: string;
        coordinates?: string;
        birds_type?: string;
    }

    interface MarkerIcons {
        [key: number]: L.Icon | L.DivIcon;
    }

    const processMarkerIcons = (birdsData: BirdData[]): void => {
        cancelFetchRef.current = false;
        setShowMarkers(false);
        setMarkerIcons({});

        const typeMap: Map<number, number> = new Map();
        const newIcons: MarkerIcons = {};

        birdsData.forEach((bird, index) => {
            if (cancelFetchRef.current) return;

            // Ensure birds_type is treated as a number
            const birdType = parseInt(bird.birds_type || "0");
            typeMap.set(birdType, birdType);

            const color = birdColors[index + 1];

            newIcons[index] = createColoredBirdIcon(color);
        });

        setMarkerIcons(newIcons);
        setMarkersLoading(false);
        setShowMarkers(true);
    };

    const fetchBirdDetails = async (birdId: number) => {
        setLoading(true)
        setError("");
        try {
            const response = await fetch(`${BACKEND_URL}/birds/${birdId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch bird details");
            }
            setSelectedBird(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || "Failed to load bird details");
            } else {
                setError("Failed to load bird details");
            }
        } finally {
            setLoading(false);
        }
    };

    // Function to parse coordinates string into [lat, lng] array
    const parseCoordinates = (coordinatesString: string) => {
        if (!coordinatesString || typeof coordinatesString !== 'string') {
            return null;
        }

        const parts = coordinatesString.split(',').map(part => parseFloat(part.trim()));
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
            return null;
        }

        return [parts[0], parts[1]];
    };


    return (
        <div className="h-full w-full relative rounded-lg">
            {/* Map Container - updated with specified coordinates and zoom */}
            <MapContainer center={[22.540208, 72.965064]} zoom={16.5} className="h-full w-full rounded-lg z-0">
                <TileLayer url={selectedMap.url} />
                <GeoTIFFLayer setTiffLoading={setTiffLoading} />


                {/* GeoTIFF Loading Overlay */}
                {tiffLoading && (
                    <div className="absolute inset-0  bg-opacity-40 flex flex-col items-center justify-center rounded-lg z-20">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <Loader className="h-12 w-12 mx-auto text-green-500 animate-spin mb-4" />
                        </div>
                    </div>
                )}

                {/* Show markers only after all have been processed */}
                {showMarkers && birds.map((bird, index) => {
                    const position = parseCoordinates(bird.coordinates || "");

                    // Skip birds with invalid coordinates
                    if (!position) return null;

                    return (
                        <Marker
                            key={index}
                            position={position as L.LatLngTuple}
                            icon={markerIcons[index] || defaultIcon}
                            eventHandlers={{
                                click: () => fetchBirdDetails(bird.id),
                                mouseover: (e) => {
                                    e.target.openPopup();
                                },
                                mouseout: (e) => {
                                    e.target.closePopup();
                                }
                            }}
                        >
                            {/* Added a small white background div to make markers more visible */}
                            <div className="bg-white p-1 rounded-full shadow-md border border-gray-200" style={{ width: '8px', height: '8px' }}></div>

                            <Popup>
                                <div className="bg-white p-2 rounded shadow-sm">
                                    <strong>Bird Name:</strong> {bird.birdname}<br />

                                    <strong>Scientific Name:</strong> {bird.scientificname}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Loading Overlay */}
            {markersLoading && (
                <div className="absolute inset-0  bg-opacity-50 flex flex-col items-center justify-center rounded-lg z-10">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <Loader className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                        <p className="text-lg font-medium text-gray-800">Loading Bird Markers...</p>
                        <p className="text-sm text-gray-600 mt-2">Processing bird location data</p>
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

            {/* Sidebar for Bird Details */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transition-transform transform ${selectedBird ? "translate-x-0" : "translate-x-full"
                    } duration-300 ease-in-out overflow-y-auto font-sans`}
            >
                <div className="p-6 space-y-6">
                    {/* Header with close button */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-semibold text-gray-800 font-serif">Bird Details</h2>
                        <button
                            className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                            onClick={() => setSelectedBird(null)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
                            <p>{error}</p>
                        </div>
                    ) : selectedBird ? (
                        <div className="space-y-6">
                            {/* Image with rounded corners and subtle shadow */}
                            {selectedBird.birdimage && (
                                <div className="rounded-lg overflow-hidden shadow-md">
                                    <img
                                        src={selectedBird.birdimage}
                                        alt={selectedBird.birdname || "Bird"}
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                            )}

                            {/* Bird name section */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-blue-800 font-serif mb-1">{selectedBird.birdname}</h3>
                                <p className="text-sm text-blue-700 italic">{selectedBird.scientificname}</p>

                            </div>

                            {/* Details section */}
                            <div className="space-y-3">
                                <h4 className="text-sm uppercase tracking-wider text-gray-500 font-medium">Details</h4>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                    {selectedBird.iucnstatus && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500">IUCN Status</p>
                                            <p className={`font-medium ${selectedBird.iucnstatus.toLowerCase().includes('endangered') ? 'text-red-600' :
                                                selectedBird.iucnstatus.toLowerCase().includes('vulnerable') ? 'text-orange-600' :
                                                    'text-green-600'
                                                }`}>
                                                {selectedBird.iucnstatus}
                                            </p>
                                        </div>
                                    )}

                                    {selectedBird.migrationstatus && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500">Migration Status</p>
                                            <p className="font-medium">{selectedBird.migrationstatus}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Additional details */}
                                <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
                                    {selectedBird.foodpreference && (
                                        <div>
                                            <h5 className="text-gray-500 mb-1">Food Preference</h5>
                                            <p className="text-sm">{selectedBird.foodpreference}</p>
                                        </div>
                                    )}

                                    {selectedBird.habitatpreference && (
                                        <div>
                                            <h5 className="text-gray-500 mb-1">Habitat Preference</h5>
                                            <p className="text-sm">{selectedBird.habitatpreference}</p>
                                        </div>
                                    )}

                                    {selectedBird.globaldistribution && (
                                        <div>
                                            <h5 className="text-gray-500 mb-1">Global Distribution</h5>
                                            <p className="text-sm">{selectedBird.globaldistribution}</p>
                                        </div>
                                    )}

                                    {selectedBird.ecologicalrole && (
                                        <div>
                                            <h5 className="text-gray-500 mb-1">Ecological Role</h5>
                                            <p className="text-sm">{selectedBird.ecologicalrole}</p>
                                        </div>
                                    )}

                                    {selectedBird.urllink && (
                                        <Button asChild className="bg-blue-600 hover:bg-blue-800 cursor-pointer flex items-end">
                                            <a href={selectedBird.urllink} target="_blank" rel="noopener noreferrer">
                                                More Info
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500 text-center">
                            <div>
                                <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="mt-2">Select a bird on the map to view its details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BirdsSection;