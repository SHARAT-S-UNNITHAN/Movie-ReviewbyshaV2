import { Movie } from '@/types/movie';

const REPO_OWNER = 'SHARAT-S-UNNITHAN';
const REPO_NAME = 'Movie-ReviewbyshaV2';
const BRANCH = 'main';

interface GitHubContentResponse {
  content?: string;
  sha?: string;
  message?: string;
}

export class GitHubPublishError extends Error {
  status: number;

  constructor(action: string, status: number) {
    super(`GitHub ${action} failed: ${status}`);
    this.name = 'GitHubPublishError';
    this.status = status;
  }
}

function encodeBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

function decodeBase64(value: string) {
  return decodeURIComponent(escape(atob(value.replace(/\s/g, ''))));
}

export async function createMovieReview(movie: Movie, token: string) {
  if (!token.trim()) {
    throw new Error('GitHub token is required');
  }

  const path = 'public/data/movies.json';
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

  const existingResponse = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!existingResponse.ok) {
    throw new GitHubPublishError('read', existingResponse.status);
  }

  const existingFile = (await existingResponse.json()) as GitHubContentResponse;
  if (!existingFile.content || !existingFile.sha) {
    throw new Error('GitHub response did not include movies.json content');
  }

  const movies = JSON.parse(decodeBase64(existingFile.content)) as Movie[];
  const existingIndex = movies.findIndex((item) => item.slug === movie.slug);

  if (existingIndex >= 0) {
    movies[existingIndex] = movie;
  } else {
    movies.push(movie);
  }

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `${existingIndex >= 0 ? 'Update' : 'Add'} review: ${movie.title}`,
      content: encodeBase64(`${JSON.stringify(movies, null, 2)}\n`),
      branch: BRANCH,
      sha: existingFile.sha,
    }),
  });

  if (!response.ok) {
    throw new GitHubPublishError('publish', response.status);
  }

  return await response.json();
}
