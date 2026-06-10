import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import ThemeToggle from '@/components/ThemeToggle';
import { Movie } from '@/types/movie';
import { GitHubPublishError, createMovieReview, deleteMovie } from '@/utils/github';
import { getPublicDataBase } from '@/utils/publicDataBase';

const PUBLIC_DATA_BASE = getPublicDataBase();

export default function AdminDashboard() {
  const [formData, setFormData] = useState<Partial<Movie>>({
    status: 'published',
    genre: [],
    cast: [],
    whatILoved: [],
    whatIDidntLike: [],
    isFeatured: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  useEffect(() => {
    setGithubToken(localStorage.getItem('adminGithubToken') || '');
  }, []);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch(`${PUBLIC_DATA_BASE}/data/movies.json`);
        if (!response.ok) throw new Error('Failed to load movies');
        const data = (await response.json()) as Movie[];
        setAllMovies(data);
      } catch (err) {
        console.error('Error loading movie data:', err);
      } finally {
        setLoadingMovies(false);
      }
    }

    fetchMovies();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const token = githubToken.trim();
    if (!token) {
      setMessage('Add a GitHub token before publishing.');
      setSubmitting(false);
      return;
    }

    localStorage.setItem('adminGithubToken', token);

    if (!formData.title) {
      setMessage('Movie title is required.');
      setSubmitting(false);
      return;
    }

    const slug = (formData.title || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const movie: Movie = {
      ...(formData as Movie),
      id: formData.id || Date.now().toString(),
      slug,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: formData.status || 'published',
    };

    try {
      await createMovieReview(movie, token);
      setMessage('Review published. Site data was updated successfully.');
      const response = await fetch(`${PUBLIC_DATA_BASE}/data/movies.json`);
      if (response.ok) {
        setAllMovies((await response.json()) as Movie[]);
      }
      setFormData({
        status: 'published',
        genre: [],
        cast: [],
        whatILoved: [],
        whatIDidntLike: [],
        isFeatured: false,
      });
    } catch (err) {
      if (err instanceof GitHubPublishError && err.status === 401) {
        localStorage.removeItem('adminGithubToken');
        setGithubToken('');
        setMessage('GitHub rejected this token. Create a fresh token with Contents read/write permission, paste it here, and publish again.');
      } else if (err instanceof GitHubPublishError && err.status === 403) {
        setMessage('GitHub blocked this token. Check repo access, SSO authorization, and Contents read/write permission.');
      } else {
        setMessage(err instanceof Error ? err.message : 'Error publishing. Check console.');
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin · CineReview</title>
        <meta name="description" content="Manage movie reviews and site configuration" />
      </Head>

      <nav className="fixed top-0 left-0 right-0 z-40 bg-cinema-black/50 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-cinema-accent font-heading text-xl">CineReview</Link>
            <Link href="/" className="text-cinema-secondary hover:text-cinema-accent">Home</Link>
            <Link href="/about" className="text-cinema-secondary hover:text-cinema-accent">About</Link>
            <Link href="/admin" className="text-cinema-text font-semibold">Admin</Link>
          </div>
          <div className="flex items-center gap-4">
            <SearchBar onSearch={() => {}} movies={[]} />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="pt-28 min-h-screen bg-cinema-black text-cinema-text">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="font-heading text-5xl text-cinema-accent">Admin Dashboard</h1>
                <p className="text-cinema-secondary mt-2">Publish reviews, preview content, and manage site configuration.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/edit" className="glass-card px-5 py-3 hover:bg-cinema-accent/20 transition-colors">Edit Reviews</Link>
                <Link href="/admin/config" className="glass-card px-5 py-3 hover:bg-cinema-accent/20 transition-colors">Site Config</Link>
              </div>
            </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="font-heading text-3xl mb-6">GitHub Access</h2>
              <label className="block text-sm font-semibold mb-2">Personal Access Token</label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                autoComplete="off"
                required
              />
            </div>

            <div className="glass-card p-8">
              <h2 className="font-heading text-3xl mb-6">Movie Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Movie Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Poster URL</label>
                  <input
                    type="url"
                    value={formData.posterUrl || ''}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Backdrop URL</label>
                  <input
                    type="url"
                    value={formData.backdropUrl || ''}
                    onChange={(e) => setFormData({ ...formData, backdropUrl: e.target.value })}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Release Date</label>
                  <input
                    type="date"
                    value={formData.releaseDate || ''}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Director</label>
                  <input
                    type="text"
                    value={formData.director || ''}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Runtime (minutes)</label>
                  <input
                    type="number"
                    value={formData.runtime || ''}
                    onChange={(e) => setFormData({ ...formData, runtime: parseInt(e.target.value, 10) })}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Trailer URL</label>
                  <input
                    type="url"
                    value={formData.trailerUrl || ''}
                    onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Rating (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.rating || ''}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value, 10) })}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Genre (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.genre?.join(', ') || ''}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value.split(',').map((s) => s.trim()) })}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Cast (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.cast?.join(', ') || ''}
                    onChange={(e) => setFormData({ ...formData, cast: e.target.value.split(',').map((s) => s.trim()) })}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-8">
              <h2 className="font-heading text-3xl mb-6">Review Content</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Review Summary</label>
                  <textarea
                    value={formData.reviewSummary || ''}
                    onChange={(e) => setFormData({ ...formData, reviewSummary: e.target.value })}
                    rows={3}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">What I Loved (one per line)</label>
                  <textarea
                    value={formData.whatILoved?.join('\n') || ''}
                    onChange={(e) => setFormData({ ...formData, whatILoved: e.target.value.split('\n') })}
                    rows={5}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">What I Didn't Like (one per line)</label>
                  <textarea
                    value={formData.whatIDidntLike?.join('\n') || ''}
                    onChange={(e) => setFormData({ ...formData, whatIDidntLike: e.target.value.split('\n') })}
                    rows={5}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Full Review</label>
                  <textarea
                    value={formData.fullReview || ''}
                    onChange={(e) => setFormData({ ...formData, fullReview: e.target.value })}
                    rows={10}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Final Verdict</label>
                  <textarea
                    value={formData.finalVerdict || ''}
                    onChange={(e) => setFormData({ ...formData, finalVerdict: e.target.value })}
                    rows={3}
                    className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.isFeatured || false}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label htmlFor="featured" className="text-sm font-semibold">
                    Featured Movie
                  </label>
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-cinema-accent text-white py-4 rounded-lg font-heading text-2xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Review'}
            </motion.button>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 text-center"
              >
                <p className="text-lg">{message}</p>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </main>
  </>
  );
}
