import React, { useState } from "react";
import { useTreeData } from "@/contexts/TreeDataContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ChevronDown, Leaf, Trees, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const TreeDataViewer: React.FC = () => {
    const {
        botanyList, selectedBotany, setSelectedBotany,
        speciesList, selectedSpecies, setSelectedSpecies,
        loading
    } = useTreeData();

    // Filter state
    const [botanyFilter, setBotanyFilter] = useState("");
    const [speciesFilter, setSpeciesFilter] = useState("");

    // Toggle botany selection
    const toggleBotanySelection = (id: string) => {
        setSelectedBotany((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Select all botany
    const selectAllBotany = () => {
        const filteredBotany = botanyList
            .filter(botany => botany.name.toLowerCase().includes(botanyFilter.toLowerCase()))
            .map(botany => botany.id.toString());
        setSelectedBotany(filteredBotany);
    };

    // Clear all botany selection
    const clearAllBotany = () => {
        setSelectedBotany([]);
    };

    // Toggle species selection
    const toggleSpeciesSelection = (id: string) => {
        setSelectedSpecies((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Select all species - Modified to use treename and hindiname for filtering
    const selectAllSpecies = () => {
        const filteredSpecies = speciesList
            .filter(species =>
                (species.treename?.toLowerCase() || "").includes(speciesFilter.toLowerCase()) ||
                (species.hindiname?.toLowerCase() || "").includes(speciesFilter.toLowerCase())
            )
            .map(species => species.id.toString());
        setSelectedSpecies(filteredSpecies);
    };

    // Clear all species selection
    const clearAllSpecies = () => {
        setSelectedSpecies([]);
    };

    // Filter botany list
    const filteredBotanyList = botanyList.filter(botany =>
        botany.name.toLowerCase().includes(botanyFilter.toLowerCase())
    );

    // Filter species list - Modified to filter by treename or hindiname
    const filteredSpeciesList = speciesList.filter(species =>
        (species.treename?.toLowerCase() || "").includes(speciesFilter.toLowerCase()) ||
        (species.hindiname?.toLowerCase() || "").includes(speciesFilter.toLowerCase())
    );

    return (
        <div className="p-4 bg-white shadow-lg rounded-xl max-w-md mx-auto border border-gray-100">

            <h2 className="text-xl font-serif mb-4 text-gray-800 flex items-center">
                <Trees className="w-5 h-5 mr-2 text-[#00958F]" />
                <span className="text-[#00958F]">Tree Data Viewer</span>
            </h2>

            <div className="space-y-4">
                {/* Botany Dropdown */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Family Selection</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-between text-left bg-gray-50 hover:bg-gray-100 border-gray-200"
                            >
                                <div className="flex items-center">
                                    <Trees className="w-4 h-4 mr-2 text-[#00958F]" />
                                    {selectedBotany.length > 0
                                        ? `${selectedBotany.length} Family selected`
                                        : "Select Family"}
                                </div>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                            <div className="p-2 bg-gray-50 border-b">
                                <h3 className="font-medium text-sm">Family Categories</h3>
                            </div>

                            {/* Filter input for botany */}
                            <div className="p-2 border-b flex items-center gap-2">
                                <Search className="h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Filter families..."
                                    value={botanyFilter}
                                    onChange={(e) => setBotanyFilter(e.target.value)}
                                    className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                                />
                            </div>

                            <ScrollArea className="h-48 overflow-auto p-2">
                                {filteredBotanyList.length === 0 ? (
                                    <div className="flex justify-center items-center h-24 text-gray-500">
                                        <p className="text-sm">No matches found</p>
                                    </div>
                                ) : (
                                    filteredBotanyList.map((botany) => (
                                        <div key={botany.id} className="flex items-center gap-2 py-1 px-1 hover:bg-gray-50 rounded">
                                            <Checkbox
                                                checked={selectedBotany.includes(botany.id.toString())}
                                                onCheckedChange={() => toggleBotanySelection(botany.id.toString())}
                                                className="text-green-600"
                                            />
                                            <span className="text-sm">{botany.name}</span>
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                            <div className="flex justify-between p-2 bg-gray-50 border-t">
                                <Button onClick={selectAllBotany} size="sm" variant="outline" className="text-xs">
                                    Select All
                                </Button>
                                <Button onClick={clearAllBotany} size="sm" variant="outline" className="text-xs text-red-600 hover:text-red-700">
                                    Clear All
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Species Dropdown */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Species Selection</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-between text-left bg-gray-50 hover:bg-gray-100 border-gray-200"
                                disabled={loading || botanyList.length === 0}
                            >
                                <div className="flex items-center">
                                    <Leaf className="w-4 h-4 mr-2 text-[#00958F]" />
                                    {loading
                                        ? "Loading species..."
                                        : selectedSpecies.length > 0
                                            ? `${selectedSpecies.length} Species selected`
                                            : "Select Species"}
                                </div>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                            <div className="p-2 bg-gray-50 border-b">
                                <h3 className="font-medium text-sm">Species List</h3>
                            </div>

                            {/* Filter input for species - only shown when not loading and species list exists */}
                            {!loading && speciesList.length > 0 && (
                                <div className="p-2 border-b flex items-center gap-2">
                                    <Search className="h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Filter by tree or Hindi name..."
                                        value={speciesFilter}
                                        onChange={(e) => setSpeciesFilter(e.target.value)}
                                        className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                                    />
                                </div>
                            )}

                            <ScrollArea className="h-48 overflow-auto p-2">
                                {loading ? (
                                    <div className="flex justify-center items-center h-24">
                                        <Loader2 className="animate-spin w-5 h-5 text-[#00958F]" />
                                    </div>
                                ) : speciesList.length === 0 ? (
                                    <div className="flex flex-col justify-center items-center h-24 text-gray-500">
                                        <Trees className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-sm">Select Family First</p>
                                    </div>
                                ) : filteredSpeciesList.length === 0 ? (
                                    <div className="flex justify-center items-center h-24 text-gray-500">
                                        <p className="text-sm">No matches found</p>
                                    </div>
                                ) : (
                                    filteredSpeciesList.map((species) => (
                                        <div key={species.id} className="flex items-center gap-2 py-1 px-1 hover:bg-gray-50 rounded">
                                            <Checkbox
                                                checked={selectedSpecies.includes(species.id.toString())}
                                                onCheckedChange={() => toggleSpeciesSelection(species.id.toString())}
                                                className="text-[#00958F]"
                                            />
                                            <span className="text-sm italic">{species.treename}{" : "}{species.hindiname}</span>
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                            <div className="flex justify-between p-2 bg-gray-50 border-t">
                                <Button
                                    onClick={selectAllSpecies}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    disabled={speciesList.length === 0 || loading}
                                >
                                    Select All
                                </Button>
                                <Button
                                    onClick={clearAllSpecies}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs text-red-600 hover:text-red-700"
                                    disabled={speciesList.length === 0 || loading}
                                >
                                    Clear All
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{selectedBotany.length} families </span>
                    <span>{selectedSpecies.length} species </span>
                </div>
            </div>
        </div>
    );
};

export default TreeDataViewer;