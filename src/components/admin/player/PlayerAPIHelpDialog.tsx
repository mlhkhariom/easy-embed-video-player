
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PlayerAPIHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlayerAPIHelpDialog = ({ open, onOpenChange }: PlayerAPIHelpDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Player API URL Format Guide</DialogTitle>
          <DialogDescription>
            Use these placeholders in your URL templates for dynamic content
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Available Placeholders</h4>
            <ul className="mt-2 space-y-2">
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
            <h4 className="font-medium">Example Templates</h4>
            <div className="mt-2 space-y-2">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium mb-1">VidSrc</p>
                <code className="text-sm">https://vidsrc.dev/embed/{'{type}'}/{'{id}'}</code>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium mb-1">SuperEmbed</p>
                <code className="text-sm">https://multiembed.mov/directstream.php?video_id={'{id}'}&{'{type}'}=1</code>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium mb-1">With Season & Episode</p>
                <code className="text-sm">https://example.com/play?id={'{id}'}&s={'{season}'}&e={'{episode}'}</code>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium mb-1">With API Key</p>
                <code className="text-sm">https://api.example.com/stream/{'{id}'}?key={'{api_key}'}</code>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerAPIHelpDialog;
