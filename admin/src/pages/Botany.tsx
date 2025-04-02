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

interface botany {
    id: string;
    name: string;
}

interface botanyFormData {
    name: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Botany = () => {
    const [botany, setbotany] = useState<botany[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editbotany, setEditbotany] = useState<botany | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<botanyFormData>();

    useEffect(() => {
        fetchbotany();
    }, []);

    const fetchbotany = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/botany`);
            setbotany(data.data);
        } catch (error) {
            console.error('Error fetching botany:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSave = useCallback(async (data: botanyFormData) => {
        try {
            if (editbotany) {
                await axios.put(`${API_URL}/botany/${editbotany.id}`, data);
                toast.success('botany updated successfully');
            } else {
                await axios.post(`${API_URL}/botany`, data);
                toast.success('botany added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            fetchbotany();
        } catch (error) {
            toast.error('Failed to save botany');
        }
    }, [editbotany, fetchbotany, reset]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            await axios.delete(`${API_URL}/botany/${id}`);
            fetchbotany();
            toast.success('botany deleted successfully');
        } catch (error) {
            toast.error('Failed to delete botany');
        }
    }, [fetchbotany]);

    if (loading) {
        return <div>Loading botany...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">botany Management</h2>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button onClick={() => setEditbotany(null)}>Add New botany</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <form onSubmit={handleSubmit(handleSave)}>
                            <DrawerHeader>
                                <DrawerTitle>{editbotany ? 'Edit botany' : 'Add New botany'}</DrawerTitle>
                                <DrawerDescription>{editbotany ? 'Update botany details.' : 'Enter botany details.'}</DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">botany Name</Label>
                                    <Input id="name" {...register("name", { required: "botany name is required" })} defaultValue={editbotany?.name} placeholder="Enter botany name" />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                                </div>
                            </div>
                            <DrawerFooter>
                                <Button type="submit">{editbotany ? 'Update botany' : 'Add botany'}</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline" type="button">Cancel</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    </DrawerContent>
                </Drawer>
            </div>
            <Table>
                <TableCaption>List of Available botany</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>botany Name</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {botany.map((item, index) => (
                        <TableRow key={item.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button onClick={() => { setEditbotany(item); setIsDrawerOpen(true); }}>
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

export default Botany;