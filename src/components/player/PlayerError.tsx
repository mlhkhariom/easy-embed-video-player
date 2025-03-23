
import { motion } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface PlayerErrorProps {
  playerError: string | null;
  resetError: () => void;
}

const PlayerError = ({ playerError, resetError }: PlayerErrorProps) => {
  if (!playerError) return null;

  return (
    <motion.div 
      className="relative overflow-hidden rounded-xl border border-red-500/20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Alert variant="destructive" className="border-0 bg-red-500/10">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="font-medium text-white">Player Error</AlertTitle>
        <AlertDescription className="text-gray-300">
          {playerError}. Please try again or check back later.
        </AlertDescription>
      </Alert>
      
      <div className="absolute -bottom-8 -left-8 h-16 w-64 rounded-full bg-red-500/10 blur-xl"></div>
      <div className="absolute -top-8 -right-8 h-16 w-64 rounded-full bg-red-500/5 blur-xl"></div>
    </motion.div>
  );
};

export default PlayerError;
