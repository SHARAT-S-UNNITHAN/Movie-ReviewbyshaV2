export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  genre: string[];
  director: string;
  cast: string[];
  runtime: number;
  trailerUrl: string;
  rating: number;
  reviewSummary: string;
  whatILoved: string[];
  whatIDidntLike: string[];
  fullReview: string;
  finalVerdict: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  watchProviders?: string[];
  awards?: string[];
  boxOffice?: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface FilterState {
  search: string;
  genre: string;
  rating: string;
  year: string;
}

