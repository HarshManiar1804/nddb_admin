import React, { useState } from "react";
import TitleBranding from "./components/TitleBranding";
import TreeDataViewer from "./components/TreeDataViewer";
import ProjectInformation from "./components/ProjectInformation";
import MapSection from "./components/MapSection";
import Footer from "./components/Footer";
import MapSelection from "./components/MapSelection";
import type { MapType } from "./utils/utils";
import { useTreeData } from "@/contexts/TreeDataContext";
import BirdsSection from "./components/BirdsSection";

const App: React.FC = () => {
  const [mapType, setMapType] = useState<MapType>("satellite");
  const { dashboardType } = useTreeData();

  const isBirdsDashboard = dashboardType === 'Birds';

  return (
    <div className="flex flex-col h-screen" style={{ fontFamily: "Univers Condensed" }}>
      <TitleBranding />

      {isBirdsDashboard ? (
        // Birds dashboard - Map takes full screen
        <div className="flex-1 w-full">
          <BirdsSection />
        </div>
      ) : (
        // Trees dashboard - Side panel layout
        <div className="flex flex-1">
          <div className="w-full md:w-1/4 space-y-2 p-2">
            <MapSelection mapType={mapType} setMapType={setMapType} />
            <TreeDataViewer />
            <ProjectInformation />
          </div>
          <div className="w-3/4">
            <MapSection mapType={mapType} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default App;