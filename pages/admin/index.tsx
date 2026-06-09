import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Movie } from '@/types/movie';
import { createMovieReview } from '@/utils/github';

export default function AdminDashboard() {
  const [formData, setFormData] = useState<Partial<Movie>>({
    genre: [],
    cast: [],
    whatILoved: [],
    whatIDidntLike: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [githubToken, setGithubToken] = useState('');

  useEffect(() => {
    setGithubToken(localStorage.getItem('adminGithubToken') || '');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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

    const slug = (formData.title || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const movie: Movie = {
      ...formData as Movie,
      id: Date.now().toString(),
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await createMovieReview(movie, token);
      setMessage('Review published. Site will rebuild automatically.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error publishing. Check console.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cinema-black text-cinema-text">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-heading text-5xl text-cinema-accent mb-8">
            Admin Dashboard
          </h1>

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
    </div>
  );
}
