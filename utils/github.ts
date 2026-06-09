import { Movie } from '@/types/movie';

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const REPO_OWNER = process.env.NEXT_PUBLIC_REPO_OWNER;
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME;
const BRANCH = 'main';

export async function createMovieReview(movie: Movie) {
  const path = `content/movies/${movie.slug}.json`;
  const content = JSON.stringify(movie, null, 2);
  
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  
  try {
    // Check if file exists
    const existingFile = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    }).then(res => res.json());

    const encodedContent = typeof window === 'undefined'
      ? Buffer.from(content).toString('base64')
      : btoa(unescape(encodeURIComponent(content)));

    const body = {
      message: `Add review: ${movie.title}`,
      content: encodedContent,
      branch: BRANCH,
      ...(existingFile.sha && { sha: existingFile.sha }),
    };

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to create review');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating movie review:', error);
    throw error;
  }
}

export async function triggerDeployment() {
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_type: 'deploy-site',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to trigger deployment');
  }
}

