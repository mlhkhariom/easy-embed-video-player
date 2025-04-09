
import { X, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PlayerAPI } from '@/types';

interface PlayerAPISourceFormProps {
  initialData: PlayerAPI;
  onSubmit: (data: PlayerAPI) => void;
  onCancel: () => void;
  isAddingNew: boolean;
}

const PlayerAPISourceForm = ({
  initialData,
  onSubmit,
  onCancel,
  isAddingNew
}: PlayerAPISourceFormProps) => {
  const form = useForm<PlayerAPI>({
    defaultValues: initialData
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., VidSrc, SuperEmbed" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this player source
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Template</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/embed/{type}/{id}" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                URL template with placeholders: {'{id}'}, {'{type}'}, {'{season}'}, {'{episode}'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Lower numbers are tried first
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your API key if required" 
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Use {'{api_key}'} in the URL template
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Enable or disable this player source
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
        
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} type="button">
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> {isAddingNew ? 'Add Source' : 'Update Source'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PlayerAPISourceForm;
