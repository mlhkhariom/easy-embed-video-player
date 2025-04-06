
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAdmin } from '@/contexts/AdminContext';
import { PlayerSettings as PlayerSettingsType } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Volume2, Play, Box } from 'lucide-react';

const PlayerSettings = () => {
  const { settings, updateSettings } = useAdmin();
  const { toast } = useToast();
  
  const form = useForm<PlayerSettingsType>({
    defaultValues: settings.playerSettings,
  });
  
  useEffect(() => {
    if (settings.playerSettings) {
      form.reset(settings.playerSettings);
    }
  }, [settings.playerSettings, form]);
  
  const onSubmit = (data: PlayerSettingsType) => {
    updateSettings({ playerSettings: data });
    
    toast({
      title: "Settings Updated",
      description: "Player settings have been saved successfully.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Player Settings</h2>
        <p className="text-muted-foreground">
          Configure default player behavior and appearance
        </p>
      </div>
      
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="autoPlay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Play className="mr-2 h-4 w-4 text-primary" />
                          <FormLabel className="text-base">Auto Play</FormLabel>
                        </div>
                        <FormDescription>
                          Automatically play videos when loaded
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="muted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Volume2 className="mr-2 h-4 w-4 text-primary" />
                          <FormLabel className="text-base">Start Muted</FormLabel>
                        </div>
                        <FormDescription>
                          Start videos with sound muted
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="enable3DEffects"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Box className="mr-2 h-4 w-4 text-primary" />
                          <FormLabel className="text-base">3D Effects</FormLabel>
                        </div>
                        <FormDescription>
                          Enable subtle 3D hover effects for the player
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="defaultVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Volume ({Math.round(field.value * 100)}%)</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={1}
                          step={0.01}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="pt-2"
                        />
                      </FormControl>
                      <FormDescription>
                        Set the default volume level for videos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferredQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Quality</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="auto">Auto (Recommended)</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Set preferred video quality when available
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Button type="submit">Save Settings</Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default PlayerSettings;
