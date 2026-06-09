import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Link from 'next/link';
import { PlayIcon } from '@heroicons/react/24/solid';
import ReadingProgress from '@/components/ReadingProgress';
import { Movie } from '@/types/movie';

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/Movie-ReviewbyshaV2' : '';

interface MovieDetailPageProps {
  movie: Movie;
}

export default function MovieDetailPage({ movie }: MovieDetailPageProps) {
  if (!movie) {
    return (
      <div className="min-h-screen bg-cinema-black text-cinema-text flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-2xl font-semibold mb-4">Review not found</p>
          <Link href={`${BASE_PATH}/`} className="glass-card px-6 py-3 text-cinema-text hover:bg-cinema-accent/20">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{movie.title} · CineReview</title>
        <meta name="description" content={movie.reviewSummary} />
      </Head>

      <ReadingProgress />

      <main className="min-h-screen bg-cinema-black text-cinema-text">
        <section 
          className="relative pb-24"
          style={{ backgroundImage: `url(${movie.backdropUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 hero-gradient" />
          <div className="relative container mx-auto px-6 pt-24 pb-20">
            <Link href={`${BASE_PATH}/`} className="inline-flex items-center gap-2 text-cinema-secondary mb-8">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true">←</span>
              </span>
              Back to cinema
            </Link>

            <div className="glass-card p-10 max-w-5xl mx-auto">
              <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] items-start">
                <div>
                  <p className="text-cinema-accent uppercase tracking-[0.3em] text-sm mb-4">Featured Review</p>
                  <h1 className="font-heading text-5xl mb-6">{movie.title}</h1>
                  <p className="text-cinema-secondary text-lg mb-6">{movie.reviewSummary}</p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {movie.genre.map((genre) => (
                      <span key={genre} className="px-4 py-2 bg-cinema-dark rounded-full text-sm text-cinema-secondary">
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-cinema-secondary">
                    <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
                    <span>{movie.runtime} min</span>
                    <span>Directed by {movie.director}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-cinema-dark rounded-3xl p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-cinema-accent mb-4">Rating</p>
                    <div className="flex items-center gap-4">
                      <div className="rating-circle relative">
                        <svg viewBox="0 0 36 36" className="w-24 h-24">
                          <circle className="bg-circle" cx="18" cy="18" r="16" />
                          <circle
                            className="progress-circle"
                            cx="18"
                            cy="18"
                            r="16"
                            strokeDasharray={`${(movie.rating / 10) * 100} 100`}
                          />
                        </svg>
                        <span className="absolute inset-0 grid place-items-center text-lg font-bold text-cinema-gold">{movie.rating}</span>
                      </div>
                      <div>
                        <p className="text-xl font-semibold">{movie.rating}/10</p>
                        <p className="text-cinema-secondary">Critic score</p>
                      </div>
                    </div>
                  </div>

                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-card inline-flex items-center gap-3 px-6 py-4 font-semibold hover:bg-cinema-accent/20"
                  >
                    <PlayIcon className="w-5 h-5" /> Watch trailer
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 pb-20">
          <div className="grid gap-10 lg:grid-cols-3">
            <article className="glass-card p-10 lg:col-span-2">
              <h2 className="font-heading text-3xl mb-6">Full Review</h2>
              <p className="text-cinema-secondary leading-8 whitespace-pre-line">{movie.fullReview}</p>

              <div className="mt-12 grid gap-8 md:grid-cols-2">
                <div className="bg-cinema-dark rounded-3xl p-6">
                  <h3 className="text-xl font-semibold mb-4">What I loved</h3>
                  <ul className="list-disc list-inside space-y-3 text-cinema-secondary">
                    {movie.whatILoved.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-cinema-dark rounded-3xl p-6">
                  <h3 className="text-xl font-semibold mb-4">What I didn&apos;t like</h3>
                  <ul className="list-disc list-inside space-y-3 text-cinema-secondary">
                    {movie.whatIDidntLike.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <aside className="space-y-8">
              <div className="glass-card p-8">
                <h3 className="text-2xl font-semibold mb-4">Final Verdict</h3>
                <p className="text-cinema-secondary">{movie.finalVerdict}</p>
              </div>
              <div className="glass-card p-8">
                <h3 className="text-2xl font-semibold mb-4">Cast</h3>
                <div className="flex flex-wrap gap-3">
                  {movie.cast.map((castMember) => (
                    <span key={castMember} className="px-4 py-2 bg-cinema-dark rounded-full text-sm text-cinema-secondary">
                      {castMember}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  const moviesFile = path.join(process.cwd(), 'public', 'data', 'movies.json');
  const raw = fs.readFileSync(moviesFile, 'utf8');
  const movies: Movie[] = JSON.parse(raw);

  const paths = movies.map((movie) => ({
    params: { slug: movie.slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const moviesFile = path.join(process.cwd(), 'public', 'data', 'movies.json');
  const raw = fs.readFileSync(moviesFile, 'utf8');
  const movies: Movie[] = JSON.parse(raw);
  const movie = movies.find((item) => item.slug === params.slug);

  if (!movie) {
    return { notFound: true };
  }

  return {
    props: {
      movie,
    },
  };
}
