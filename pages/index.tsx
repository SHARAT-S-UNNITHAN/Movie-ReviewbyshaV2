import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import HeroSection from '@/components/HeroSection';
import MovieCard from '@/components/MovieCard';
import SearchBar from '@/components/SearchBar';
import GenreFilter from '@/components/GenreFilter';
import ReadingProgress from '@/components/ReadingProgress';
import ThemeToggle from '@/components/ThemeToggle';
import { useMovies } from '@/hooks/useMovies';
import { FilterState } from '@/types/movie';
import Head from 'next/head';
import { ArrowUpIcon, FilmIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { movies, loading } = useMovies();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    genre: '',
    rating: '',
    year: '',
  });
  const [showBackToTop, setShowBackToTop] = useState(false);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesSearch = !filters.search || 
        movie.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        movie.director.toLowerCase().includes(filters.search.toLowerCase()) ||
        movie.genre.some(g => g.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesGenre = !filters.genre || 
        movie.genre.includes(filters.genre);
      
      const matchesRating = !filters.rating || 
        movie.rating >= parseInt(filters.rating, 10);
      
      return matchesSearch && matchesGenre && matchesRating;
    });
  }, [movies, filters]);

  const featuredMovie = movies.find((m) => m.isFeatured) || movies[0];

  // Stats
  const stats = useMemo(() => ({
    totalMovies: movies.length,
    avgRating: movies.length > 0 ? (movies.reduce((sum, m) => sum + m.rating, 0) / movies.length).toFixed(1) : 0,
    totalGenres: [...new Set(movies.flatMap(m => m.genre))].length,
  }), [movies]);

  // Scroll to top
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setShowBackToTop(window.scrollY > 500);
    });
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>CineReview - Premium Movie Reviews</title>
        <meta name="description" content="Discover in-depth movie reviews, ratings, and recommendations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={`${process.env.NODE_ENV === 'production' ? '/Movie-ReviewbyshaV2' : ''}/favicon.ico`} />
      </Head>

      <ReadingProgress />

      <nav className="fixed top-0 left-0 right-0 z-40 bg-cinema-black/50 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.h1 
            className="font-heading text-3xl text-cinema-accent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            CINEREVIEW
          </motion.h1>
          
          <div className="flex items-center gap-4">
            <SearchBar 
  onSearch={(query) => setFilters({ ...filters, search: query })} 
  resultCount={filteredMovies.length} 
  movies={movies}
/>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main>
        {featuredMovie && <HeroSection movie={featuredMovie} />}

        {/* Stats Bar */}
        <section className="container mx-auto px-6 -mt-16 relative z-10">
          <motion.div 
            className="glass-card p-6 grid grid-cols-3 gap-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col items-center gap-1">
              <FilmIcon className="w-6 h-6 text-cinema-accent" />
              <span className="text-2xl font-bold text-cinema-text">{stats.totalMovies}</span>
              <span className="text-xs text-cinema-secondary">Movies Reviewed</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StarIcon className="w-6 h-6 text-cinema-gold" />
              <span className="text-2xl font-bold text-cinema-text">{stats.avgRating}</span>
              <span className="text-xs text-cinema-secondary">Avg Rating</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ClockIcon className="w-6 h-6 text-cinema-accent" />
              <span className="text-2xl font-bold text-cinema-text">{stats.totalGenres}</span>
              <span className="text-xs text-cinema-secondary">Genres Covered</span>
            </div>
          </motion.div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <GenreFilter 
            selected={filters.genre}
            onSelect={(genre) => setFilters({ ...filters, genre })}
          />

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card overflow-hidden animate-pulse">
                  <div className="aspect-[2/3] bg-cinema-dark" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-cinema-dark rounded w-3/4" />
                    <div className="h-4 bg-cinema-dark rounded w-1/2" />
                    <div className="h-4 bg-cinema-dark rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <AnimatePresence>
                {filteredMovies.map((movie, index) => (
                  <MovieCard key={movie.id} movie={movie} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State */}
          {filteredMovies.length === 0 && !loading && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <FilmIcon className="w-16 h-16 text-cinema-secondary/30 mx-auto mb-4" />
              <p className="text-2xl text-cinema-secondary mb-2">No movies found</p>
              <p className="text-cinema-secondary/70">Try adjusting your filters or search terms</p>
              <button 
                onClick={() => setFilters({ search: '', genre: '', rating: '', year: '' })}
                className="mt-4 px-6 py-2 glass-card text-cinema-accent hover:bg-cinema-accent/20 transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </section>
      </main>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 glass-card p-3 rounded-full hover:bg-cinema-accent/20 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUpIcon className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}