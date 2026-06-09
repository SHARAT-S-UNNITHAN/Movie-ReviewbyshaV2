import { motion, useScroll, useTransform } from 'framer-motion';
import { PlayIcon, StarIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/Movie-ReviewbyshaV2' : '';

interface HeroSectionProps {
  movie: {
    title: string;
    backdropUrl: string;
    rating: number;
    reviewSummary: string;
    slug: string;
    trailerUrl: string;
  };
}

export default function HeroSection({ movie }: HeroSectionProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <motion.section 
      className="relative h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${movie.backdropUrl})`,
          y,
        }}
      >
        <div className="absolute inset-0 hero-gradient" />
      </motion.div>

      <motion.div 
        className="relative z-10 container mx-auto px-6 h-full flex items-center"
        style={{ opacity }}
      >
        <div className="max-w-3xl">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-cinema-accent/20 text-cinema-accent rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
              Featured Review
            </span>
          </motion.div>

          <motion.h1 
            className="font-heading text-8xl md:text-9xl text-cinema-text mb-6 leading-none"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {movie.title}
          </motion.h1>

          <motion.div 
            className="flex items-center gap-4 mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="rating-circle">
              <svg viewBox="0 0 36 36">
                <circle className="bg-circle" cx="18" cy="18" r="16" />
                <circle 
                  className="progress-circle" 
                  cx="18" cy="18" r="16"
                  strokeDasharray={`${(movie.rating / 10) * 100} 100`}
                />
              </svg>
              <span className="absolute text-lg font-bold text-cinema-gold">
                {movie.rating}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i}
                  className={`w-6 h-6 ${i < Math.floor(movie.rating / 2) ? 'text-cinema-gold' : 'text-gray-600'}`}
                />
              ))}
            </div>
          </motion.div>

          <motion.p 
            className="text-xl text-cinema-secondary mb-8 max-w-2xl"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            {movie.reviewSummary}
          </motion.p>

          <motion.div 
            className="flex gap-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            <Link
              href={movie.trailerUrl}
              target="_blank"
              className="glass-card px-8 py-4 flex items-center gap-3 hover:bg-cinema-accent/20 group"
            >
              <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Watch Trailer</span>
            </Link>
            <Link
              href={`${BASE_PATH}/movie/${movie.slug}`}
              className="glass-card px-8 py-4 flex items-center gap-3 hover:bg-cinema-accent/20 group"
            >
              <InformationCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Read Review</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </motion.div>
    </motion.section>
  );
}
