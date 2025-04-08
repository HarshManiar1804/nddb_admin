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
import { X, Pencil, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Species {
    id: string;
    name: string;
}

interface SpeciesUsage {
    id: string;
    speciesid: string;
    usagetitle: string;
    UsageDescription: string;
    species?: Species;
}

interface SpeciesUsageFormData {
    speciesId: string;
    UsageTitle: string;
    UsageDescription: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const SpeciesUsage = () => {
    const [speciesUsages, setSpeciesUsages] = useState<SpeciesUsage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editingSpeciesUsage, setEditingSpeciesUsage] = useState<SpeciesUsage | null>(null);
    const [viewingSpeciesUsage, setViewingSpeciesUsage] = useState<SpeciesUsage | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SpeciesUsageFormData>();

    useEffect(() => {
        fetchSpeciesUsages();
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

    const handleSave = useCallback(async (data: SpeciesUsageFormData) => {
        try {
            if (editingSpeciesUsage) {
                const confirmUpdate = window.confirm('Are you sure you want to update this species usage?');
                if (!confirmUpdate) return;
                await axios.put(`${API_URL}/species-usage/${editingSpeciesUsage.id}`, data);
                toast.success('Species usage updated successfully');
            } else {
                await axios.post(`${API_URL}/species-usage`, data);
                toast.success('Species usage added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            fetchSpeciesUsages();
        } catch (error) {
            toast.error('Failed to save species usage', error);
        }
    }, [editingSpeciesUsage, fetchSpeciesUsages, reset]);

    const handleDelete = useCallback(async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this species usage?');
        if (!confirmDelete) return;
        try {
            await axios.delete(`${API_URL}/species-usage/${id}`);
            fetchSpeciesUsages();
            toast.success('Species usage deleted successfully');
        } catch (error) {
            toast.error('Failed to delete species usage', error);
        }
    }, [fetchSpeciesUsages]);

    if (loading) {
        return <div>Loading species usages...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Species Usage Management</h2>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button className="cursor-pointer" onClick={() => setEditingSpeciesUsage(null)}>Add New Species Usage</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <form onSubmit={handleSubmit(handleSave)}>
                            <DrawerHeader>
                                <DrawerTitle>{editingSpeciesUsage ? 'Edit Species Usage' : 'Add New Species Usage'}</DrawerTitle>
                                <DrawerDescription>{editingSpeciesUsage ? 'Update species usage details.' : 'Enter species usage details.'}</DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 space-y-4">
                                <div>
                                    <Label htmlFor="UsageTitle">Species Id</Label>
                                    <Input
                                        id="SpeciedId"
                                        {...register("speciesId", { required: "SpeciedId is required" })}
                                        defaultValue={editingSpeciesUsage?.speciesid}
                                        placeholder="Enter speciesId"
                                        type='number'
                                    />
                                    {errors.speciesId && <p className="text-sm text-red-500">{errors.speciesId.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="UsageTitle">Usage Title</Label>
                                    <Input
                                        id="UsageTitle"
                                        {...register("UsageTitle", { required: "Usage title is required" })}
                                        defaultValue={editingSpeciesUsage?.usagetitle}
                                        placeholder="Enter usage title"
                                    />
                                    {errors.UsageTitle && <p className="text-sm text-red-500">{errors.UsageTitle.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="UsageDescription">Usage Description</Label>
                                    <Textarea
                                        id="UsageDescription"
                                        {...register("UsageDescription")}
                                        defaultValue={editingSpeciesUsage?.UsageDescription}
                                        placeholder="Enter usage description"
                                        rows={5}
                                    />
                                </div>
                            </div>
                            <DrawerFooter>
                                <Button type="submit">{editingSpeciesUsage ? 'Update Usage' : 'Add Usage'}</Button>
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
                        <DrawerTitle>View Species Usage</DrawerTitle>
                        <DrawerDescription>Details of selected species usage.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-4">
                        <div>
                            <Label>Species</Label>
                            <p className="text-lg">{viewingSpeciesUsage ? viewingSpeciesUsage.speciesId : ''}</p>
                        </div>
                        <div>
                            <Label>Usage Title</Label>
                            <p className="text-lg">{viewingSpeciesUsage?.usagetitle}</p>
                        </div>
                        <div>
                            <Label>Usage Description</Label>
                            <p className="text-base whitespace-pre-wrap">{viewingSpeciesUsage?.UsageDescription}</p>
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
                    {speciesUsages.map((item, index) => (
                        <TableRow key={item.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.speciesid}</TableCell>
                            <TableCell className="font-medium">{item.usagetitle}</TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setViewingSpeciesUsage(item);
                                        setIsViewDrawerOpen(true);
                                    }}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setEditingSpeciesUsage(item);
                                        setIsDrawerOpen(true);
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer text-red-500 hover:text-red-700"
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