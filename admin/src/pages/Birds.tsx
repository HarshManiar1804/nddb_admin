import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, Pencil, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Bird {
    id: number;
    birdname: string;
    scientificname: string;
    birds_type: number;
    bird_type_name: string;
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

interface BirdFormData extends Omit<Bird, 'id' | 'birds_type_name'> { }

interface BirdType {
    id: number;  // or string, depending on your backend
    type: string; // This should be 'type' not 'name' based on your controller
    hindi?: string; // Include this if you need it
}

const API_URL = import.meta.env.VITE_API_URL;

const Birds = () => {
    const [birds, setBirds] = useState<Bird[]>([]);
    const [birdTypes, setBirdTypes] = useState<BirdType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editingBird, setEditingBird] = useState<Bird | null>(null);
    const [viewingBird, setViewingBird] = useState<Bird | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BirdFormData>();

    useEffect(() => {
        fetchBirds();
        fetchBirdTypes();
    }, []);

    const fetchBirds = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/birds`);
            setBirds(data);
        } catch (error) {
            console.error('Error fetching birds:', error);
            toast.error('Failed to fetch birds');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBirdTypes = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/bird-types`); // Make sure this endpoint is correct
            setBirdTypes(response.data); // Adjust if your API returns data in a nested structure
        } catch (error) {
            console.error('Error fetching bird types:', error);
            toast.error('Failed to fetch bird types');
        }
    }, []);

    const createOrUpdateBird = useCallback(async (birdData: BirdFormData) => {
        try {
            if (editingBird) {
                const confirmUpdate = window.confirm('Are you sure you want to update this bird?');
                if (!confirmUpdate) return;
                await axios.put(`${API_URL}/birds/${editingBird.id}`, birdData);
                toast.success('Bird updated successfully');
            } else {
                await axios.post(`${API_URL}/birds`, birdData);
                toast.success('Bird added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            fetchBirds();
            setEditingBird(null);
        } catch (error) {
            console.error('Error saving bird:', error);
            toast.error('Failed to save bird');
        }
    }, [editingBird, fetchBirds, reset]);

    const handleEdit = (bird: Bird) => {
        setEditingBird(bird);
        setValue('birdname', bird.birdname);
        setValue('scientificname', bird.scientificname);
        setValue('birds_type', bird.birds_type);
        setValue('iucnstatus', bird.iucnstatus || '');
        setValue('migrationstatus', bird.migrationstatus || '');
        setValue('foodpreference', bird.foodpreference || '');
        setValue('habitatpreference', bird.habitatpreference || '');
        setValue('globaldistribution', bird.globaldistribution || '');
        setValue('ecologicalrole', bird.ecologicalrole || '');
        setValue('birdimage', bird.birdimage || '');
        setValue('urllink', bird.urllink || '');
        setValue('coordinates', bird.coordinates || '');
        setValue('isactive', bird.isactive);
        setValue('qrcode', bird.qrcode || '');
        setIsDrawerOpen(true);
    };

    const handleView = async (birdId: number) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/birds/${birdId}`);
            setViewingBird(data.data);
            setIsViewDrawerOpen(true);
        } catch (error) {
            console.error('Error fetching bird details:', error);
            toast.error('Failed to fetch bird details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = useCallback(async (id: number) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this bird?');
        if (!confirmDelete) return;
        try {
            await axios.delete(`${API_URL}/birds/${id}`);
            fetchBirds();
            toast.success('Bird deleted successfully');
        } catch (error) {
            console.error('Error deleting bird:', error);
            toast.error('Failed to delete bird');
        }
    }, [fetchBirds]);

    const handleAddNewBird = () => {
        setEditingBird(null);
        reset({
            birdname: '',
            scientificname: '',
            birds_type: birdTypes.length > 0 ? birdTypes[0].id : 0,
            iucnstatus: '',
            migrationstatus: '',
            foodpreference: '',
            habitatpreference: '',
            globaldistribution: '',
            ecologicalrole: '',
            birdimage: '',
            urllink: '',
            coordinates: '',
            isactive: true,
            qrcode: ''
        });
        setIsDrawerOpen(true);
    };

    if (loading && birds.length === 0) {
        return <div>Loading birds data...</div>;
    }
    console.log(birds)
    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Birds Management</h2>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button className="cursor-pointer" onClick={handleAddNewBird}>Add New Bird</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <form onSubmit={handleSubmit(createOrUpdateBird)}>
                            <DrawerHeader>
                                <DrawerTitle>{editingBird ? 'Edit Bird' : 'Add New Bird'}</DrawerTitle>
                                <DrawerDescription>Enter bird details.</DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="birdname">Bird Name</Label>
                                        <Input
                                            id="birdname"
                                            {...register("birdname", { required: true })}
                                            placeholder="Enter Bird Name"
                                        />
                                        {errors.birdname && <p className="text-sm text-red-500">Bird Name is required</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="scientificname">Scientific Name</Label>
                                        <Input
                                            id="scientificname"
                                            {...register("scientificname", { required: true })}
                                            placeholder="Enter Scientific Name"
                                        />
                                        {errors.scientificname && <p className="text-sm text-red-500">Scientific Name is required</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="birds_type">Bird Type</Label>
                                        <select
                                            id="birds_type"
                                            {...register("birds_type", {
                                                required: true,
                                                valueAsNumber: true
                                            })}
                                            className="w-full p-2 border rounded"
                                        >
                                            {birdTypes.length > 0 ? (
                                                birdTypes.map(type => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.type}{type.hindi ? ` (${type.hindi})` : ''}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="">No bird types available</option>
                                            )}
                                        </select>
                                        {errors.birds_type && <p className="text-sm text-red-500">Bird Type is required</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="iucnstatus">IUCN Status</Label>
                                        <Input
                                            id="iucnstatus"
                                            {...register("iucnstatus")}
                                            placeholder="Enter IUCN Status"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="migrationstatus">Migration Status</Label>
                                        <Input
                                            id="migrationstatus"
                                            {...register("migrationstatus")}
                                            placeholder="Enter Migration Status"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="foodpreference">Food Preference</Label>
                                        <Input
                                            id="foodpreference"
                                            {...register("foodpreference")}
                                            placeholder="Enter Food Preference"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="habitatpreference">Habitat Preference</Label>
                                        <Input
                                            id="habitatpreference"
                                            {...register("habitatpreference")}
                                            placeholder="Enter Habitat Preference"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="globaldistribution">Global Distribution</Label>
                                        <Textarea
                                            id="globaldistribution"
                                            {...register("globaldistribution")}
                                            placeholder="Enter Global Distribution"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="ecologicalrole">Ecological Role</Label>
                                        <Textarea
                                            id="ecologicalrole"
                                            {...register("ecologicalrole")}
                                            placeholder="Enter Ecological Role"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="birdimage">Bird Image URL</Label>
                                        <Input
                                            id="birdimage"
                                            {...register("birdimage")}
                                            placeholder="Enter Bird Image URL"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="urllink">URL Link</Label>
                                        <Input
                                            id="urllink"
                                            {...register("urllink")}
                                            placeholder="Enter URL Link"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="coordinates">Coordinates</Label>
                                        <Input
                                            id="coordinates"
                                            {...register("coordinates")}
                                            placeholder="Enter Coordinates"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="qrcode">QR Code</Label>
                                        <Input
                                            id="qrcode"
                                            {...register("qrcode")}
                                            placeholder="Enter QR Code"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Label htmlFor="isactive">Active Status</Label>
                                        <Switch
                                            id="isactive"
                                            {...register("isactive")}
                                        />
                                    </div>
                                </div>
                            </div>

                            <DrawerFooter>
                                <Button type="submit" className="cursor-pointer">{editingBird ? 'Update Bird' : 'Add Bird'}</Button>
                                <DrawerClose>
                                    <Button variant="outline" type="button" className="cursor-pointer w-full">Cancel</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    </DrawerContent>
                </Drawer>

                {/* View Bird Details Drawer */}
                <Drawer open={isViewDrawerOpen} onOpenChange={setIsViewDrawerOpen}>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Bird Details</DrawerTitle>
                            <DrawerDescription>Viewing detailed information for this bird.</DrawerDescription>
                        </DrawerHeader>
                        {viewingBird && (
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <h3 className="font-bold">Bird Name</h3>
                                        <p>{viewingBird.birdname}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Scientific Name</h3>
                                        <p className="italic">{viewingBird.scientificname}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Bird Type</h3>
                                        <p>{viewingBird.birds_type_name}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">IUCN Status</h3>
                                        <p>{viewingBird.iucnstatus || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Migration Status</h3>
                                        <p>{viewingBird.migrationstatus || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Food Preference</h3>
                                        <p>{viewingBird.foodpreference || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Habitat Preference</h3>
                                        <p>{viewingBird.habitatpreference || 'N/A'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <h3 className="font-bold">Global Distribution</h3>
                                        <p>{viewingBird.globaldistribution || 'N/A'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <h3 className="font-bold">Ecological Role</h3>
                                        <p>{viewingBird.ecologicalrole || 'N/A'}</p>
                                    </div>
                                    {viewingBird.birdimage && (
                                        <div className="md:col-span-3">
                                            <h3 className="font-bold">Bird Image</h3>
                                            <div className="mt-2">
                                                <img
                                                    src={viewingBird.birdimage}
                                                    alt={viewingBird.birdname}
                                                    className="max-h-64 object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold">URL Link</h3>
                                        <p>{viewingBird.urllink || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Coordinates</h3>
                                        <p>{viewingBird.coordinates || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">QR Code</h3>
                                        <p>{viewingBird.qrcode || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Status</h3>
                                        <p>{viewingBird.isactive ? 'Active' : 'Inactive'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline" type="button" className="cursor-pointer">Close</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>

            <Table>
                <TableCaption>List of Birds</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Bird Name</TableHead>
                        <TableHead>Scientific Name</TableHead>
                        <TableHead>Bird Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {birds.map((bird, index) => (
                        <TableRow key={bird.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{bird.birdname}</TableCell>
                            <TableCell><span className="italic">{bird.scientificname}</span></TableCell>
                            <TableCell>{bird.bird_type_name || 'N/A'}</TableCell>

                            <TableCell>
                                <span className={`px-2 py-1 rounded text-xs ${bird.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {bird.isactive ? 'Active' : 'Inactive'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => handleView(bird.id)}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => handleEdit(bird)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" className="cursor-pointer text-red-500 hover:text-red-700" onClick={() => handleDelete(bird.id)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default Birds;