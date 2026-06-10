import { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';

const PUBLIC_DATA_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch(`${PUBLIC_DATA_BASE}/data/movies.json`);
        if (!response.ok) throw new Error('Failed to fetch movies');
        const data = await response.json();
        setMovies((data as Movie[]).filter((movie) => movie.status === 'published'));
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
        const response = await fetch(`${PUBLIC_DATA_BASE}/data/movies.json`);
        if (!response.ok) throw new Error('Movie not found');
        const data: Movie[] = await response.json();
        setMovie(data.find((item) => item.slug === slug) ?? null);
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