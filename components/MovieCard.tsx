import { motion } from 'framer-motion';
import { StarIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface MovieCardProps {
  movie: {
    title: string;
    posterUrl: string;
    rating: number;
    releaseDate: string;
    runtime: number;
    genre: string[];
    slug: string;
  };
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group cursor-pointer"
    >
      <Link href={`/movie/${movie.slug}`}>
        <div className="glass-card overflow-hidden">
          <div className="relative aspect-[2/3] overflow-hidden">
            <img 
              src={movie.posterUrl} 
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <motion.div 
              className="absolute top-4 right-4"
              whileHover={{ scale: 1.1 }}
            >
              <div className="rating-circle bg-cinema-black/80 backdrop-blur-sm rounded-full p-2">
                <div className="text-cinema-gold font-bold text-sm">
                  {movie.rating}/10
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex flex-wrap gap-2">
                {movie.genre.slice(0, 3).map((genre) => (
                  <span 
                    key={genre}
                    className="px-3 py-1 bg-cinema-accent/80 backdrop-blur-sm rounded-full text-xs font-semibold"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-title text-xl font-bold mb-3 group-hover:text-cinema-accent transition-colors">
              {movie.title}
            </h3>

            <div className="flex items-center gap-4 text-sm text-cinema-secondary mb-3">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{new Date(movie.releaseDate).getFullYear()}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{movie.runtime} min</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(movie.rating / 2) ? 'text-cinema-gold' : 'text-gray-600'}`}
                />
              ))}
              <span className="ml-2 text-sm text-cinema-secondary">
                {movie.rating}/10
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
