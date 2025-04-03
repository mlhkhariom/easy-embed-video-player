
import { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Save, RefreshCw, Play, Settings } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

const PlayerSettings = () => {
  const { settings, updateSettings } = useAdmin();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    playerSettings: { ...settings.playerSettings },
    tmdbApiKey: settings.tmdbApiKey
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const handleQualityChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      playerSettings: {
        ...prev.playerSettings,
        defaultQuality: value as any
      }
    }));
  };
  
  const handlePlaybackSpeedChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      playerSettings: {
        ...prev.playerSettings,
        playbackSpeed: value[0]
      }
    }));
  };
  
  const handleLanguageChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      playerSettings: {
        ...prev.playerSettings,
        defaultSubtitleLanguage: value
      }
    }));
  };
  
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      tmdbApiKey: e.target.value
    }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      playerSettings: {
        ...prev.playerSettings,
        [name]: checked
      }
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      updateSettings({
        playerSettings: formData.playerSettings,
        tmdbApiKey: formData.tmdbApiKey
      });
      
      toast({
        title: "Player Settings Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your settings.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const resetSettings = () => {
    setFormData({
      playerSettings: { ...settings.playerSettings },
      tmdbApiKey: settings.tmdbApiKey
    });
    
    toast({
      title: "Settings Reset",
      description: "Player settings have been reset to their previous values.",
    });
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Player Settings</h1>
            <p className="text-gray-400">Configure video player and API settings</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={resetSettings}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-moviemate-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Play className="h-5 w-5 text-moviemate-primary" />
                    Player Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure default player behavior and appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultQuality">Default Quality</Label>
                    <Select 
                      value={formData.playerSettings.defaultQuality} 
                      onValueChange={handleQualityChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="480p">480p</SelectItem>
                        <SelectItem value="360p">360p</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoplay" className="text-base">Autoplay</Label>
                      <p className="text-sm text-gray-500">Automatically play videos when loaded</p>
                    </div>
                    <Switch
                      id="autoplay"
                      checked={formData.playerSettings.autoplay}
                      onCheckedChange={(checked) => handleSwitchChange('autoplay', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="preload" className="text-base">Preload Videos</Label>
                      <p className="text-sm text-gray-500">Buffer videos before playing</p>
                    </div>
                    <Switch
                      id="preload"
                      checked={formData.playerSettings.preload}
                      onCheckedChange={(checked) => handleSwitchChange('preload', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="subtitlesEnabled" className="text-base">Subtitles</Label>
                      <p className="text-sm text-gray-500">Enable subtitles by default</p>
                    </div>
                    <Switch
                      id="subtitlesEnabled"
                      checked={formData.playerSettings.subtitlesEnabled}
                      onCheckedChange={(checked) => handleSwitchChange('subtitlesEnabled', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultSubtitleLanguage">Default Subtitle Language</Label>
                    <Select 
                      value={formData.playerSettings.defaultSubtitleLanguage} 
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="playbackSpeed">Default Playback Speed: {formData.playerSettings.playbackSpeed}x</Label>
                    <Slider
                      id="playbackSpeed"
                      defaultValue={[formData.playerSettings.playbackSpeed]}
                      min={0.25}
                      max={2}
                      step={0.25}
                      onValueChange={handlePlaybackSpeedChange}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0.25x</span>
                      <span>0.5x</span>
                      <span>1x</span>
                      <span>1.5x</span>
                      <span>2x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="bg-moviemate-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Settings className="h-5 w-5 text-moviemate-primary" />
                    API Settings
                  </CardTitle>
                  <CardDescription>
                    Configure API keys and content sources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tmdbApiKey">TMDB API Key</Label>
                    <Input
                      id="tmdbApiKey"
                      value={formData.tmdbApiKey}
                      onChange={handleApiKeyChange}
                      placeholder="Your TMDB API Key"
                    />
                    <p className="text-xs text-gray-500">
                      The Movie Database API key for fetching content. Get a free key at{" "}
                      <a 
                        href="https://www.themoviedb.org/settings/api" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-moviemate-primary hover:underline"
                      >
                        themoviedb.org
                      </a>
                    </p>
                  </div>
                  
                  <div className="mt-8 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4"/>
                        <path d="M12 8h.01"/>
                      </svg>
                      API Usage Information
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-gray-400">
                      <li className="flex items-start gap-1">
                        <span>•</span>
                        <span>TMDB has a rate limit of 3 requests per second</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span>•</span>
                        <span>Free accounts are limited to 1,000 requests per day</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span>•</span>
                        <span>We cache API responses to reduce usage</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-moviemate-primary hover:bg-moviemate-primary/90"
                  size="lg"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default PlayerSettings;
