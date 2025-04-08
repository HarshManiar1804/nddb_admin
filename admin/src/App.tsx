import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
// Import all page components
import Botany from "./pages/Botany";
import Campus from "./pages/Campus";
import Species from "./pages/Species";
import TreeLocation from "./pages/TreeLocation";
import TreeImage from "./pages/TreeImage";
import SpeciesUsage from "./pages/SpeciesUsage";

// Layout component to maintain consistent structure
const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Campus />} />
          <Route path="/botany" element={<Botany />} />
          <Route path="/campus" element={<Campus />} />
          <Route path="/species" element={<Species />} />
          <Route path="/tree-geolocation" element={<TreeLocation />} />
          <Route path="/tree-image" element={<TreeImage />} />
          <Route path="/species-usage" element={<SpeciesUsage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
