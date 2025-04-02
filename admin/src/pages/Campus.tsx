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
import { X, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface campus {
    id: string;
    name: string;
}

interface campusFormData {
    name: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Campus = () => {
    const [campus, setcampus] = useState<campus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editcampus, setEditcampus] = useState<campus | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<campusFormData>();

    useEffect(() => {
        fetchcampus();
    }, []);

    const fetchcampus = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/campus`);
            setcampus(data.data);
        } catch (error) {
            console.error('Error fetching campus:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSave = useCallback(async (data: campusFormData) => {
        try {
            if (editcampus) {
                await axios.put(`${API_URL}/campus/${editcampus.id}`, data);
                toast.success('campus updated successfully');
            } else {
                await axios.post(`${API_URL}/campus`, data);
                toast.success('campus added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            fetchcampus();
        } catch (error) {
            toast.error('Failed to save campus');
        }
    }, [editcampus, fetchcampus, reset]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            await axios.delete(`${API_URL}/campus/${id}`);
            fetchcampus();
            toast.success('campus deleted successfully');
        } catch (error) {
            toast.error('Failed to delete campus');
        }
    }, [fetchcampus]);

    if (loading) {
        return <div>Loading campus...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">campus Management</h2>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button onClick={() => setEditcampus(null)}>Add New campus</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <form onSubmit={handleSubmit(handleSave)}>
                            <DrawerHeader>
                                <DrawerTitle>{editcampus ? 'Edit campus' : 'Add New campus'}</DrawerTitle>
                                <DrawerDescription>{editcampus ? 'Update campus details.' : 'Enter campus details.'}</DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">campus Name</Label>
                                    <Input id="name" {...register("name", { required: "campus name is required" })} defaultValue={editcampus?.name} placeholder="Enter campus name" />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                                </div>
                            </div>
                            <DrawerFooter>
                                <Button type="submit">{editcampus ? 'Update campus' : 'Add campus'}</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline" type="button">Cancel</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    </DrawerContent>
                </Drawer>
            </div>
            <Table>
                <TableCaption>List of Available campus</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>campus Name</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {campus.map((item, index) => (
                        <TableRow key={item.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button onClick={() => { setEditcampus(item); setIsDrawerOpen(true); }}>
                                    <Pencil size={16} />
                                </Button>
                            </TableCell>
                            <TableCell className=" ">
                                <Button onClick={() => handleDelete(item.id)}>
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

export default Campus;