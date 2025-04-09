
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import LiveTVPlayer from '@/components/LiveTVPlayer';
import { Channel } from '@/services/iptv';
import ErrorHandler from '@/components/ErrorHandler';

interface ChannelPreviewDialogProps {
    channel: Channel;
}

const ChannelPreviewDialog = ({ channel }: ChannelPreviewDialogProps) => {
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const loadStream = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const { getStreamForChannel } = await import('@/services/iptv');
                const stream = await getStreamForChannel(channel.id);
                if (stream) {
                    setStreamUrl(stream.url);
                } else {
                    throw new Error("No stream found for this channel");
                }
            } catch (error) {
                console.error("Error loading stream:", error);
                setError(error instanceof Error ? error : new Error(String(error)));
                toast({
                    title: "Stream Unavailable",
                    description: "Failed to load the stream",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadStream();
    }, [channel.id, toast]);

    const handleRetry = () => {
        setStreamUrl(null);
        setIsLoading(true);
        setError(null);
        
        // Re-trigger the useEffect by updating a key dependency
        const timestamp = Date.now();
        const retryChannel = { ...channel, _retry: timestamp };
        // This hack forces the useEffect to re-run
        setTimeout(() => {
            const loadStream = async () => {
                try {
                    const { getStreamForChannel } = await import('@/services/iptv');
                    const stream = await getStreamForChannel(retryChannel.id);
                    if (stream) {
                        setStreamUrl(stream.url);
                    } else {
                        throw new Error("No stream found for this channel");
                    }
                } catch (error) {
                    setError(error instanceof Error ? error : new Error(String(error)));
                    toast({
                        title: "Stream Unavailable",
                        description: "Failed to load the stream on retry",
                        variant: "destructive",
                    });
                } finally {
                    setIsLoading(false);
                }
            };
            loadStream();
        }, 1000);
    };

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Previewing: {channel.name}</DialogTitle>
                <DialogDescription>
                    Check the stream quality and availability
                </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
                <ErrorHandler error={error} resetError={handleRetry} inline />
                <LiveTVPlayer
                    channel={channel}
                    streamUrl={streamUrl}
                    isLoading={isLoading}
                />
            </div>
            
            <div className="mt-4 rounded-md bg-secondary/50 p-3">
                <h3 className="mb-2 text-sm font-medium">Channel Details</h3>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div>
                        <span className="font-medium">Categories:</span>{' '}
                        {channel.categories.join(', ')}
                    </div>
                    <div>
                        <span className="font-medium">Languages:</span>{' '}
                        {channel.languages.length ? channel.languages.join(', ') : 'N/A'}
                    </div>
                    <div>
                        <span className="font-medium">Broadcast Area:</span>{' '}
                        {channel.broadcast_area.length ? channel.broadcast_area.join(', ') : 'N/A'}
                    </div>
                    {channel.website && (
                        <div>
                            <span className="font-medium">Website:</span>{' '}
                            <a 
                                href={channel.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary underline"
                            >
                                Visit Website
                            </a>
                        </div>
                    )}
                </div>
            </div>
            
            <DialogFooter>
                <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Live TV
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ChannelPreviewDialog;
