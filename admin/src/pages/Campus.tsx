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

interface Campus {
    id: string;
    name: string;
}

interface CampusFormData {
    name: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Campus = () => {
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
    const [viewingCampus, setViewingCampus] = useState<Campus | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CampusFormData>();

    useEffect(() => {
        fetchCampuses();
    }, []);

    const fetchCampuses = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/campus`);
            setCampuses(data.data);
        } catch (error) {
            console.error('Error fetching campuses:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSave = useCallback(async (data: CampusFormData) => {
        try {
            if (editingCampus) {
                const confirmUpdate = window.confirm('Are you sure you want to update this campus?');
                if (!confirmUpdate) return;
                await axios.put(`${API_URL}/campus/${editingCampus.id}`, data);
                toast.success('Campus updated successfully');
            } else {
                await axios.post(`${API_URL}/campus`, data);
                toast.success('Campus added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            fetchCampuses();
        } catch {
            toast.error('Failed to save campus');
        }
    }, [editingCampus, fetchCampuses, reset]);

    const handleDelete = useCallback(async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this campus?');
        if (!confirmDelete) return;
        try {
            await axios.delete(`${API_URL}/campus/${id}`);
            fetchCampuses();
            toast.success('Campus deleted successfully');
        } catch {
            toast.error('Failed to delete campus');
        }
    }, [fetchCampuses]);

    const filteredCampuses = campuses.filter((campus) =>
        campus.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="p-6 text-center text-lg">Loading campuses...</div>;
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold">Campus Management</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Input
                        placeholder="Search campus by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="sm:w-64"
                    />
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button className="w-full sm:w-auto" onClick={() => setEditingCampus(null)}>Add New Campus</Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <form onSubmit={handleSubmit(handleSave)}>
                                <DrawerHeader>
                                    <DrawerTitle>{editingCampus ? 'Edit Campus' : 'Add New Campus'}</DrawerTitle>
                                    <DrawerDescription>{editingCampus ? 'Update campus details.' : 'Enter campus details.'}</DrawerDescription>
                                </DrawerHeader>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <Label htmlFor="name">Campus Name</Label>
                                        <Input
                                            id="name"
                                            {...register("name", { required: "Campus name is required" })}
                                            defaultValue={editingCampus?.name}
                                            placeholder="Enter campus name"
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                                    </div>
                                </div>
                                <DrawerFooter>
                                    <Button type="submit">{editingCampus ? 'Update Campus' : 'Add Campus'}</Button>
                                    <DrawerClose asChild>
                                        <Button variant="outline" type="button">Cancel</Button>
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
                        <DrawerTitle>View Campus</DrawerTitle>
                        <DrawerDescription>Details of selected campus.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-4">
                        <div>
                            <Label>Name</Label>
                            <p className="text-lg">{viewingCampus?.name}</p>
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
                <TableCaption>List of Campuses</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Campus Name</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredCampuses.length > 0 ? (
                        filteredCampuses.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setViewingCampus(item);
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
                                            setEditingCampus(item);
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
                            <TableCell colSpan={5} className="text-center text-gray-500">
                                No campuses found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default Campus;
