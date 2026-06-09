import { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch('/content/movies/index.json');
        if (!response.ok) throw new Error('Failed to fetch movies');
        const data = await response.json();
        setMovies(data);
      } catch (err) {
        console.error('Error fetching movie index:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  return { movies, loading, error };
}

export function useMovie(slug: string) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const response = await fetch(`/content/movies/${slug}.json`);
        if (!response.ok) throw new Error('Movie not found');
        const data = await response.json();
        setMovie(data);
      } catch (err) {
        console.error('Error fetching movie:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchMovie();
  }, [slug]);

  return { movie, loading };
}