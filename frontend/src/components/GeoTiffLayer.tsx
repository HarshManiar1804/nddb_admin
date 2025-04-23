import React, { useRef, useEffect } from "react";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useMap } from "react-leaflet";

const GeoTIFFLayer: React.FC<{ setTiffLoading: (loading: boolean) => void }> = ({ setTiffLoading }) => {
    const map = useMap();
    const layerRef = useRef<L.TileLayer.WMS | null>(null);
    const GEOSERVER_URL = import.meta.env.VITE_GEOSERVER_URL;

    // Your GeoServer WMS URL
    const geoserverUrl = `${GEOSERVER_URL}/nddb/wms`;

    useEffect(() => {
        // Set loading state to true before creating WMS layer
        setTiffLoading(true);

        // Create a WMS layer
        const wmsLayer = L.tileLayer.wms(geoserverUrl, {
            layers: 'nddb:output_cog',  // Your layer name
            format: 'image/png',   // Or another format supported by your GeoServer
            transparent: true,
            version: '1.1.0',
            attribution: "GeoServer WMS",
            tileSize: 256,            // Try 512 if your source raster is large
            detectRetina: true,
        });

        // Set up loading events
        wmsLayer.on('loading', () => {
            setTiffLoading(true);
        });

        wmsLayer.on('load', () => {
            setTiffLoading(false);
        });

        // Set up error handling
        wmsLayer.on('tileerror', (error) => {
            console.error("Tile loading error:", error);
            setTiffLoading(false);
        });

        if (layerRef.current) {
            map.removeLayer(layerRef.current);
        }

        layerRef.current = wmsLayer;
        wmsLayer.addTo(map);

        // Set a timeout to handle cases where the 'load' event might not fire
        const timeoutId = setTimeout(() => {
            setTiffLoading(false);
        }, 10000); // 10 seconds timeout

        return () => {
            clearTimeout(timeoutId);
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [map, setTiffLoading]);

    return null;
};

export default GeoTIFFLayer;   