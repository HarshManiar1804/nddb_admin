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
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, Pencil, Eye, Plus } from 'lucide-react';
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

interface BirdFormData {
    birdname: string;
    scientificname: string;
    birds_type: number;
    iucnstatus?: string;
    migrationstatus?: string;
    foodpreference?: string;
    habitatpreference?: string;
    globaldistribution?: string;
    ecologicalrole?: string;
    birdimage?: string;
    urllink?: string;
    coordinates?: string;
    isactive: boolean;
    qrcode?: string;
}

interface BirdType {
    id: number;
    type: string;
    hindi?: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

const Birds = () => {
    const [birds, setBirds] = useState<Bird[]>([]);
    const [filteredBirds, setFilteredBirds] = useState<Bird[]>([]);
    const [birdTypes, setBirdTypes] = useState<BirdType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editingBird, setEditingBird] = useState<Bird | null>(null);
    const [viewingBird, setViewingBird] = useState<Bird | null>(null);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BirdFormData>({
        defaultValues: {
            isactive: true
        }
    });

    // Watch the isactive value to properly handle the switch
    const isActiveValue = watch("isactive");

    useEffect(() => {
        fetchBirds();
        fetchBirdTypes();
    }, []);

    // Filter birds when search term changes
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredBirds(birds);
        } else {
            const lowercasedSearch = searchTerm.toLowerCase();
            const filtered = birds.filter(bird =>
                bird.birdname.toLowerCase().includes(lowercasedSearch) ||
                bird.scientificname.toLowerCase().includes(lowercasedSearch) ||
                bird.bird_type_name.toLowerCase().includes(lowercasedSearch) ||
                (bird.iucnstatus && bird.iucnstatus.toLowerCase().includes(lowercasedSearch))
            );
            setFilteredBirds(filtered);
        }
    }, [searchTerm, birds]);

    // Reset form when drawer closes
    useEffect(() => {
        if (!isDrawerOpen) {
            setEditingBird(null);
        }
    }, [isDrawerOpen]);

    const fetchBirds = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/birds`);
            // Handle different API response formats
            const birdsData = Array.isArray(data) ? data : (data.data || []);
            setBirds(birdsData);
            setFilteredBirds(birdsData); // Initialize filtered birds with all birds
        } catch (error) {
            console.error('Error fetching birds:', error);
            toast.error('Failed to fetch birds');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBirdTypes = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/bird-types`);
            // Handle different API response formats
            const typesData = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setBirdTypes(typesData);
        } catch (error) {
            console.error('Error fetching bird types:', error);
            toast.error('Failed to fetch bird types');
        }
    }, []);

    const createOrUpdateBird = useCallback(async (birdData: BirdFormData) => {
        try {
            setFormSubmitting(true);

            if (editingBird) {
                const confirmUpdate = window.confirm('Are you sure you want to update this bird?');
                if (!confirmUpdate) {
                    setFormSubmitting(false);
                    return;
                }
                await axios.put(`${API_URL}/birds/${editingBird.id}`, birdData);
                toast.success('Bird updated successfully');
            } else {
                await axios.post(`${API_URL}/birds`, birdData);
                toast.success('Bird added successfully');
            }

            setIsDrawerOpen(false);
            resetForm();
            fetchBirds();
        } catch (error) {
            console.error('Error saving bird:', error);
            toast.error('Failed to save bird');
        } finally {
            setFormSubmitting(false);
        }
    }, [editingBird, fetchBirds]);

    const resetForm = () => {
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
        setEditingBird(null);
    };

    const handleEdit = (bird: Bird) => {
        setEditingBird(bird);
        // Set form values
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
        setValue('isactive', Boolean(bird.isactive));
        setValue('qrcode', bird.qrcode || '');
        // Open drawer after setting values
        setIsDrawerOpen(true);
    };

    const handleView = async (birdId: number) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/birds/${birdId}`);
            // Handle different API response formats
            const birdData = data.data || data;
            setViewingBird(birdData);
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
        resetForm();
        setIsDrawerOpen(true);
    };

    // Custom handler for the isactive Switch to make sure it updates correctly
    const handleSwitchChange = (checked: boolean) => {
        setValue("isactive", checked);
    };

    // Handler for search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    if (loading && birds.length === 0) {
        return <div className="p-6 text-center text-lg">Loading birds data...</div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-2">
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Birds Management</h2>
                <div className="flex flex-col md:flex-row items-center justify-end mb-6 gap-2">
                    <Input
                        placeholder="Search birds by name, scientific name, type or status..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-72 items-end justify-end"
                    />
                    <Button className="w-full md:w-auto" onClick={handleAddNewBird}>
                        <Plus className="h-4 w-4 mr-2" /> Add New Bird
                    </Button>
                </div>
            </div>

            {/* Bird Form Drawer */}
            <Drawer open={isDrawerOpen} onOpenChange={(open) => {
                if (!open) {
                    resetForm();
                }
                setIsDrawerOpen(open);
            }}>
                <DrawerContent>
                    <form onSubmit={handleSubmit(createOrUpdateBird)}>
                        <DrawerHeader>
                            <DrawerTitle>{editingBird ? 'Edit Bird' : 'Add New Bird'}</DrawerTitle>
                            <DrawerDescription>Enter bird details.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-2 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                <div>
                                    <Label htmlFor="birdname">Bird Name *</Label>
                                    <Input
                                        id="birdname"
                                        {...register("birdname", { required: "Bird Name is required" })}
                                        placeholder="Enter Bird Name"
                                    />
                                    {errors.birdname && <p className="text-sm text-red-500">{errors.birdname.message}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="scientificname">Scientific Name *</Label>
                                    <Input
                                        id="scientificname"
                                        {...register("scientificname", { required: "Scientific Name is required" })}
                                        placeholder="Enter Scientific Name"
                                    />
                                    {errors.scientificname && <p className="text-sm text-red-500">{errors.scientificname.message}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="birds_type">Bird Type *</Label>
                                    <select
                                        id="birds_type"
                                        {...register("birds_type", {
                                            required: "Bird Type is required",
                                            valueAsNumber: true
                                        })}
                                        className="w-full p-2 border rounded-md"
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
                                    {errors.birds_type && <p className="text-sm text-red-500">{errors.birds_type.message}</p>}
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
                                    <Switch
                                        id="isactive"
                                        checked={isActiveValue}
                                        onCheckedChange={handleSwitchChange}
                                    />
                                    <Label htmlFor="isactive">Active Status</Label>
                                </div>
                            </div>
                        </div>

                        <DrawerFooter>
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={formSubmitting}
                                    className="flex-1"
                                >
                                    {formSubmitting ? 'Saving...' : (editingBird ? 'Update Bird' : 'Add Bird')}
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
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
                        <div className="p-2 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                                    <p>{viewingBird.bird_type_name}</p>
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
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = "/api/placeholder/400/300";
                                                    target.alt = "Image not available";
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold">URL Link</h3>
                                    {viewingBird.urllink ? (
                                        <a href={viewingBird.urllink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {viewingBird.urllink}
                                        </a>
                                    ) : (
                                        <p>N/A</p>
                                    )}
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
                                    <p className={viewingBird.isactive ? 'text-green-600' : 'text-red-600'}>
                                        {viewingBird.isactive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DrawerFooter>
                        <Button variant="outline" type="button" onClick={() => setIsViewDrawerOpen(false)}>
                            Close
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {filteredBirds.length > 0 ? (
                <Table>
                    <TableCaption>List of Birds</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Bird Name</TableHead>
                            <TableHead>Scientific Name</TableHead>
                            <TableHead>Bird Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBirds.map((bird, index) => (
                            <TableRow key={bird.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">{bird.birdname}</TableCell>
                                <TableCell><span className="italic">{bird.scientificname}</span></TableCell>
                                <TableCell>{bird.bird_type_name || 'N/A'}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs ${bird.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {bird.isactive ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleView(bird.id)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(bird)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDelete(bird.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center p-8 border rounded mt-4">
                    <p className="text-gray-500">
                        {birds.length === 0
                            ? 'No birds found. Add a new bird to get started.'
                            : `No birds matching "${searchTerm}". Try a different search term.`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Birds;