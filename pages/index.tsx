  import { motion, AnimatePresence } from 'framer-motion';
  import { useState, useMemo, useRef, useEffect } from 'react';
  import HeroSection from '@/components/HeroSection';
  import MovieCard from '@/components/MovieCard';
  import SearchBar from '@/components/SearchBar';
  import GenreFilter from '@/components/GenreFilter';
  import ReadingProgress from '@/components/ReadingProgress';
  import ThemeToggle from '@/components/ThemeToggle';
  import { useMovies } from '@/hooks/useMovies';
  import { FilterState } from '@/types/movie';
  import Head from 'next/head';
  import Link from 'next/link';
  import { ArrowUpIcon, FilmIcon, StarIcon, ClockIcon, FireIcon, TrophyIcon, BookmarkIcon } from '@heroicons/react/24/outline';
  import RatingDistribution from '@/components/RatingDistribution';
  import { getPublicDataBase } from '@/utils/publicDataBase';

  interface SiteConfig {
    showTrending: boolean;
    showTopRated: boolean;
    showRatingDistribution: boolean;
    showStatsBar: boolean;
    trendingCount: number;
    topRatedCount: number;
    homepageTitle: string;
    homepageSubtitle: string;
  }

  const defaultConfig: SiteConfig = {
    showTrending: true,
    showTopRated: true,
    showRatingDistribution: true,
    showStatsBar: true,
    trendingCount: 6,
    topRatedCount: 10,
    homepageTitle: 'CineReview',
    homepageSubtitle: 'Premium Movie Reviews',
  };

  const PUBLIC_DATA_BASE = getPublicDataBase();

  export default function Home() {
    const { movies, loading } = useMovies();
    const trendingRef = useRef<HTMLDivElement>(null);
    const [filters, setFilters] = useState<FilterState>({
      search: '',
      genre: '',
      rating: '',
      year: '',
    });
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultConfig);

    useEffect(() => {
      async function fetchConfig() {
        try {
          const response = await fetch(`${PUBLIC_DATA_BASE}/data/site-config.json`);
          if (!response.ok) {
            console.warn('Site config not found, using defaults.');
            return;
          }
          const data = (await response.json()) as Partial<SiteConfig>;
          setSiteConfig({ ...defaultConfig, ...data });
        } catch (err) {
          console.error('Failed to load site config:', err);
        }
      }

      fetchConfig();
    }, []);

    const filteredMovies = useMemo(() => {
      return movies.filter((movie) => {
        const matchesSearch = !filters.search || 
          movie.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          movie.director.toLowerCase().includes(filters.search.toLowerCase()) ||
          movie.cast.some(c => c.toLowerCase().includes(filters.search.toLowerCase())) ||
          movie.genre.some(g => g.toLowerCase().includes(filters.search.toLowerCase()));
        
        const matchesGenre = !filters.genre || movie.genre.includes(filters.genre);
        const matchesRating = !filters.rating || movie.rating >= parseInt(filters.rating, 10);
        return matchesSearch && matchesGenre && matchesRating;
      });
    }, [movies, filters]);

    const featuredMovie = movies.find((m) => m.isFeatured) || movies[0];
    const trendingMovies = [...movies].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, siteConfig.trendingCount);
    const topRated = [...movies].sort((a, b) => b.rating - a.rating).slice(0, siteConfig.topRatedCount);

    const stats = useMemo(() => ({
      totalMovies: movies.length,
      avgRating: movies.length > 0 ? (movies.reduce((sum, m) => sum + m.rating, 0) / movies.length).toFixed(1) : 0,
      totalGenres: [...new Set(movies.flatMap(m => m.genre))].length,
    }), [movies]);

    useEffect(() => {
      const handleScroll = () => setShowBackToTop(window.scrollY > 500);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const scrollTrending = (direction: 'left' | 'right') => {
      if (trendingRef.current) {
        trendingRef.current.scrollBy({ left: direction === 'left' ? -400 : 400, behavior: 'smooth' });
      }
    };

    return (
      <>
        <Head>
          <title>{siteConfig.homepageTitle} · {siteConfig.homepageSubtitle}</title>
          <meta name="description" content="Discover in-depth movie reviews, ratings, and recommendations" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href={`${process.env.NODE_ENV === 'production' ? '/Movie-ReviewbyshaV2' : ''}/favicon.ico`} />
        </Head>

        <ReadingProgress />

        <nav className="fixed top-0 left-0 right-0 z-40 bg-cinema-black/50 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-cinema-accent font-heading text-xl">{siteConfig.homepageTitle}</Link>
              <Link href="/" className="text-cinema-secondary hover:text-cinema-accent">Home</Link>
              <Link href="/about" className="text-cinema-secondary hover:text-cinema-accent">About</Link>
              <Link href="/admin" className="text-cinema-secondary hover:text-cinema-accent">Admin</Link>
            </div>
            <div className="flex items-center gap-4">
              <SearchBar onSearch={(query) => setFilters({ ...filters, search: query })} resultCount={filteredMovies.length} movies={movies} />
              <ThemeToggle />
            </div>
          </div>
        </nav>


        <main className="pt-28">
          {/* 🎬 Hero Section */}
          {featuredMovie && <HeroSection movie={featuredMovie} />}

          {/* 📊 Stats Bar */}
          {siteConfig.showStatsBar && (
            <section className="container mx-auto px-6 -mt-16 relative z-10">
              <motion.div className="glass-card p-6 grid grid-cols-3 gap-6 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
          )}

          {/* 🔥 Trending Reviews */}
          {siteConfig.showTrending && trendingMovies.length > 0 && (
            <section className="container mx-auto px-6 py-20">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <FireIcon className="w-8 h-8 text-cinema-accent" />
                  <h2 className="font-heading text-4xl text-cinema-text">Trending Reviews</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => scrollTrending('left')} className="glass-card p-3 rounded-full hover:bg-cinema-accent/20 transition-colors">←</button>
                  <button onClick={() => scrollTrending('right')} className="glass-card p-3 rounded-full hover:bg-cinema-accent/20 transition-colors">→</button>
                </div>
              </div>
              <div ref={trendingRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6" style={{ scrollSnapType: 'x mandatory' }}>
                {trendingMovies.map((movie, i) => (
                  <div key={movie.id} className="min-w-[280px] flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
                    <MovieCard movie={movie} index={i} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 🎭 Genre Filter + All Movies */}
          <section className="container mx-auto px-6 py-20">
            <GenreFilter selected={filters.genre} onSelect={(genre) => setFilters({ ...filters, genre })} />

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glass-card overflow-hidden animate-pulse">
                    <div className="aspect-[2/3] bg-cinema-dark" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-cinema-dark rounded w-3/4" />
                      <div className="h-4 bg-cinema-dark rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <AnimatePresence>
                  {filteredMovies.map((movie, index) => (
                    <MovieCard key={movie.id} movie={movie} index={index} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {filteredMovies.length === 0 && !loading && (
              <motion.div className="text-center py-20" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <FilmIcon className="w-16 h-16 text-cinema-secondary/30 mx-auto mb-4" />
                <p className="text-2xl text-cinema-secondary mb-2">No movies found</p>
                <p className="text-cinema-secondary/70">Try adjusting your filters</p>
                <button onClick={() => setFilters({ search: '', genre: '', rating: '', year: '' })} className="mt-4 px-6 py-2 glass-card text-cinema-accent hover:bg-cinema-accent/20 transition-colors">Clear all filters</button>
              </motion.div>
            )}
          </section>

          {/* 🏆 Top Rated */}
          {siteConfig.showTopRated && topRated.length > 0 && (
            <section className="container mx-auto px-6 py-20 border-t border-white/5">
              <div className="flex items-center gap-3 mb-8">
                <TrophyIcon className="w-8 h-8 text-cinema-gold" />
                <h2 className="font-heading text-4xl text-cinema-text">Top Rated</h2>
              </div>
              <div className="glass-card divide-y divide-white/5">
                {topRated.map((movie, i) => (
                  <Link key={movie.id} href={`/movie/${movie.slug}`} className="flex items-center gap-6 p-6 hover:bg-cinema-dark/30 transition-colors">
                    <span className="font-heading text-3xl text-cinema-secondary/50 w-8 text-center">#{i + 1}</span>
                    <img src={movie.posterUrl} alt={movie.title} className="w-14 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-cinema-text">{movie.title}</h3>
                      <p className="text-sm text-cinema-secondary">{movie.director} · {movie.genre.slice(0, 2).join(', ')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-5 h-5 text-cinema-gold" />
                      <span className="font-bold text-cinema-gold text-lg">{movie.rating}</span>
                      <span className="text-cinema-secondary text-sm">/10</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
                  {/* 📊 Rating Distribution + Quick Links */}
          {siteConfig.showRatingDistribution && (
            <section className="container mx-auto px-6 py-20 border-t border-white/5">
              <div className="grid gap-10 lg:grid-cols-2">
                <RatingDistribution movies={movies} />
                <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="font-heading text-xl mb-4 flex items-center gap-2">
                    <BookmarkIcon className="w-5 h-5 text-cinema-accent" />
                    Quick Links
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/about" className="glass-card p-4 text-center hover:bg-cinema-accent/20 transition-colors">
                      <p className="font-semibold">👤 About</p>
                      <p className="text-xs text-cinema-secondary">The Reviewer</p>
                    </Link>
                    <Link href="/admin" className="glass-card p-4 text-center hover:bg-cinema-accent/20 transition-colors">
                      <p className="font-semibold">✍️ Write Review</p>
                      <p className="text-xs text-cinema-secondary">Admin Panel</p>
                    </Link>
                    <button onClick={() => setFilters({ ...filters, rating: '9' })} className="glass-card p-4 text-center hover:bg-cinema-accent/20 transition-colors">
                      <p className="font-semibold">⭐ 9+ Rated</p>
                      <p className="text-xs text-cinema-secondary">Top Tier</p>
                    </button>
                    <button onClick={() => setFilters({ ...filters, rating: '' })} className="glass-card p-4 text-center hover:bg-cinema-accent/20 transition-colors">
                      <p className="font-semibold">🎲 All Movies</p>
                      <p className="text-xs text-cinema-secondary">Browse All</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          )}
        </main>

        <AnimatePresence>
          {showBackToTop && (
            <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={scrollToTop} className="fixed bottom-8 right-8 z-50 glass-card p-3 rounded-full hover:bg-cinema-accent/20 transition-colors" aria-label="Back to top">
              <ArrowUpIcon className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </>
    );
  }