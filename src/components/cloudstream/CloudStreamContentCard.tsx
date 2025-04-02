
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CloudStreamContent } from '@/services/cloudstream';

interface CloudStreamContentCardProps {
  content: CloudStreamContent;
  onClick?: (content: CloudStreamContent) => void;
}

const CloudStreamContentCard = ({ content, onClick }: CloudStreamContentCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card 
      className="relative aspect-[2/3] overflow-hidden rounded-lg transition-transform duration-200 cursor-pointer hover:scale-105"
      onClick={() => onClick && onClick(content)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
      
      <img 
        src={!imageError ? content.poster : 'https://via.placeholder.com/300x450?text=No+Image'} 
        alt={content.title}
        onError={handleImageError}
        className="h-full w-full object-cover"
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
        <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2">{content.title}</h3>
        
        <div className="flex items-center text-xs text-white/70 mt-1">
          {content.year && (
            <span className="mr-2">{content.year}</span>
          )}
          
          <span className="capitalize text-moviemate-primary">{content.type}</span>
          
          {content.source && (
            <span className="ml-auto text-xs text-white/50">{content.source}</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CloudStreamContentCard;
