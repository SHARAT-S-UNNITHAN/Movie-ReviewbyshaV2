import { Movie } from '@/types/movie';

const GITHUB_TOKEN = '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';
const REPO_OWNER = 'SHARAT-S-UNNITHAN';
const REPO_NAME = 'Movie-ReviewbyshaV2';
const BRANCH = 'main';

export async function createMovieReview(movie: Movie) {
  const path = `content/movies/${movie.slug}.json`;
  const content = JSON.stringify(movie, null, 2);
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  
  try {
    const existingFile = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
    }).then(res => res.json());

    const body = {
      message: `Add review: ${movie.title}`,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: BRANCH,
      ...(existingFile.sha && { sha: existingFile.sha }),
    };

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error('Failed to create review');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}