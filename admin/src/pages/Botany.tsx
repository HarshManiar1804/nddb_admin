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

interface Botany {
    id: string;
    name: string;
}

interface BotanyFormData {
    name: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Botany = () => {
    const [botanies, setBotanies] = useState<Botany[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editingBotany, setEditingBotany] = useState<Botany | null>(null);
    const [viewingBotany, setViewingBotany] = useState<Botany | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<BotanyFormData>();

    useEffect(() => {
        fetchBotanies();
    }, []);

    const fetchBotanies = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/botany`);
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
                await axios.put(`${API_URL}/botany/${editingBotany.id}`, data);
                toast.success('Botany updated successfully');
            } else {
                await axios.post(`${API_URL}/botany`, data);
                toast.success('Botany added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            fetchBotanies();
        } catch {
            toast.error('Failed to save botany');
        }
    }, [editingBotany, fetchBotanies, reset]);

    const handleDelete = useCallback(async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this botany?');
        if (!confirmDelete) return;
        try {
            await axios.delete(`${API_URL}/botany/${id}`);
            fetchBotanies();
            toast.success('Botany deleted successfully');
        } catch {
            toast.error('Failed to delete botany');
        }
    }, [fetchBotanies]);

    const filteredBotanies = botanies.filter((botany) =>
        botany.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="p-6 text-center text-lg">Loading botanies...</div>;
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold">Botany Management</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Input
                        placeholder="Search botany by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="sm:w-64"
                    />
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button className="w-full sm:w-auto" onClick={() => setEditingBotany(null)}>Add New Botany</Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <form onSubmit={handleSubmit(handleSave)}>
                                <DrawerHeader>
                                    <DrawerTitle>{editingBotany ? 'Edit Botany' : 'Add New Botany'}</DrawerTitle>
                                    <DrawerDescription>{editingBotany ? 'Update botany details.' : 'Enter botany details.'}</DrawerDescription>
                                </DrawerHeader>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <Label htmlFor="name">Botany Name</Label>
                                        <Input
                                            id="name"
                                            {...register("name", { required: "Botany name is required" })}
                                            defaultValue={editingBotany?.name}
                                            placeholder="Enter botany name"
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                                    </div>
                                </div>
                                <DrawerFooter>
                                    <Button type="submit">{editingBotany ? 'Update Botany' : 'Add Botany'}</Button>
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
                        <DrawerTitle>View Botany</DrawerTitle>
                        <DrawerDescription>Details of selected botany.</DrawerDescription>
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
                <TableCaption>List of Botanies</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Botany Name</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredBotanies.length > 0 ? (
                        filteredBotanies.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
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
                                No botanies found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default Botany;
