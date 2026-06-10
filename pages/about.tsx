import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import ReadingProgress from '@/components/ReadingProgress';

export default function About() {
  return (
    <>
      <Head>
        <title>About · CineReview</title>
        <meta name="description" content="About the reviewer behind CineReview" />
      </Head>

      <ReadingProgress />

      <main className="min-h-screen bg-cinema-black text-cinema-text pt-24">
        <div className="container mx-auto px-6 py-20 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/" className="text-cinema-secondary hover:text-cinema-accent mb-8 inline-block">← Back to cinema</Link>
            
            <div className="glass-card p-10 mb-12">
              <div className="flex items-center gap-8 mb-8">
                <div className="w-32 h-32 rounded-full bg-cinema-accent/20 flex items-center justify-center text-5xl">
                  🎬
                </div>
                <div>
                  <h1 className="font-heading text-5xl mb-2">About the Reviewer</h1>
                  <p className="text-cinema-secondary text-lg">Honest reviews from a passionate cinephile</p>
                </div>
              </div>

              <div className="space-y-6 text-cinema-secondary leading-relaxed">
                <p>Welcome to CineReview — my personal corner of the internet where I share in-depth, honest reviews of the films that move me. From Bollywood blockbusters to indie Malayalam gems, I believe every movie deserves a thoughtful analysis.</p>
                
                <h2 className="font-heading text-2xl text-cinema-text mt-8">🎯 My Reviewing Philosophy</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Every film is judged on its own merits</li>
                  <li>Technical excellence and emotional impact carry equal weight</li>
                  <li>Spoiler-free summaries with detailed analysis for those who've watched</li>
                  <li>Both mainstream and independent cinema deserve attention</li>
                </ul>

                <h2 className="font-heading text-2xl text-cinema-text mt-8">❤️ Favorite Films</h2>
                <div className="flex flex-wrap gap-3">
                  {['Uri: The Surgical Strike', 'Dune: Part Two', 'RRR', 'Kumbalangi Nights', 'Interstellar'].map(film => (
                    <span key={film} className="px-4 py-2 bg-cinema-dark rounded-full text-sm">{film}</span>
                  ))}
                </div>

                <h2 className="font-heading text-2xl text-cinema-text mt-8">📬 Contact</h2>
                <div className="flex gap-4">
                  <a href="https://github.com/SHARAT-S-UNNITHAN" target="_blank" className="glass-card px-6 py-3 hover:bg-cinema-accent/20 transition-colors">GitHub</a>
                  <a href="mailto:your@email.com" className="glass-card px-6 py-3 hover:bg-cinema-accent/20 transition-colors">Email</a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}