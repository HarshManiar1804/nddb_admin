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

interface Species {
    id: number;
    treename: string;
    scientificname: string;
    hindiname?: string;
    centreoforigin?: string;
    geographicaldistribution?: string;
    iucnstatus?: string;
    totalnddbcampus: number;
    qrcode?: string | null;
    link?: string;
    isactive: boolean;
    botanyid: number;
    campusid: number;
}

interface SpeciesFormData extends Omit<Species, 'id' | 'isactive'> { }

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const SpeciesManagement = () => {
    const [species, setSpecies] = useState<Species[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SpeciesFormData>();

    useEffect(() => {
        fetchSpecies();
    }, []);

    const fetchSpecies = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/species`);
            setSpecies(data.data);
        } catch (error) {
            console.error('Error fetching species:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const createSpecies = useCallback(async (speciesData: SpeciesFormData) => {
        try {
            const response = await axios.post(`${API_URL}/species`, speciesData);
            toast.success('Species added successfully');
            return response.data;
        } catch (error) {
            console.error('Error adding species:', error);
            throw new Error('Failed to add species');
        }
    }, []);

    const onSubmit = useCallback(async (data: SpeciesFormData) => {
        try {
            await createSpecies(data);
            setIsDrawerOpen(false);
            reset();
            fetchSpecies();
        } catch (error) {
            toast.error('Failed to add species');
        }
    }, [createSpecies, fetchSpecies, reset]);

    const handleDelete = useCallback(async (id: number) => {
        try {
            await axios.delete(`${API_URL}/species/${id}`);
            fetchSpecies();
            toast.success('Species deleted successfully');
        } catch (error) {
            console.error('Error deleting species:', error);
            toast.error('Failed to delete species');
        }
    }, [fetchSpecies]);

    if (loading) {
        return <div>Loading species...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">

                <h2 className="text-2xl font-bold">Species Management</h2>
                <div className="flex justify-between items-center mb-4">
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button className='cursor-pointer'>Add New Species</Button>
                        </DrawerTrigger>
                        <DrawerContent className='overflow-y-auto'>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <DrawerHeader>
                                    <DrawerTitle>Add New Species</DrawerTitle>
                                    <DrawerDescription>Enter species details.</DrawerDescription>
                                </DrawerHeader>
                                <div className="p-4">
                                    {[
                                        "treename", "scientificname", "hindiname", "centreoforigin", "geographicaldistribution", "iucnstatus", "totalnddbcampus", "qrcode", "link", "botanyid", "campusid"
                                    ].map((field) => (
                                        <div key={field} className="space-y-2">
                                            <Label htmlFor={field}>{field.replace(/([a-z])([A-Z])/g, '$1 $2')}</Label>
                                            <Input id={field} {...register(field as keyof SpeciesFormData, { required: field !== "hindiname" && field !== "qrcode" })} placeholder={`Enter ${field}`} />
                                            {errors[field as keyof SpeciesFormData] && <p className="text-sm text-red-500">{`${field} is required`}</p>}
                                        </div>
                                    ))}
                                </div>
                                <DrawerFooter>
                                    <Button type="submit" className='cursor-pointer'>Add Species</Button>
                                    <DrawerClose asChild>
                                        <Button variant="outline" type="button" className='cursor-pointer'>Cancel</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </form>
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>
            <Table>
                <TableCaption>List of Available Species</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Species Name</TableHead>
                        <TableHead>Scientific Name</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {species.map((sp, index) => (
                        <TableRow key={sp.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{sp.treename}</TableCell>
                            <TableCell>{sp.scientificname}</TableCell>
                            <TableCell>
                                <Button className='cursor-pointer' onClick={() => handleDelete(sp.id)}>
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

export default SpeciesManagement;
