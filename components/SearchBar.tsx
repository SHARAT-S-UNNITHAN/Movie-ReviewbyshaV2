import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Movie } from '@/types/movie';

interface SearchBarProps {
  onSearch: (query: string) => void;
  resultCount?: number;
  movies?: Movie[];
  basePath?: string;
}

export default function SearchBar({ onSearch, resultCount = 0, movies = [], basePath = '' }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const filteredMovies = query
    ? movies.filter(m => 
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.director.toLowerCase().includes(query.toLowerCase()) ||
        m.genre.some(g => g.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="glass-card p-3 rounded-full relative group"
        aria-label="Search movies"
      >
        <MagnifyingGlassIcon className="w-6 h-6" />
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-cinema-secondary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ctrl+K
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-cinema-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="container mx-auto px-6 pt-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-cinema-secondary" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search movies, directors, genres..."
                    className="w-full glass-card py-4 pl-14 pr-12 text-xl bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-cinema-accent/50 text-cinema-text placeholder:text-cinema-secondary/50"
                    autoComplete="off"
                  />
                  {query && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-cinema-dark/50 rounded-full p-1 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-cinema-secondary hover:text-cinema-text" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {query && filteredMovies.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 glass-card overflow-hidden"
                    >
                      {filteredMovies.map((movie) => (
                        <Link
                          key={movie.id}
                          href={`${basePath}/movie/${movie.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 p-4 hover:bg-cinema-dark/50 transition-colors border-b border-white/5 last:border-0"
                        >
                          <img 
                            src={movie.posterUrl} 
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                          <div>
                            <p className="font-semibold text-cinema-text">{movie.title}</p>
                            <p className="text-sm text-cinema-secondary">{movie.director} · {movie.rating}/10</p>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  {query && filteredMovies.length === 0 ? (
                    <p className="text-cinema-secondary">No movies found for "{query}"</p>
                  ) : query ? (
                    <p className="text-cinema-secondary text-sm">
                      <span className="text-cinema-accent font-semibold">{resultCount}</span> movies match your search
                    </p>
                  ) : (
                    <p className="text-cinema-secondary text-sm">
                      Press <kbd className="px-2 py-0.5 bg-cinema-dark rounded text-xs border border-white/10">Esc</kbd> to close
                    </p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}