import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import {
    Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Pencil, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface TreeGeolocation {
    id: string;
    speciesid: string;
    longitude: string;
    latitude: string;
    Scientificname: string;
    treename: string;
}

interface Species {
    id: number;
    treename: string;
    scientificname?: string;
}

interface TreeGeolocationFormData {
    speciesid: string;
    longitude: string;
    latitude: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const TreeLocation = () => {
    const [geolocations, setGeolocations] = useState<TreeGeolocation[]>([]);
    const [species, setSpecies] = useState<Species[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editGeolocation, setEditGeolocation] = useState<TreeGeolocation | null>(null);
    const [viewGeolocation, setViewGeolocation] = useState<TreeGeolocation | null>(null);
    const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm<TreeGeolocationFormData>();

    useEffect(() => {
        fetchGeolocations();
        fetchSpecies();
    }, []);

    const fetchGeolocations = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/trees-geolocation`);
            setGeolocations(data.data);
        } catch (error) {
            console.error('Error fetching geolocations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSpecies = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/species/details`);
            setSpecies(data.data);
        } catch (error) {
            console.error('Error fetching species:', error);
            toast.error('Failed to load species list');
        }
    }, []);

    const handleSpeciesChange = (value: string) => {
        setSelectedSpeciesId(value);
    };

    const handleSave = useCallback(async (formData: TreeGeolocationFormData) => {
        // Override speciesid with selectedSpeciesId from dropdown
        const data = {
            ...formData,
            speciesId: Number(selectedSpeciesId)
        };

        try {
            if (editGeolocation) {
                const confirmUpdate = window.confirm('Are you sure you want to update this Tree location?');
                if (!confirmUpdate) return;
                await axios.put(`${API_URL}/trees-geolocation/${editGeolocation.id}`, data);
                toast.success('Geolocation updated successfully');
            } else {
                await axios.post(`${API_URL}/trees-geolocation`, data);
                toast.success('Geolocation added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            setSelectedSpeciesId('');
            fetchGeolocations();
        } catch (error) {
            toast.error('Failed to save geolocation');
        }
    }, [editGeolocation, fetchGeolocations, reset, selectedSpeciesId]);

    const handleDelete = useCallback(async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this Tree location?');
        if (!confirmDelete) return;
        try {
            await axios.delete(`${API_URL}/trees-geolocation/${id}`);
            fetchGeolocations();
            toast.success('Geolocation deleted successfully');
        } catch (error) {
            toast.error('Failed to delete geolocation');
        }
    }, [fetchGeolocations]);

    // Initialize form when editing
    const prepareForm = useCallback((geolocation: TreeGeolocation | null) => {
        if (geolocation) {
            setSelectedSpeciesId(geolocation.speciesid);
        } else {
            reset();
            setSelectedSpeciesId('');
        }
    }, [reset]);

    if (loading) {
        return <div>Loading geolocations...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Tree Geolocation Management</h2>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button onClick={() => {
                            setEditGeolocation(null);
                            prepareForm(null);
                        }}>Add New Geolocation</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <form onSubmit={handleSubmit(handleSave)}>
                            <DrawerHeader>
                                <DrawerTitle>{editGeolocation ? 'Edit Geolocation' : 'Add New Geolocation'}</DrawerTitle>
                                <DrawerDescription>{editGeolocation ? 'Update geolocation details.' : 'Enter geolocation details.'}</DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="speciesId">Species</Label>
                                    <Select value={selectedSpeciesId} onValueChange={handleSpeciesChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a species" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {species.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {`${s.id} : ${s.treename}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!selectedSpeciesId && <p className="text-sm text-red-500">Species is required</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input id="longitude" {...register("longitude", { required: "Longitude is required" })} defaultValue={editGeolocation?.longitude} placeholder="Enter longitude" />
                                    {errors.longitude && <p className="text-sm text-red-500">{errors.longitude.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input id="latitude" {...register("latitude", { required: "Latitude is required" })} defaultValue={editGeolocation?.latitude} placeholder="Enter latitude" />
                                    {errors.latitude && <p className="text-sm text-red-500">{errors.latitude.message}</p>}
                                </div>
                            </div>
                            <DrawerFooter>
                                <Button type="submit" disabled={!selectedSpeciesId}>{editGeolocation ? 'Update Geolocation' : 'Add Geolocation'}</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline" type="button">Cancel</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    </DrawerContent>
                </Drawer>
            </div>

            {/* View Drawer */}
            <Drawer open={isViewDrawerOpen} onOpenChange={setIsViewDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>View Geolocation</DrawerTitle>
                        <DrawerDescription>Details of selected geolocation.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-4">
                        <div>
                            <Label>Species details</Label>
                            <p className="text-lg">ID : {viewGeolocation?.speciesid}<br /> Name : {viewGeolocation?.treename}</p>
                        </div>

                        <div>
                            <Label>Longitude</Label>
                            <p className="text-lg">{viewGeolocation?.longitude}</p>
                        </div>
                        <div>
                            <Label>Latitude</Label>
                            <p className="text-lg">{viewGeolocation?.latitude}</p>
                        </div>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <Table>
                <TableCaption>List of Tree Geolocations</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Species Name</TableHead>
                        <TableHead>Longitude</TableHead>
                        <TableHead>Latitude</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {geolocations.map((item, index) => (
                        <TableRow key={item.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.treename}</TableCell>
                            <TableCell>{item.longitude}</TableCell>
                            <TableCell>{item.latitude}</TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setViewGeolocation(item);
                                        setIsViewDrawerOpen(true);
                                    }}
                                >
                                    <Eye size={16} />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditGeolocation(item);
                                        prepareForm(item);
                                        setIsDrawerOpen(true);
                                    }}
                                >
                                    <Pencil size={16} />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outline" size="sm" className='cursor-pointer text-red-500 hover:text-red-700'
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <X size={16} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default TreeLocation;