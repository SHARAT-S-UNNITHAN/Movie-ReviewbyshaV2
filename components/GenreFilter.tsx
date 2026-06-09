interface GenreFilterProps {
  selected: string;
  onSelect: (genre: string) => void;
}

const genres = [
  'All',
  'Action',
  'Drama',
  'Sci-Fi',
  'Thriller',
  'Fantasy',
  'Adventure',
  'Mystery',
  'Romance',
];

export default function GenreFilter({ selected, onSelect }: GenreFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-wrap gap-3">
        {genres.map((genre) => (
          <button
            key={genre}
            type="button"
            onClick={() => onSelect(genre === 'All' ? '' : genre)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              selected === genre || (genre === 'All' && !selected)
                ? 'bg-cinema-accent text-white'
                : 'bg-cinema-dark text-cinema-secondary hover:bg-cinema-accent/20'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
      <p className="text-cinema-secondary text-sm">
        Filter by genre to find your next favorite review.
      </p>
    </div>
  );
}
