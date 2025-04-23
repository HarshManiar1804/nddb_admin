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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Pencil, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface TreeImage {
    id: number;
    speciesid: number;
    imagetype?: string;
    imageurl: string;
    treename: string;
}

interface Species {
    id: number;
    treename: string;
    scientificname?: string;
}

// Removed redundant TreeImageFormData interface

const API_URL = import.meta.env.VITE_API_URL;

const TreeImage = () => {
    const [treeImages, setTreeImages] = useState<TreeImage[]>([]);
    const [species, setSpecies] = useState<Species[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<TreeImage | null>(null);
    const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | ''>('');
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Omit<TreeImage, 'speciesId' | 'treename'>>();

    useEffect(() => {
        fetchTreeImages();
        fetchSpecies();
    }, []);

    const fetchTreeImages = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/trees-image`);
            setTreeImages(data.data);
        } catch (error) {
            console.error('Error fetching tree images:', error);
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

    const createOrUpdateTreeImage = useCallback(async (imageData: Omit<TreeImage, 'speciesId' | 'treename'>) => {
        const finalData = {
            ...imageData,
            speciesId: Number(selectedSpeciesId)
        };

        try {
            if (editingImage) {
                const confirmUpdate = window.confirm('Are you sure you want to update this Tree image?');
                if (!confirmUpdate) return;
                await axios.put(`${API_URL}/trees-image/${editingImage.id}`, finalData);
                toast.success('Tree image updated successfully');
            } else {
                await axios.post(`${API_URL}/trees-image`, finalData);
                toast.success('Tree image added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            fetchTreeImages();
            setEditingImage(null);
            setSelectedSpeciesId('');
        } catch (error) {
            console.error('Error saving tree image:', error);
            toast.error('Failed to save tree image');
        }
    }, [editingImage, fetchTreeImages, reset, selectedSpeciesId]);

    const handleEdit = (image: TreeImage) => {
        setEditingImage(image);
        setSelectedSpeciesId(image.speciesid);
        setValue('imagetype', image.imagetype || '');
        setValue('imageurl', image.imageurl);
        setIsDrawerOpen(true);
    };

    const handleDelete = useCallback(async (id: number) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this Tree Image?');
        if (!confirmDelete) return;
        try {
            await axios.delete(`${API_URL}/trees-image/${id}`);
            fetchTreeImages();
            toast.success('Tree image deleted successfully');
        } catch (error) {
            console.error('Error deleting tree image:', error);
            toast.error('Failed to delete tree image');
        }
    }, [fetchTreeImages]);

    const handleSpeciesChange = (value: string) => {
        setSelectedSpeciesId(Number(value));
    };

    const filteredImages = treeImages.filter((img) =>
        img.treename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (img.imagetype?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div>Loading tree images...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <h2 className="text-2xl font-bold">Tree Images Management</h2>
                <div className="flex items-center gap-4 w-full sm:w-auto">

                    <Input
                        type="text"
                        placeholder="Search by species or image type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 mr-2"
                    />
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button onClick={() => {
                                setEditingImage(null);
                                setSelectedSpeciesId('');
                                reset();
                            }}>Add New Tree Image</Button>
                        </DrawerTrigger>
                        <DrawerContent className="overflow-y-auto">
                            <form onSubmit={handleSubmit(createOrUpdateTreeImage)}>
                                <DrawerHeader>
                                    <DrawerTitle>{editingImage ? 'Edit Tree Image' : 'Add New Tree Image'}</DrawerTitle>
                                    <DrawerDescription>Enter tree image details.</DrawerDescription>
                                </DrawerHeader>
                                <div className="p-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="speciesid">Species</Label>
                                        <Select value={selectedSpeciesId.toString()} onValueChange={handleSpeciesChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a species" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {species.map((s) => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>
                                                        {` ${s.id} : ${s.treename}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {!selectedSpeciesId && <p className="text-sm text-red-500">Species is required</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="imagetype">Image Type</Label>
                                        <Input id="imagetype" {...register("imagetype")} placeholder="Enter Image Type" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="imageurl">Image URL</Label>
                                        <Input id="imageurl" {...register("imageurl", { required: true })} placeholder="Enter Image URL" />
                                        {errors.imageurl && <p className="text-sm text-red-500">Image URL is required</p>}
                                    </div>
                                </div>
                                <DrawerFooter>
                                    <Button type="submit" disabled={!selectedSpeciesId}>
                                        {editingImage ? 'Update Image' : 'Add Image'}
                                    </Button>
                                    <DrawerClose asChild>
                                        <Button variant="outline" type="button">Cancel</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </form>
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>
            <Table>
                <TableCaption>List of Tree Images</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Species</TableHead>
                        <TableHead>Image Type</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredImages.map((img, index) => (
                        <TableRow key={img.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{img.treename}</TableCell>
                            <TableCell>{img.imagetype || 'N/A'}</TableCell>
                            <TableCell>
                                <img src={img.imageurl} alt="Tree" className="w-20 h-20 object-cover" />
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(img.imageurl, '_blank')}>
                                    <Eye size={16} />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    onClick={() => handleEdit(img)}>
                                    <Pencil size={16} />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outline" size="sm" className="cursor-pointer text-red-500 hover:text-red-700"
                                    onClick={() => handleDelete(img.id)}>
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

export default TreeImage;
