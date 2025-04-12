
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
        <DialogContent className="max-w-3xl rounded-xl bg-card/90 backdrop-blur-md border border-white/10 shadow-xl">
            <DialogHeader>
                <DialogTitle className="text-xl">Previewing: {channel.name}</DialogTitle>
                <DialogDescription className="text-gray-400">
                    Check the stream quality and availability
                </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 rounded-xl overflow-hidden shadow-lg">
                <ErrorHandler error={error} resetError={handleRetry} inline />
                <LiveTVPlayer
                    channel={channel}
                    streamUrl={streamUrl}
                    isLoading={isLoading}
                />
            </div>
            
            <div className="mt-4 rounded-xl bg-moviemate-card/30 backdrop-blur-sm p-4 border border-white/5">
                <h3 className="mb-3 text-sm font-medium text-moviemate-primary">Channel Details</h3>
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="bg-black/20 p-2 rounded-lg">
                        <span className="font-medium text-gray-300">Categories:</span>{' '}
                        <span className="text-white">{channel.categories.join(', ')}</span>
                    </div>
                    <div className="bg-black/20 p-2 rounded-lg">
                        <span className="font-medium text-gray-300">Languages:</span>{' '}
                        <span className="text-white">{channel.languages.length ? channel.languages.join(', ') : 'N/A'}</span>
                    </div>
                    <div className="bg-black/20 p-2 rounded-lg">
                        <span className="font-medium text-gray-300">Broadcast Area:</span>{' '}
                        <span className="text-white">{channel.broadcast_area.length ? channel.broadcast_area.join(', ') : 'N/A'}</span>
                    </div>
                    {channel.website && (
                        <div className="bg-black/20 p-2 rounded-lg">
                            <span className="font-medium text-gray-300">Website:</span>{' '}
                            <a 
                                href={channel.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-moviemate-primary underline hover:text-moviemate-primary/80 transition-colors flex items-center gap-1"
                            >
                                Visit Website
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
            
            <DialogFooter className="mt-4">
                <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 hover:bg-moviemate-primary/10 transition-colors">
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Open in Live TV
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ChannelPreviewDialog;
