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
import { X } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Campus = () => {
    const [campuses, setCampuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        fetchCampuses();
    }, []);

    const fetchCampuses = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/campuses`);
            setCampuses(data.data);
        } catch (error) {
            console.error('Error fetching campuses:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCampus = useCallback(async (campusData) => {
        try {
            const response = await axios.post(`${API_URL}/campuses`, campusData);
            toast.success('Campus added successfully');
            return response.data;
        } catch (error) {
            console.error('Error adding campus:', error);
            throw new Error('Failed to add campus');
        }
    }, []);

    const onSubmit = useCallback(async (data) => {
        try {
            await createCampus(data);
            setIsDrawerOpen(false);
            reset();
            fetchCampuses();
        } catch (error) {
            toast.error('Failed to add campus');
        }
    }, [createCampus, fetchCampuses, reset]);

    const handleDelete = useCallback(async (id) => {
        try {
            await axios.delete(`${API_URL}/campuses/${id}`);
            fetchCampuses();
            toast.success('Campus deleted successfully');
        } catch (error) {
            console.error('Error deleting campus:', error);
            toast.error('Failed to delete campus');
        }
    }, [fetchCampuses]);

    if (loading) {
        return <div>Loading campuses...</div>;
    }

    return (
        <div className="space-y-3">
            <h2 className="text-2xl font-bold">Campuses</h2>
            <div className="flex justify-between items-center mb-4">
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button>Add New Campus</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <DrawerHeader>
                                <DrawerTitle>Add New Campus</DrawerTitle>
                                <DrawerDescription>Enter details below</DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Campus Name</Label>
                                    <Input id="name" {...register("name", { required: "Campus name is required" })} />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                                </div>
                            </div>
                            <DrawerFooter>
                                <Button type="submit">Add Campus</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    </DrawerContent>
                </Drawer>
            </div>
            <Table>
                <TableCaption>List of Campuses</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Campus Name</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {campuses.map((campus, index) => (
                        <TableRow key={campus.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{campus.name}</TableCell>
                            <TableCell>
                                <Button onClick={() => handleDelete(campus.id)}>
                                    <X />
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
