
interface PlayerFooterProps {
  isMovie: boolean;
}

const PlayerFooter = ({ isMovie }: PlayerFooterProps) => {
  return (
    <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-400">
      <span className="rounded-full bg-moviemate-card px-3 py-1">HD 1080p</span>
      <span className="rounded-full bg-moviemate-card px-3 py-1">Premium Quality</span>
      <span className="rounded-full bg-moviemate-card px-3 py-1">Ad Free</span>
      {isMovie ? (
        <span className="rounded-full bg-moviemate-card px-3 py-1">Movie</span>
      ) : (
        <span className="rounded-full bg-moviemate-card px-3 py-1">TV Show</span>
      )}
    </div>
  );
};

export default PlayerFooter;
