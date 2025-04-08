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
import { X, Pencil, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface TreeGeolocation {
    id: string;
    speciesid: string;
    longitude: string;
    latitude: string;
}

interface TreeGeolocationFormData {
    speciesid: string;
    longitude: string;
    latitude: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const TreeLocation = () => {
    const [geolocations, setGeolocations] = useState<TreeGeolocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editGeolocation, setEditGeolocation] = useState<TreeGeolocation | null>(null);
    const [viewGeolocation, setViewGeolocation] = useState<TreeGeolocation | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<TreeGeolocationFormData>();

    useEffect(() => {
        fetchGeolocations();
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

    const handleSave = useCallback(async (data: TreeGeolocationFormData) => {
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
            fetchGeolocations();
        } catch (error) {
            toast.error('Failed to save geolocation');
        }
    }, [editGeolocation, fetchGeolocations, reset]);

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

    if (loading) {
        return <div>Loading geolocations...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Tree Geolocation Management</h2>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button onClick={() => setEditGeolocation(null)}>Add New Geolocation</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <form onSubmit={handleSubmit(handleSave)}>
                            <DrawerHeader>
                                <DrawerTitle>{editGeolocation ? 'Edit Geolocation' : 'Add New Geolocation'}</DrawerTitle>
                                <DrawerDescription>{editGeolocation ? 'Update geolocation details.' : 'Enter geolocation details.'}</DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="speciesId">Species ID</Label>
                                    <Input id="speciesId" {...register("speciesid", { required: "Species ID is required" })} defaultValue={editGeolocation?.speciesid} placeholder="Enter species ID" />
                                    {errors.speciesid && <p className="text-sm text-red-500">{errors.speciesid.message}</p>}
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
                                <Button type="submit">{editGeolocation ? 'Update Geolocation' : 'Add Geolocation'}</Button>
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
                            <Label>Species ID</Label>
                            <p className="text-lg">{viewGeolocation?.speciesid}</p>
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
                        <TableHead>Species ID</TableHead>
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
                            <TableCell>{item.speciesid}</TableCell>
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
