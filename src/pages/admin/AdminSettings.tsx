
import { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Undo2, Wand2 } from 'lucide-react';

const AdminSettings = () => {
  const { settings, updateSettings } = useAdmin();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ ...settings });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    toast({
      title: 'Settings Updated',
      description: 'Your changes have been saved successfully.',
    });
  };
  
  const resetChanges = () => {
    setFormData({ ...settings });
    toast({
      title: 'Changes Reset',
      description: 'All changes have been reverted.',
    });
  };
  
  const applyRandomTheme = () => {
    // Generate a random color in the purple/blue spectrum
    const hue = Math.floor(Math.random() * 60) + 240; // 240-300 is purple/blue range
    const saturation = Math.floor(Math.random() * 30) + 70; // 70-100% saturation
    const lightness = Math.floor(Math.random() * 20) + 50; // 50-70% lightness
    
    const newColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    
    setFormData(prev => ({
      ...prev,
      primaryColor: newColor
    }));
    
    toast({
      title: 'Theme Applied',
      description: 'A new random theme has been applied. Remember to save your changes!',
    });
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Site Settings</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={resetChanges}>
              <Undo2 className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={applyRandomTheme} className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Wand2 className="mr-2 h-4 w-4" />
              Random Theme
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card className="bg-moviemate-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">General Settings</CardTitle>
                  <CardDescription>
                    Configure the basic information for your FreeCinema site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={formData.siteName}
                      onChange={handleChange}
                      placeholder="FreeCinema"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      name="siteDescription"
                      value={formData.siteDescription}
                      onChange={handleChange}
                      placeholder="Watch movies and TV shows online for free"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                    <Input
                      id="logoUrl"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                    />
                    {formData.logoUrl && (
                      <div className="mt-2 rounded bg-moviemate-background p-2">
                        <img 
                          src={formData.logoUrl} 
                          alt="Logo preview" 
                          className="mx-auto h-20 object-contain" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tmdbApiKey">TMDB API Key</Label>
                    <Input
                      id="tmdbApiKey"
                      name="tmdbApiKey"
                      value={formData.tmdbApiKey}
                      onChange={handleChange}
                      placeholder="Your TMDB API Key"
                    />
                    <p className="text-xs text-gray-500">
                      Default key is provided but you can use your own for better performance
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card className="bg-moviemate-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize the look and feel of your FreeCinema site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-4">
                      <div 
                        className="h-10 w-10 rounded" 
                        style={{ backgroundColor: formData.primaryColor }}
                      ></div>
                      <Input
                        id="primaryColor"
                        name="primaryColor"
                        value={formData.primaryColor}
                        onChange={handleChange}
                        placeholder="#9b87f5"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customCSS">Custom CSS</Label>
                    <Textarea
                      id="customCSS"
                      name="customCSS"
                      value={formData.customCSS}
                      onChange={handleChange}
                      placeholder=".custom-class { color: white; }"
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Add custom CSS to further customize your site's appearance
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="features">
              <Card className="bg-moviemate-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Feature Settings</CardTitle>
                  <CardDescription>
                    Enable or disable features for your FreeCinema site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableLiveTV" className="text-base">Live TV</Label>
                      <p className="text-sm text-gray-500">Enable the Live TV section on your site</p>
                    </div>
                    <Switch
                      id="enableLiveTV"
                      checked={formData.enableLiveTV}
                      onCheckedChange={(checked) => handleSwitchChange('enableLiveTV', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableCloudStream" className="text-base">CloudStream Content</Label>
                      <p className="text-sm text-gray-500">Enable CloudStream content from CSX and Phisher extensions</p>
                    </div>
                    <Switch
                      id="enableCloudStream"
                      checked={formData.enableCloudStream}
                      onCheckedChange={(checked) => handleSwitchChange('enableCloudStream', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableAutoPlay" className="text-base">Auto Play</Label>
                      <p className="text-sm text-gray-500">Automatically play content after a countdown</p>
                    </div>
                    <Switch
                      id="enableAutoPlay"
                      checked={formData.enableAutoPlay}
                      onCheckedChange={(checked) => handleSwitchChange('enableAutoPlay', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable3DEffects" className="text-base">3D Effects</Label>
                      <p className="text-sm text-gray-500">Enable 3D effects and animations across the site</p>
                    </div>
                    <Switch
                      id="enable3DEffects"
                      checked={formData.enable3DEffects}
                      onCheckedChange={(checked) => handleSwitchChange('enable3DEffects', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              className="bg-moviemate-primary hover:bg-moviemate-primary/90"
              size="lg"
            >
              <Save className="mr-2 h-5 w-5" />
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
