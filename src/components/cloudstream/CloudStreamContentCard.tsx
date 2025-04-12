
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CloudStreamContent } from '@/types';
import { motion } from 'framer-motion';

interface CloudStreamContentCardProps {
  content: CloudStreamContent;
  onClick?: (content: CloudStreamContent) => void;
}

const CloudStreamContentCard = ({ content, onClick }: CloudStreamContentCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className="relative aspect-[2/3] overflow-hidden rounded-xl transition-transform duration-200 cursor-pointer shadow-lg"
        onClick={() => onClick && onClick(content)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
        
        <img 
          src={!imageError ? content.poster : 'https://via.placeholder.com/300x450?text=No+Image'} 
          alt={content.title}
          onError={handleImageError}
          className="h-full w-full object-cover"
        />
        
        {/* Enhanced glass effect info panel */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4 z-20 backdrop-blur-sm bg-black/30"
          animate={{ 
            y: isHovered ? 0 : 5,
            opacity: isHovered ? 1 : 0.9
          }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2">{content.title}</h3>
          
          <div className="flex items-center text-xs text-white/70 mt-2">
            {content.year && (
              <span className="mr-2 bg-white/10 px-2 py-1 rounded-full">{content.year}</span>
            )}
            
            <span className="capitalize text-moviemate-primary bg-moviemate-primary/10 px-2 py-1 rounded-full">{content.type}</span>
            
            {content.source && (
              <span className="ml-auto text-xs text-white/50 bg-white/5 px-2 py-1 rounded-full">{content.source}</span>
            )}
          </div>
        </motion.div>
        
        {/* Hover glow effect */}
        {isHovered && (
          <motion.div 
            className="absolute inset-0 z-5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.3)',
              borderRadius: 'inherit'
            }}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default CloudStreamContentCard;
