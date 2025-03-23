
import { Card } from '@/components/ui/card';

interface MovieErrorProps {
  message: string;
}

const MovieError = ({ message }: MovieErrorProps) => {
  return (
    <Card className="w-full p-8 border-red-500/20 bg-red-500/10">
      <h2 className="mb-4 text-2xl font-bold">Error</h2>
      <p>{message}</p>
    </Card>
  );
};

export default MovieError;
