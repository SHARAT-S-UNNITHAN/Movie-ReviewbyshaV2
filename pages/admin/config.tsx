import { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import ThemeToggle from '@/components/ThemeToggle';
import { updateSiteConfig } from '@/utils/github';

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

const PUBLIC_DATA_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function AdminConfigPage() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultConfig);
  const [githubToken, setGithubToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setGithubToken(localStorage.getItem('adminGithubToken') || '');
  }, []);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch(`${PUBLIC_DATA_BASE}/data/site-config.json`);
        if (!response.ok) return;
        const data = (await response.json()) as Partial<SiteConfig>;
        setSiteConfig({ ...defaultConfig, ...data });
      } catch (err) {
        console.error('Failed to load site config:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    const token = githubToken.trim();
    if (!token) {
      setMessage('Please enter a GitHub token to update site config.');
      setSubmitting(false);
      return;
    }

    localStorage.setItem('adminGithubToken', token);

    try {
      await updateSiteConfig(siteConfig, token);
      setMessage('Site configuration updated successfully.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update configuration.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Site Config · CineReview</title>
        <meta name="description" content="Manage CineReview homepage settings" />
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
        <div className="container mx-auto px-6 py-12 max-w-4xl space-y-8">
          <div className="glass-card p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="font-heading text-5xl text-cinema-accent">Site Configuration</h1>
                <p className="text-cinema-secondary mt-2">Control homepage visibility, section counts, and brand copy.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin" className="glass-card px-5 py-3 hover:bg-cinema-accent/20 transition-colors">Dashboard</Link>
                <Link href="/admin/edit" className="glass-card px-5 py-3 hover:bg-cinema-accent/20 transition-colors">Edit Reviews</Link>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-2">Homepage Title</label>
                <input
                  value={siteConfig.homepageTitle}
                  onChange={(e) => setSiteConfig({ ...siteConfig, homepageTitle: e.target.value })}
                  className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Homepage Subtitle</label>
                <input
                  value={siteConfig.homepageSubtitle}
                  onChange={(e) => setSiteConfig({ ...siteConfig, homepageSubtitle: e.target.value })}
                  className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="inline-flex items-center gap-3 glass-card p-4 rounded-3xl">
                <input
                  type="checkbox"
                  checked={siteConfig.showTrending}
                  onChange={(e) => setSiteConfig({ ...siteConfig, showTrending: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-cinema-secondary">Show Trending Section</span>
              </label>
              <label className="inline-flex items-center gap-3 glass-card p-4 rounded-3xl">
                <input
                  type="checkbox"
                  checked={siteConfig.showTopRated}
                  onChange={(e) => setSiteConfig({ ...siteConfig, showTopRated: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-cinema-secondary">Show Top Rated Section</span>
              </label>
              <label className="inline-flex items-center gap-3 glass-card p-4 rounded-3xl">
                <input
                  type="checkbox"
                  checked={siteConfig.showRatingDistribution}
                  onChange={(e) => setSiteConfig({ ...siteConfig, showRatingDistribution: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-cinema-secondary">Show Rating Distribution</span>
              </label>
              <label className="inline-flex items-center gap-3 glass-card p-4 rounded-3xl">
                <input
                  type="checkbox"
                  checked={siteConfig.showStatsBar}
                  onChange={(e) => setSiteConfig({ ...siteConfig, showStatsBar: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-cinema-secondary">Show Stats Bar</span>
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-2">Trending Item Count</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={siteConfig.trendingCount}
                  onChange={(e) => setSiteConfig({ ...siteConfig, trendingCount: parseInt(e.target.value, 10) || 1 })}
                  className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Top Rated Item Count</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={siteConfig.topRatedCount}
                  onChange={(e) => setSiteConfig({ ...siteConfig, topRatedCount: parseInt(e.target.value, 10) || 1 })}
                  className="w-full bg-cinema-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cinema-accent"
                />
              </div>
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
              <p className="text-xs text-cinema-secondary mt-2">Token is saved locally in your browser for admin use only.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-cinema-accent text-white py-4 rounded-lg font-heading text-2xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Configuration'}
            </button>

            {message && (
              <div className="glass-card p-6 text-center">
                <p className="text-lg">{message}</p>
              </div>
            )}
          </form>

          {loading && (
            <div className="glass-card p-8 text-center text-cinema-secondary">Loading current site config…</div>
          )}
        </div>
      </main>
    </>
  );
}
