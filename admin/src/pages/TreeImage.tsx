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

interface TreeImage {
    id: number;
    speciesid: number;
    imagetype?: string;
    imageurl: string;
}

interface TreeImageFormData extends Omit<TreeImage, 'id'> { }

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const TreeImage = () => {
    const [treeImages, setTreeImages] = useState<TreeImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<TreeImage | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TreeImageFormData>();

    useEffect(() => {
        fetchTreeImages();
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

    const createOrUpdateTreeImage = useCallback(async (imageData: TreeImageFormData) => {
        try {
            if (editingImage) {
                const confirmUpdate = window.confirm('Are you sure you want to update this Tree image?');
                if (!confirmUpdate) return;
                await axios.put(`${API_URL}/trees-image/${editingImage.id}`, imageData);
                toast.success('Tree image updated successfully');
            } else {
                await axios.post(`${API_URL}/trees-image`, imageData);
                toast.success('Tree image added successfully');
            }
            setIsDrawerOpen(false);
            reset();
            fetchTreeImages();
            setEditingImage(null);
        } catch (error) {
            console.error('Error saving tree image:', error);
            toast.error('Failed to save tree image');
        }
    }, [editingImage, fetchTreeImages, reset]);

    const handleEdit = (image: TreeImage) => {
        setEditingImage(image);
        setValue('speciesid', image.speciesid);
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

    if (loading) {
        return <div>Loading tree images...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Tree Images Management</h2>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button onClick={() => setEditingImage(null)}>Add New Tree Image</Button>
                    </DrawerTrigger>
                    <DrawerContent className="overflow-y-auto">
                        <form onSubmit={handleSubmit(createOrUpdateTreeImage)}>
                            <DrawerHeader>
                                <DrawerTitle>{editingImage ? 'Edit Tree Image' : 'Add New Tree Image'}</DrawerTitle>
                                <DrawerDescription>Enter tree image details.</DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 space-y-2">
                                <Label htmlFor="speciesid">Species ID</Label>
                                <Input id="speciesid" type="number" {...register("speciesid", { required: true })} placeholder="Enter Species ID" />
                                {errors.speciesid && <p className="text-sm text-red-500">Species ID is required</p>}

                                <Label htmlFor="imagetype">Image Type</Label>
                                <Input id="imagetype" {...register("imagetype")} placeholder="Enter Image Type" />

                                <Label htmlFor="imageurl">Image URL</Label>
                                <Input id="imageurl" {...register("imageurl", { required: true })} placeholder="Enter Image URL" />
                                {errors.imageurl && <p className="text-sm text-red-500">Image URL is required</p>}
                            </div>
                            <DrawerFooter>
                                <Button type="submit">{editingImage ? 'Update Image' : 'Add Image'}</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline" type="button">Cancel</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    </DrawerContent>
                </Drawer>
            </div>
            <Table>
                <TableCaption>List of Tree Images</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Species ID</TableHead>
                        <TableHead>Image Type</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {treeImages.map((img, index) => (
                        <TableRow key={img.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{img.speciesid}</TableCell>
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
                                    variant="outline" size="sm" className='cursor-pointer text-red-500 hover:text-red-700'
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
