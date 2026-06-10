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

async function fetchRepoFile(path: string, token: string) {
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new GitHubPublishError('read', response.status);
  }

  return (await response.json()) as GitHubContentResponse;
}

async function updateRepoFile(path: string, token: string, content: string, sha: string, message: string) {
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: encodeBase64(`${content}\n`),
      branch: BRANCH,
      sha,
    }),
  });

  if (!response.ok) {
    throw new GitHubPublishError('publish', response.status);
  }

  return await response.json();
}

export async function createMovieReview(movie: Movie, token: string) {
  if (!token.trim()) {
    throw new Error('GitHub token is required');
  }

  const path = 'public/data/movies.json';
  const existingFile = await fetchRepoFile(path, token);

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

  return updateRepoFile(
    path,
    token,
    JSON.stringify(movies, null, 2),
    existingFile.sha,
    `${existingIndex >= 0 ? 'Update' : 'Add'} review: ${movie.title}`
  );
}

export async function updateSiteConfig(config: object, token: string) {
  if (!token.trim()) {
    throw new Error('GitHub token is required');
  }

  const path = 'public/data/site-config.json';
  const existingFile = await fetchRepoFile(path, token);

  if (!existingFile.content || !existingFile.sha) {
    throw new Error('GitHub response did not include site-config.json content');
  }

  return updateRepoFile(
    path,
    token,
    JSON.stringify(config, null, 2),
    existingFile.sha,
    `Update site config`
  );
}

export async function deleteMovie(slug: string, token: string) {
  if (!token.trim()) {
    throw new Error('GitHub token is required');
  }

  const indexPath = 'public/data/movies.json';
  const existingFile = await fetchRepoFile(indexPath, token);

  if (!existingFile.content || !existingFile.sha) {
    throw new Error('GitHub response did not include movies.json content');
  }

  const movies = JSON.parse(decodeBase64(existingFile.content)) as Movie[];
  const nextMovies = movies.filter((item) => item.slug !== slug);

  await updateRepoFile(
    indexPath,
    token,
    JSON.stringify(nextMovies, null, 2),
    existingFile.sha,
    `Delete review: ${slug}`
  );

  const contentPath = `content/movies/${slug}.json`;
  try {
    const fileData = await fetchRepoFile(contentPath, token);
    if (fileData.sha) {
      const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${contentPath}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          message: `Delete review content: ${slug}`,
          sha: fileData.sha,
          branch: BRANCH,
        }),
      });

      if (!response.ok) {
        throw new GitHubPublishError('delete', response.status);
      }
    }
  } catch (err) {
    if (err instanceof GitHubPublishError && err.status === 404) {
      return;
    }
    throw err;
  }
}
