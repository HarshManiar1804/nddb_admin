import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
import SignIn from "./components/SignIn"; // Import the SignIn component
import BirdManagement from "./pages/Birds";
import BirdTypes from "./pages/BirdsType";

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

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("adminToken") !== null;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const token = localStorage.getItem("adminToken");
    setIsAuthenticated(token !== null);

    // Set up event listener for storage changes (in case of logout in another tab)
    const handleStorageChange = () => {
      const token = localStorage.getItem("adminToken");
      setIsAuthenticated(token !== null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Toaster />
      <Routes>
        {/* SignIn page as the default route */}
        <Route path="/signin" element={<SignIn />} />

        {/* Protected routes within the Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Campus />} />
          <Route path="/botany" element={<Botany />} />
          <Route path="/campus" element={<Campus />} />
          <Route path="/species" element={<Species />} />
          <Route path="/tree-geolocation" element={<TreeLocation />} />
          <Route path="/tree-image" element={<TreeImage />} />
          <Route path="/species-usage" element={<SpeciesUsage />} />
          <Route path="/birds" element={<BirdManagement />} />
          <Route path="/birds-type" element={<BirdTypes />} />
        </Route>

        {/* Redirect to signin for any unmatched routes */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;