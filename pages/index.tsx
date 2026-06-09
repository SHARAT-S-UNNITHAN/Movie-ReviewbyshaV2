import { motion } from 'framer-motion';
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

export default function Home() {
  const { movies, loading } = useMovies();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    genre: '',
    rating: '',
    year: '',
  });

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesSearch = !filters.search || 
        movie.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        movie.director.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesGenre = !filters.genre || 
        movie.genre.includes(filters.genre);
      
      const matchesRating = !filters.rating || 
        movie.rating >= parseInt(filters.rating, 10);
      
      return matchesSearch && matchesGenre && matchesRating;
    });
  }, [movies, filters]);

  const featuredMovie = movies.find((m) => m.isFeatured) || movies[0];

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
            <SearchBar onSearch={(query) => setFilters({ ...filters, search: query })} />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main>
        {featuredMovie && <HeroSection movie={featuredMovie} />}

        <section className="container mx-auto px-6 py-20">
          <GenreFilter 
            selected={filters.genre}
            onSelect={(genre) => setFilters({ ...filters, genre })}
          />

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {filteredMovies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </motion.div>

          {filteredMovies.length === 0 && !loading && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-2xl text-cinema-secondary">No movies found</p>
              <p className="text-cinema-secondary mt-2">Try adjusting your filters</p>
            </motion.div>
          )}
        </section>
      </main>
    </>
  );
}

