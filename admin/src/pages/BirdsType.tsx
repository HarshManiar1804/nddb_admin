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

interface BirdType {
    id: string;
    type: string;
    hindi?: string;
}

interface BirdTypeFormData {
    type: string;
    hindi?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const BirdTypes = () => {
    const [birdTypes, setBirdTypes] = useState<BirdType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editingBirdType, setEditingBirdType] = useState<BirdType | null>(null);
    const [viewingBirdType, setViewingBirdType] = useState<BirdType | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<BirdTypeFormData>();

    useEffect(() => {
        fetchBirdTypes();
    }, []);

    const fetchBirdTypes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/birds-type`);
            setBirdTypes(response.data);
        } catch (error) {
            console.error('Error fetching bird types:', error);
            toast.error('Failed to fetch bird types');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSave = useCallback(async (data: BirdTypeFormData) => {
        try {
            if (editingBirdType) {
                const confirmUpdate = window.confirm('Are you sure you want to update this bird type?');
                if (!confirmUpdate) return;
                await axios.put(`${API_URL}/birds-type/${editingBirdType.id}`, data);
                toast.success('Bird type updated successfully');
            } else {
                await axios.post(`${API_URL}/birds-type`, data);
                toast.success('Bird type added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            fetchBirdTypes();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save bird type');
        }
    }, [editingBirdType, fetchBirdTypes, reset]);

    const handleDelete = useCallback(async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this bird type?');
        if (!confirmDelete) return;
        try {
            await axios.delete(`${API_URL}/birds-type/${id}`);
            fetchBirdTypes();
            toast.success('Bird type deleted successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete bird type');
        }
    }, [fetchBirdTypes]);

    const filteredBirdTypes = birdTypes.filter((birdType) =>
        birdType.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (birdType.hindi && birdType.hindi.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return <div className="p-6 text-center text-lg">Loading bird types...</div>;
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold">Bird Types Management</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Input
                        placeholder="Search bird types..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="sm:w-64"
                    />
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button className="w-full sm:w-auto" onClick={() => {
                                setEditingBirdType(null);
                                reset();
                            }}>
                                Add New Bird Type
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <form onSubmit={handleSubmit(handleSave)}>
                                <DrawerHeader>
                                    <DrawerTitle>{editingBirdType ? 'Edit Bird Type' : 'Add New Bird Type'}</DrawerTitle>
                                    <DrawerDescription>{editingBirdType ? 'Update bird type details.' : 'Enter bird type details.'}</DrawerDescription>
                                </DrawerHeader>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <Label htmlFor="type">Type Name</Label>
                                        <Input
                                            id="type"
                                            {...register("type", { required: "Bird type name is required" })}
                                            defaultValue={editingBirdType?.type}
                                            placeholder="Enter bird type name"
                                        />
                                        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="hindi">Hindi Name (Optional)</Label>
                                        <Input
                                            id="hindi"
                                            {...register("hindi")}
                                            defaultValue={editingBirdType?.hindi}
                                            placeholder="Enter hindi name (optional)"
                                        />
                                    </div>
                                </div>
                                <DrawerFooter>
                                    <Button type="submit">{editingBirdType ? 'Update Bird Type' : 'Add Bird Type'}</Button>
                                    <DrawerClose asChild>
                                        <Button variant="outline" type="button" onClick={() => reset()}>Cancel</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </form>
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>

            {/* View Drawer */}
            <Drawer open={isViewDrawerOpen} onOpenChange={setIsViewDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>View Bird Type</DrawerTitle>
                        <DrawerDescription>Details of selected bird type.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-4">
                        <div>
                            <Label>Type Name</Label>
                            <p className="text-lg">{viewingBirdType?.type}</p>
                        </div>
                        <div>
                            <Label>Hindi Name</Label>
                            <p className="text-lg">{viewingBirdType?.hindi || '-'}</p>
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
                <TableCaption>List of Bird Types</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Type Name</TableHead>
                        <TableHead>Hindi Name</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredBirdTypes.length > 0 ? (
                        filteredBirdTypes.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">{item.type}</TableCell>
                                <TableCell>{item.hindi || '-'}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setViewingBirdType(item);
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
                                        onClick={() => {
                                            setEditingBirdType(item);
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
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500">
                                No bird types found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default BirdTypes;