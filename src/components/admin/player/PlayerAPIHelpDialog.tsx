
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PlayerAPIHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlayerAPIHelpDialog = ({ open, onOpenChange }: PlayerAPIHelpDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Player API Configuration Guide</DialogTitle>
          <DialogDescription>
            Configure various video player APIs for your content
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="placeholders" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="placeholders">Placeholders</TabsTrigger>
            <TabsTrigger value="examples">API Examples</TabsTrigger>
            <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="placeholders" className="space-y-4">
            <div>
              <h4 className="font-medium text-lg mb-2">Available Placeholders</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <code className="bg-muted p-1 rounded mr-2">{'{'}<span className="text-blue-500">id</span>{'}'}</code>
                  <span>- TMDB ID or IMDB ID of the content</span>
                </li>
                <li className="flex items-start">
                  <code className="bg-muted p-1 rounded mr-2">{'{'}<span className="text-blue-500">type</span>{'}'}</code>
                  <span>- Either "movie" or "tv"</span>
                </li>
                <li className="flex items-start">
                  <code className="bg-muted p-1 rounded mr-2">{'{'}<span className="text-blue-500">season</span>{'}'}</code>
                  <span>- Season number for TV shows</span>
                </li>
                <li className="flex items-start">
                  <code className="bg-muted p-1 rounded mr-2">{'{'}<span className="text-blue-500">episode</span>{'}'}</code>
                  <span>- Episode number for TV shows</span>
                </li>
                <li className="flex items-start">
                  <code className="bg-muted p-1 rounded mr-2">{'{'}<span className="text-blue-500">api_key</span>{'}'}</code>
                  <span>- Your API key (if needed)</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-2">Format Rules</h4>
              <ul className="space-y-2">
                <li>For TV shows, you need both season and episode placeholders</li>
                <li>For APIs that support both IMDB and TMDB, the system will try IMDB first if available</li>
                <li>URLs are cleaned up before use (removing unused placeholders)</li>
                <li>Priority determines the order APIs are tried (lower numbers first)</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-md">
                <h5 className="font-medium mb-1">VidSrc ICU</h5>
                <code className="text-sm block mb-2">https://vidsrc.icu/embed/{'{type}'}/{'{id}'}/{'{season}'}/{'{episode}'}</code>
                <p className="text-xs text-muted-foreground">Supports both IMDB and TMDB IDs</p>
              </div>
              
              <div className="p-3 bg-muted rounded-md">
                <h5 className="font-medium mb-1">Embed.su</h5>
                <code className="text-sm block mb-2">https://embed.su/embed/{'{type}'}/{'{id}'}/{'{season}'}/{'{episode}'}</code>
                <p className="text-xs text-muted-foreground">Automatically updates with new content</p>
              </div>
              
              <div className="p-3 bg-muted rounded-md">
                <h5 className="font-medium mb-1">VidLink Pro</h5>
                <code className="text-sm block mb-2">https://vidlink.pro/{'{type}'}/{'{id}'}/{'{season}'}/{'{episode}'}</code>
                <p className="text-xs text-muted-foreground">Uses only TMDB IDs, highly customizable</p>
              </div>
              
              <div className="p-3 bg-muted rounded-md">
                <h5 className="font-medium mb-1">MultiEmbed VIP</h5>
                <code className="text-sm block mb-2">https://multiembed.mov/directstream.php?video_id={'{id}'}&{'{type}'}=1&s={'{season}'}&e={'{episode}'}</code>
                <p className="text-xs text-muted-foreground">Reduced ads, fast HLS streaming</p>
              </div>
              
              <div className="p-3 bg-muted rounded-md">
                <h5 className="font-medium mb-1">MultiEmbed Basic</h5>
                <code className="text-sm block mb-2">https://multiembed.mov/?video_id={'{id}'}&{'{type}'}=1&s={'{season}'}&e={'{episode}'}</code>
                <p className="text-xs text-muted-foreground">Works on all platforms including Blogger</p>
              </div>
              
              <div className="p-3 bg-muted rounded-md">
                <h5 className="font-medium mb-1">Availability Check</h5>
                <code className="text-sm block mb-2">https://multiembed.mov/directstream.php?video_id={'{id}'}&check=1</code>
                <p className="text-xs text-muted-foreground">Returns 1 if content is available, 0 if not</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-4">
            <div>
              <h4 className="font-medium text-lg mb-2">Best Practices</h4>
              <ul className="space-y-2">
                <li>Configure multiple player APIs to ensure fallback options</li>
                <li>Use availability checking when possible to avoid broken players</li>
                <li>Give higher priority to higher quality sources with fewer ads</li>
                <li>Test each API with both movies and TV shows to ensure compatibility</li>
                <li>If a source frequently fails, disable it or lower its priority</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-2">Customization Parameters</h4>
              <p className="mb-2">Some APIs support additional parameters:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-2 bg-muted/50 rounded">
                  <code className="text-xs">primaryColor=B20710</code>
                  <p className="text-xs text-muted-foreground mt-1">Set player primary color</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <code className="text-xs">autoplay=false</code>
                  <p className="text-xs text-muted-foreground mt-1">Disable autoplay</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <code className="text-xs">sub_file=https://example.com/subs.vtt</code>
                  <p className="text-xs text-muted-foreground mt-1">Add external subtitles</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <code className="text-xs">player=jw</code>
                  <p className="text-xs text-muted-foreground mt-1">Force specific player</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerAPIHelpDialog;
