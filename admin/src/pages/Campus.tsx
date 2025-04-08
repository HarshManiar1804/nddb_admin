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

interface BotanyFormData {
    name: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Campus = () => {
    const [botanies, setBotanies] = useState<Campus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editingBotany, setEditingBotany] = useState<Campus | null>(null);
    const [viewingBotany, setViewingBotany] = useState<Campus | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<BotanyFormData>();

    useEffect(() => {
        fetchBotanies();
    }, []);

    const fetchBotanies = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/campus`);
            setBotanies(data.data);
        } catch (error) {
            console.error('Error fetching botanies:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSave = useCallback(async (data: BotanyFormData) => {
        try {
            if (editingBotany) {
                const confirmUpdate = window.confirm('Are you sure you want to update this botany?');
                if (!confirmUpdate) return;
                await axios.put(`${API_URL}/campus/${editingBotany.id}`, data);
                toast.success('Campus updated successfully');
            } else {
                await axios.post(`${API_URL}/campus`, data);
                toast.success('Campus added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            fetchBotanies();
        } catch (error) {
            toast.error('Failed to save campus');
        }
    }, [editingBotany, fetchBotanies, reset]);

    const handleDelete = useCallback(async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this campus?');
        if (!confirmDelete) return;
        try {
            await axios.delete(`${API_URL}/campus/${id}`);
            fetchBotanies();
            toast.success('Campus deleted successfully');
        } catch (error) {
            toast.error('Failed to delete campus');
        }
    }, [fetchBotanies]);

    if (loading) {
        return <div>Loading botanies...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Campus Management</h2>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button className="cursor-pointer" onClick={() => setEditingBotany(null)}>Add New Campus</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <form onSubmit={handleSubmit(handleSave)}>
                            <DrawerHeader>
                                <DrawerTitle>{editingBotany ? 'Edit Campus' : 'Add New Campus'}</DrawerTitle>
                                <DrawerDescription>{editingBotany ? 'Update campus details.' : 'Enter campus details.'}</DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 space-y-4">
                                <div>
                                    <Label htmlFor="name">Campus Name</Label>
                                    <Input
                                        id="name"
                                        {...register("name", { required: "Campus name is required" })}
                                        defaultValue={editingBotany?.name}
                                        placeholder="Enter campus name"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                                </div>
                            </div>
                            <DrawerFooter>
                                <Button type="submit">{editingBotany ? 'Update Campus' : 'Add Campus'}</Button>
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
                        <DrawerTitle>View Campus</DrawerTitle>
                        <DrawerDescription>Details of selected campus.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-4">
                        <div>
                            <Label>Name</Label>
                            <p className="text-lg">{viewingBotany?.name}</p>
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
                <TableCaption>List of Campus</TableCaption>
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
                    {botanies.map((item, index) => (
                        <TableRow key={item.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setViewingBotany(item);
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
                                        setEditingBotany(item);
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

export default Campus;
