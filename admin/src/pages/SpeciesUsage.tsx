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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Pencil, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Species {
    id: string;
    name: string;
    treename: string;
}

interface SpeciesUsage {
    id: string;
    speciesid: string;
    usagetitle: string;
    usagedescription: string;
    species?: Species;
}

interface SpeciesUsageFormData {
    speciesId: string;
    usagetitle: string;
    usagedescription: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const SpeciesUsage = () => {
    const [species, setSpecies] = useState<Species[]>([]);
    const [speciesUsages, setSpeciesUsages] = useState<SpeciesUsage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editingSpeciesUsage, setEditingSpeciesUsage] = useState<SpeciesUsage | null>(null);
    const [viewingSpeciesUsage, setViewingSpeciesUsage] = useState<SpeciesUsage | null>(null);
    const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SpeciesUsageFormData>();

    useEffect(() => {
        fetchSpeciesUsages();
        fetchSpecies();
    }, []);

    const fetchSpeciesUsages = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/species-usage`);
            setSpeciesUsages(data.data);
        } catch (error) {
            console.error('Error fetching species usages:', error);
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

    const handleSave = useCallback(async (data: SpeciesUsageFormData) => {
        try {
            const finalData = {
                ...data,
                speciesId: Number(selectedSpeciesId)
            };

            if (editingSpeciesUsage) {
                const confirmUpdate = window.confirm('Are you sure you want to update this species usage?');
                if (!confirmUpdate) return;
                await axios.put(`${API_URL}/species-usage/${editingSpeciesUsage.id}`, finalData);
                toast.success('Species usage updated successfully');
            } else {
                await axios.post(`${API_URL}/species-usage`, finalData);
                toast.success('Species usage added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            setSelectedSpeciesId('');
            fetchSpeciesUsages();
        } catch (error) {
            toast.error('Failed to save species usage');
            console.error(error);
        }
    }, [editingSpeciesUsage, fetchSpeciesUsages, reset, selectedSpeciesId]);

    const handleEdit = (usage: SpeciesUsage) => {
        setEditingSpeciesUsage(usage);
        setSelectedSpeciesId(usage.speciesid);
        setValue('usagetitle', usage.usagetitle);
        setValue('usagedescription', usage.usagedescription);
        setIsDrawerOpen(true);
    };

    const handleDelete = useCallback(async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this species usage?');
        if (!confirmDelete) return;
        try {
            await axios.delete(`${API_URL}/species-usage/${id}`);
            fetchSpeciesUsages();
            toast.success('Species usage deleted successfully');
        } catch (error) {
            toast.error('Failed to delete species usage');
            console.error(error);
        }
    }, [fetchSpeciesUsages]);

    const filteredSpeciesUsages = speciesUsages.filter((item) => {
        const speciesName = species.find(s => s.id === item.speciesid)?.treename || '';
        return (
            item.usagetitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            speciesName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (loading) {
        return <div>Loading species usages...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Species Usage Management</h2>
                <div className="flex ">
                    <Input
                        type="text"
                        className="mr-2 w-64"
                        placeholder="Search by species or title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button className="cursor-pointer" onClick={() => {
                                setEditingSpeciesUsage(null);
                                setSelectedSpeciesId('');
                                reset();
                            }}>Add New Species Usage</Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <form onSubmit={handleSubmit(handleSave)}>
                                <DrawerHeader>
                                    <DrawerTitle>{editingSpeciesUsage ? 'Edit Species Usage' : 'Add New Species Usage'}</DrawerTitle>
                                    <DrawerDescription>{editingSpeciesUsage ? 'Update species usage details.' : 'Enter species usage details.'}</DrawerDescription>
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
                                    <div>
                                        <Label htmlFor="usagetitle">Usage Title</Label>
                                        <Input
                                            id="usagetitle"
                                            {...register("usagetitle", { required: "Usage title is required" })}
                                            placeholder="Enter usage title"
                                        />
                                        {errors.usagetitle && <p className="text-sm text-red-500">{errors.usagetitle.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="usagedescription">Usage Description</Label>
                                        <Textarea
                                            id="usagedescription"
                                            {...register("usagedescription")}
                                            placeholder="Enter usage description"
                                            rows={5}
                                        />
                                    </div>
                                </div>
                                <DrawerFooter>
                                    <Button type="submit" disabled={!selectedSpeciesId}>
                                        {editingSpeciesUsage ? 'Update Usage' : 'Add Usage'}
                                    </Button>
                                    <DrawerClose asChild>
                                        <Button variant="outline" type="button">Cancel</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </form>
                        </DrawerContent>
                    </Drawer>
                </div>

                {/* 🔍 Search Input */}

            </div>

            {/* View Drawer */}
            <Drawer open={isViewDrawerOpen} onOpenChange={setIsViewDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>View Species Usage</DrawerTitle>
                        <DrawerDescription>Details of selected species usage.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-4">
                        <div>
                            <Label>Species</Label>
                            <p className="text-lg">
                                {viewingSpeciesUsage && species.find(s => s.id === viewingSpeciesUsage.speciesid)?.treename || viewingSpeciesUsage?.speciesid}
                            </p>
                        </div>
                        <div>
                            <Label>Usage Title</Label>
                            <p className="text-lg">{viewingSpeciesUsage?.usagetitle}</p>
                        </div>
                        <div>
                            <Label>Usage Description</Label>
                            <p className="text-base whitespace-pre-wrap">{viewingSpeciesUsage?.usagedescription}</p>
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
                <TableCaption>List of Species Usages</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Species</TableHead>
                        <TableHead>Usage Title</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredSpeciesUsages.map((item, index) => (
                        <TableRow key={item.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{species.find(s => s.id === item.speciesid)?.treename || item.speciesid}</TableCell>
                            <TableCell className="font-medium">{item.usagetitle}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" onClick={() => {
                                    setViewingSpeciesUsage(item);
                                    setIsViewDrawerOpen(true);
                                }}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDelete(item.id)}
                                >
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

export default SpeciesUsage;
