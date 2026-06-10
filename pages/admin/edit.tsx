import { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import ThemeToggle from '@/components/ThemeToggle';
import { Movie } from '@/types/movie';
import { GitHubPublishError, createMovieReview, deleteMovie } from '@/utils/github';

const PUBLIC_DATA_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function AdminEditPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [githubToken, setGithubToken] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setGithubToken(localStorage.getItem('adminGithubToken') || '');
  }, []);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch(`${PUBLIC_DATA_BASE}/data/movies.json`);
        if (!response.ok) throw new Error('Failed to load movies');
        const data = (await response.json()) as Movie[];
        setMovies(data);
      } catch (err) {
        console.error('Error loading movies:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setMessage('');
  };

  const handleMovieChange = <K extends keyof Movie>(key: K, value: Movie[K]) => {
    setSelectedMovie((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    const token = githubToken.trim();
    if (!token) {
      setMessage('Please add your GitHub token before saving edits.');
      setSubmitting(false);
      return;
    }

    if (!selectedMovie) {
      setMessage('Select a review to edit first.');
      setSubmitting(false);
      return;
    }

    localStorage.setItem('adminGithubToken', token);

    try {
      await createMovieReview(selectedMovie, token);
      const updatedMovies = movies.map((movie) => (movie.slug === selectedMovie.slug ? selectedMovie : movie));
      setMovies(updatedMovies);
      setMessage('Review updated successfully.');
    } catch (err) {
      if (err instanceof GitHubPublishError && err.status === 401) {
        localStorage.removeItem('adminGithubToken');
        setGithubToken('');
        setMessage('GitHub rejected this token. Provide a valid token and try again.');
      } else {
        setMessage(err instanceof Error ? err.message : 'Failed to save review.');
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slug: string) => {
    const token = githubToken.trim();
    if (!token) {
      setMessage('Please add your GitHub token before deleting.');
      return;
    }

    if (!confirm('Delete this review forever?')) {
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      await deleteMovie(slug, token);
      setMovies((current) => current.filter((movie) => movie.slug !== slug));
      if (selectedMovie?.slug === slug) {
        setSelectedMovie(null);
      }
      setMessage('Review deleted successfully.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to delete review.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Edit Reviews · CineReview</title>
        <meta name="description" content="Edit or delete CineReview movie reviews" />
      </Head>

      <nav className="fixed top-0 left-0 right-0 z-40 bg-cinema-black/50 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-cinema-accent font-heading text-xl">CineReview</Link>
            <Link href="/" className="text-cinema-secondary hover:text-cinema-accent">Home</Link>
            <Link href="/about" className="text-cinema-secondary hover:text-cinema-accent">About</Link>
            <Link href="/admin" className="text-cinema-secondary hover:text-cinema-accent">Admin</Link>
          </div>
          <div className="flex items-center gap-4">
            <SearchBar onSearch={() => {}} movies={[]} />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="pt-28 min-h-screen bg-cinema-black text-cinema-text">
        <div className="container mx-auto px-6 py-12 max-w-6xl space-y-8">
          <div className="glass-card p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="font-heading text-5xl text-cinema-accent">Edit Reviews</h1>
                <p className="text-cinema-secondary mt-2">Select a review to update the details or delete it entirely.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin" className="glass-card px-5 py-3 hover:bg-cinema-accent/20 transition-colors">Dashboard</Link>
                <Link href="/admin/config" className="glass-card px-5 py-3 hover:bg-cinema-accent/20 transition-colors">Site Config</Link>
              </div>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
            <section className="glass-card p-8">
              <h2 className="font-heading text-3xl mb-6">Review Library</h2>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="h-16 glass-card animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {movies.length === 0 && <p className="text-cinema-secondary">No reviews found.</p>}
                  {movies.map((movie) => (
                    <div
                      key={movie.slug}
                      className={`glass-card p-4 border ${selectedMovie?.slug === movie.slug ? 'border-cinema-accent' : 'border-white/10'} hover:border-cinema-accent transition-colors`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <button type="button" onClick={() => handleSelectMovie(movie)} className="text-left">
                          <p className="font-semibold text-cinema-text">{movie.title}</p>
                          <p className="text-sm text-cinema-secondary">{movie.status} · {movie.rating}/10</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(movie.slug)}
                          className="text-sm uppercase tracking-[0.18em] text-red-400 hover:text-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="glass-card p-8">
              <h2 className="font-heading text-3xl mb-6">Selected Review</h2>
              {!selectedMovie ? (
                <p className="text-cinema-secondary">Choose a review from the list to edit its details.</p>
              ) : (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Title</label>
                      <input
                        type="text"
                        value={selectedMovie.title}
                        onChange={(e) => handleMovieChange('title', e.target.value)}
                        className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Status</label>
                      <select
                        value={selectedMovie.status}
                        onChange={(e) => handleMovieChange('status', e.target.value as Movie['status'])}
                        className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Poster URL</label>
                      <input
                        type="url"
                        value={selectedMovie.posterUrl}
                        onChange={(e) => handleMovieChange('posterUrl', e.target.value)}
                        className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Backdrop URL</label>
                      <input
                        type="url"
                        value={selectedMovie.backdropUrl}
                        onChange={(e) => handleMovieChange('backdropUrl', e.target.value)}
                        className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Release Date</label>
                      <input
                        type="date"
                        value={selectedMovie.releaseDate}
                        onChange={(e) => handleMovieChange('releaseDate', e.target.value)}
                        className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Director</label>
                      <input
                        type="text"
                        value={selectedMovie.director}
                        onChange={(e) => handleMovieChange('director', e.target.value)}
                        className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Runtime</label>
                      <input
                        type="number"
                        value={selectedMovie.runtime}
                        onChange={(e) => handleMovieChange('runtime', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Rating</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={selectedMovie.rating}
                        onChange={(e) => handleMovieChange('rating', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Genre (comma-separated)</label>
                    <input
                      type="text"
                      value={selectedMovie.genre.join(', ')}
                      onChange={(e) => handleMovieChange('genre', e.target.value.split(',').map((item) => item.trim()))}
                      className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Cast (comma-separated)</label>
                    <input
                      type="text"
                      value={selectedMovie.cast.join(', ')}
                      onChange={(e) => handleMovieChange('cast', e.target.value.split(',').map((item) => item.trim()))}
                      className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Review Summary</label>
                    <textarea
                      value={selectedMovie.reviewSummary}
                      onChange={(e) => handleMovieChange('reviewSummary', e.target.value)}
                      rows={3}
                      className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">What I Loved</label>
                    <textarea
                      value={selectedMovie.whatILoved.join('\n')}
                      onChange={(e) => handleMovieChange('whatILoved', e.target.value.split('\n').map((value) => value.trim()).filter(Boolean))}
                      rows={4}
                      className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">What I Didn&apos;t Like</label>
                    <textarea
                      value={selectedMovie.whatIDidntLike.join('\n')}
                      onChange={(e) => handleMovieChange('whatIDidntLike', e.target.value.split('\n').map((value) => value.trim()).filter(Boolean))}
                      rows={4}
                      className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Final Verdict</label>
                    <textarea
                      value={selectedMovie.finalVerdict}
                      onChange={(e) => handleMovieChange('finalVerdict', e.target.value)}
                      rows={3}
                      className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={selectedMovie.isFeatured}
                      onChange={(e) => handleMovieChange('isFeatured', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <label htmlFor="isFeatured" className="text-sm font-semibold">Featured</label>
                  </div>

                  <div className="glass-card p-6 bg-cinema-dark">
                    <label className="block text-sm font-semibold mb-2">GitHub Token</label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      className="w-full bg-cinema-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                      autoComplete="off"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-cinema-accent text-white py-4 rounded-lg font-heading text-2xl hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Review'}
                  </button>

                  {message && (
                    <div className="glass-card p-6 text-center">
                      <p className="text-lg">{message}</p>
                    </div>
                  )}
                </form>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
