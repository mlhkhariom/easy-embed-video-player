import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Channel, getChannelsByCategory } from '../../services/iptv';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface DataTableSearchProps {
    data: Channel[];
}

const DataTableSearch = ({ data }: DataTableSearchProps) => {
    const [input, setInput] = useState("");
    const [filteredData, setFilteredData] = useState(data);

    useEffect(() => {
        setFilteredData(
            data.filter((channel) =>
                channel.name.toLowerCase().includes(input.toLowerCase())
            )
        );
    }, [input, data]);

    return (
        <div className="flex items-center justify-between space-x-2">
            <div className="flex-1">
                <Input
                    placeholder="Filter channels..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
            </div>
            <p className="text-sm text-muted-foreground">
                {filteredData.length} of {data.length} channels
            </p>
        </div>
    );
};

interface CategorySelectProps {
    onCategoryChange: (category: string) => void;
}

const CategorySelect: React.FC<CategorySelectProps> = ({ onCategoryChange }) => {
    return (
        <Select onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="movies">Movies</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="documentary">Documentary</SelectItem>
                <SelectItem value="kids">Kids</SelectItem>
                <SelectItem value="general">General</SelectItem>
            </SelectContent>
        </Select>
    );
};

const AdminLiveTV = () => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [category, setCategory] = useState<string>('movies');
    const [loading, setLoading] = useState<boolean>(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchChannels = async () => {
            setLoading(true);
            try {
                const channelsData = await getChannelsByCategory(category);
                setChannels(channelsData);
            } catch (error) {
                console.error("Failed to fetch channels:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch channels. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchChannels();
    }, [category, toast]);

    const handleCategoryChange = (selectedCategory: string) => {
        setCategory(selectedCategory);
    };

    return (
        <AdminLayout>
            <div className="container mx-auto py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Live TV Channels</CardTitle>
                        <CardDescription>Manage and view live TV channels by category.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <CategorySelect onCategoryChange={handleCategoryChange} />
                                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Channel</Button>
                            </div>
                            {loading ? (
                                <p>Loading channels...</p>
                            ) : (
                                <>
                                    <DataTableSearch data={channels} />
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[100px]">Logo</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {channels.map((channel) => (
                                                    <TableRow key={channel.id}>
                                                        <TableCell className="font-medium">
                                                            <img src={channel.logo} alt={channel.name} className="h-8 w-auto" />
                                                        </TableCell>
                                                        <TableCell>{channel.name}</TableCell>
                                                        <TableCell>
                                                            {channel.categories.map((cat) => (
                                                                <Badge key={cat}>{cat}</Badge>
                                                            ))}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm"><Edit className="mr-2 h-4 w-4" />Edit</Button>
                                                            <Button variant="ghost" size="sm"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <div>
                            {/* Pagination controls or other footer elements can be added here */}
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminLiveTV;
