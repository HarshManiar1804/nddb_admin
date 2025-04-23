import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
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

interface Species {
    id: number;
    treename: string;
    scientificname: string;
    hindiname: string;
    centreoforigin: string;
    geographicaldistribution: string;
    iucnstatus: string;
    totalnddbcampus: number;
    qrcode?: string;
    link: string;
    isactive: boolean;
    botanyid: number;
    campusid: number;
    botany_name: string;
    campus_name: string;
}

interface SpeciesFormData extends Omit<Species, 'id' | 'botany_name' | 'campus_name'> { }

interface Botany {
    id: number;
    name: string;
}

interface Campus {
    id: number;
    name: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Species = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const [species, setSpecies] = useState<Species[]>([]);
    const [botanies, setBotanies] = useState<Botany[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editingSpecies, setEditingSpecies] = useState<Species | null>(null);
    const [viewingSpecies, setViewingSpecies] = useState<any | null>(null);
    const filteredSpecies = species.filter((spec) => {
        const query = searchQuery.toLowerCase().trim();
        return (
            spec.treename.toLowerCase().includes(query) ||
            spec.scientificname.toLowerCase().includes(query) ||
            (spec.hindiname?.toLowerCase().includes(query) ?? false) ||
            spec.botany_name.toLowerCase().includes(query) ||
            (spec.campus_name?.toLowerCase().includes(query))
        );
    });



    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<SpeciesFormData>();

    useEffect(() => {
        fetchSpecies();
        fetchBotanies();
        fetchCampuses();
    }, []);

    const fetchSpecies = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/species`);
            setSpecies(data.data);
        } catch (error) {
            console.error('Error fetching species:', error);
            toast.error('Failed to fetch species');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBotanies = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/botany`);
            setBotanies(data.data);
        } catch (error) {
            console.error('Error fetching botanies:', error);
        }
    }, []);

    const fetchCampuses = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/campus`);
            setCampuses(data.data);
        } catch (error) {
            console.error('Error fetching campuses:', error);
        }
    }, []);

    const createOrUpdateSpecies = useCallback(async (speciesData: SpeciesFormData) => {
        console.log(speciesData)
        try {
            if (editingSpecies) {
                const confirmUpdate = window.confirm('Are you sure you want to update this species?');
                if (!confirmUpdate) return;
                await axios.put(`${API_URL}/species/${editingSpecies.id}`, speciesData);
                toast.success('Species updated successfully');
            } else {
                await axios.post(`${API_URL}/species`, speciesData);
                toast.success('Species added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            fetchSpecies();
            setEditingSpecies(null);
        } catch (error) {
            console.error('Error saving species:', error);
            toast.error('Failed to save species');
        }
    }, [editingSpecies, fetchSpecies, reset]);

    const handleEdit = (spec: Species) => {
        setEditingSpecies(spec);
        setValue('treename', spec.treename);
        setValue('scientificname', spec.scientificname);
        setValue('hindiname', spec.hindiname || '');
        setValue('centreoforigin', spec.centreoforigin || '');
        setValue('geographicaldistribution', spec.geographicaldistribution || '');
        setValue('iucnstatus', spec.iucnstatus || '');
        setValue('totalnddbcampus', spec.totalnddbcampus);
        setValue('qrcode', spec.qrcode || '');
        setValue('link', spec.link || '');
        setValue('isactive', spec.isactive);
        setValue('botanyid', spec.botanyid);
        setValue('campusid', spec.campusid || 0);
        setIsDrawerOpen(true);
    };

    const handleView = async (speciesId: number) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/species/${speciesId}`);
            setViewingSpecies(data.data);
            setIsViewDrawerOpen(true);
        } catch (error) {
            console.error('Error fetching species details:', error);
            toast.error('Failed to fetch species details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = useCallback(async (id: number) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this species?');
        if (!confirmDelete) return;
        try {
            await axios.delete(`${API_URL}/species/${id}`);
            fetchSpecies();
            toast.success('Species deleted successfully');
        } catch (error) {
            console.error('Error deleting species:', error);
            toast.error('Failed to delete species');
        }
    }, [fetchSpecies]);

    const handleAddNewSpecies = () => {
        setEditingSpecies(null);
        reset({
            treename: '',
            scientificname: '',
            hindiname: '',
            centreoforigin: '',
            geographicaldistribution: '',
            iucnstatus: '',
            totalnddbcampus: 0,
            qrcode: '',
            link: '',
            isactive: true,
            botanyid: botanies.length > 0 ? botanies[0].id : 0,
            campusid: 0
        });
        setIsDrawerOpen(true);
    };

    if (loading && species.length === 0) {
        return <div>Loading species data...</div>;
    }

    return (
        <div className='w-full max-w-6xl'>
            <div className="flex items-center justify-between ">
                <h2 className="text-2xl font-bold">Species Management</h2>
                <div className="my-4 flex items-center gap-4">
                    <Input
                        placeholder="Search by Tree Name or Scientific Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-72"
                    />


                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button className='cursor-pointer' onClick={handleAddNewSpecies}>Add New Species</Button>
                        </DrawerTrigger>
                        <DrawerContent >
                            <form onSubmit={handleSubmit(createOrUpdateSpecies)}>
                                <DrawerHeader>
                                    <DrawerTitle>{editingSpecies ? 'Edit Species' : 'Add New Species'}</DrawerTitle>
                                    <DrawerDescription>Enter species details.</DrawerDescription>
                                </DrawerHeader>
                                <div className="p-1 space-y-3">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="treename">Tree Name</Label>
                                            <Input
                                                id="treename"
                                                {...register("treename", { required: true })}
                                                placeholder="Enter Tree Name"
                                            />
                                            {errors.treename && <p className="text-sm text-red-500">Tree Name is required</p>}
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
                                            <Label htmlFor="hindiname">Hindi Name</Label>
                                            <Input
                                                id="hindiname"
                                                {...register("hindiname")}
                                                placeholder="Enter Hindi Name"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="centreoforigin">Centre of Origin</Label>
                                            <Input
                                                id="centreoforigin"
                                                {...register("centreoforigin")}
                                                placeholder="Enter Centre of Origin"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label htmlFor="geographicaldistribution">Geographical Distribution</Label>
                                            <Textarea
                                                id="geographicaldistribution"
                                                {...register("geographicaldistribution")}
                                                placeholder="Enter Geographical Distribution"
                                            />
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
                                            <Label htmlFor="totalnddbcampus">Total NDDB Campus</Label>
                                            <Input
                                                type="number"
                                                id="totalnddbcampus"
                                                {...register("totalnddbcampus", {
                                                    valueAsNumber: true,
                                                    min: 0
                                                })}
                                                placeholder="Enter Total NDDB Campus"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="qrcode">QR Code</Label>
                                            <Input
                                                id="qrcode"
                                                {...register("qrcode")}
                                                placeholder="Enter QR Code URL"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="link">Link</Label>
                                            <Input
                                                id="link"
                                                {...register("link")}
                                                placeholder="Enter Link"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="botanyid">Botany</Label>
                                            <select
                                                id="botanyid"
                                                {...register("botanyid", {
                                                    required: true,
                                                    valueAsNumber: true
                                                })}
                                                className="w-full p-2 border rounded"
                                            >
                                                {botanies.map(botany => (
                                                    <option key={botany.id} value={botany.id}>
                                                        {botany.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.botanyid && <p className="text-sm text-red-500">Botany is required</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="campusid">Campus</Label>
                                            <select
                                                id="campusid"
                                                {...register("campusid", {
                                                    valueAsNumber: true
                                                })}
                                                className="w-full p-2 border rounded"
                                            >
                                                <option value={0}>None</option>
                                                {campuses.map(campus => (
                                                    <option key={campus.id} value={campus.id}>
                                                        {campus.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="isactive">Active Status</Label>
                                            <Controller
                                                name="isactive"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        id="isactive"
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <DrawerFooter>
                                    <Button type="submit" className='cursor-pointer'>{editingSpecies ? 'Update Species' : 'Add Species'}</Button>
                                    <DrawerClose >
                                        <Button variant="outline" type="button" className='cursor-pointer w-full'>Cancel</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </form>
                        </DrawerContent>
                    </Drawer>

                    {/* View Species Details Drawer */}
                    <Drawer open={isViewDrawerOpen} onOpenChange={setIsViewDrawerOpen}>
                        <DrawerContent >
                            <DrawerHeader>
                                <DrawerTitle>Species Details</DrawerTitle>
                                <DrawerDescription>Viewing detailed information for this species.</DrawerDescription>
                            </DrawerHeader>
                            {viewingSpecies && (
                                <div className="p-2 space-y-2">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <h3 className="font-bold">Tree Name</h3>
                                            <p>{viewingSpecies.treename}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Scientific Name</h3>
                                            <p>{viewingSpecies.scientificname}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Hindi Name</h3>
                                            <p>{viewingSpecies.hindiname || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Centre of Origin</h3>
                                            <p>{viewingSpecies.centreoforigin || 'N/A'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <h3 className="font-bold">Geographical Distribution</h3>
                                            <p>{viewingSpecies.geographicaldistribution || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">IUCN Status</h3>
                                            <p>{viewingSpecies.iucnstatus || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Total NDDB Campus</h3>
                                            <p>{viewingSpecies.totalnddbcampus}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">QR Code</h3>
                                            <p>{viewingSpecies.qrcode || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Link</h3>
                                            <p>{viewingSpecies.link || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Botany</h3>
                                            <p>{viewingSpecies.botany_name}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Campus</h3>
                                            <p>{viewingSpecies.campus_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Status</h3>
                                            <p>{viewingSpecies.isactive ? 'Active' : 'Inactive'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DrawerFooter>
                                <DrawerClose asChild>
                                    <Button variant="outline" type="button" className='cursor-pointer'>Close</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>

            <Table>
                <TableCaption>List of Species</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Tree Name</TableHead>
                        {/* <TableHead>Scientific Name</TableHead> */}
                        <TableHead>Hindi Name</TableHead>
                        <TableHead>Botany</TableHead>
                        <TableHead>Campus</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredSpecies.map((spec, index) => (
                        <TableRow key={spec.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{spec.treename}</TableCell>
                            {/* <TableCell><span className="italic">{spec.scientificname}</span></TableCell> */}
                            <TableCell>{spec.hindiname || 'N/A'}</TableCell>
                            <TableCell>{spec.botany_name}</TableCell>
                            <TableCell>{spec.campus_name || 'N/A'}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded text-xs ${spec.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {spec.isactive ? 'Active' : 'Inactive'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" className='cursor-pointer' onClick={() => handleView(spec.id)}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" className='cursor-pointer' onClick={() => handleEdit(spec)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" className='cursor-pointer text-red-500 hover:text-red-700' onClick={() => handleDelete(spec.id)}>
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

export default Species;