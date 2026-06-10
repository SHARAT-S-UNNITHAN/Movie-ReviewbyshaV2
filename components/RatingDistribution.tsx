import { motion } from 'framer-motion';
import { Movie } from '@/types/movie';

interface Props {
  movies: Movie[];
}

export default function RatingDistribution({ movies }: Props) {
  const distribution = Array.from({ length: 10 }, (_, i) => {
    const rating = i + 1;
    const count = movies.filter(m => Math.floor(m.rating) === rating).length;
    const pct = movies.length > 0 ? (count / movies.length) * 100 : 0;
    return { rating, count, pct };
  });

  return (
    <div className="glass-card p-6 space-y-3">
      <h3 className="font-heading text-xl mb-4">Rating Distribution</h3>
      {distribution.reverse().map(({ rating, count, pct }) => (
        <div key={rating} className="flex items-center gap-3">
          <span className="text-sm text-cinema-secondary w-6">{rating}</span>
          <div className="flex-1 h-4 bg-cinema-dark rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cinema-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: rating * 0.05 }}
            />
          </div>
          <span className="text-xs text-cinema-secondary w-8">{count}</span>
        </div>
      ))}
    </div>
  );
}