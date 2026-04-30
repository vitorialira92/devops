import { Search } from 'lucide-react';
import { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (url: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export default function SearchBar({ onSearch, placeholder = 'Enter a URL...', loading = false }: SearchBarProps) {
  const [url, setUrl] = useState('');

  const normalizeUrl = (input: string): string => {
     const trimmed = input.trim();
     if (/^https?:\/\//i.test(trimmed)) return trimmed;

     return `https://${trimmed}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(normalizeUrl(url));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          value={url}
          onChange={handleChange}
          placeholder={placeholder}
          className="search-input"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="search-button"
        disabled={loading || !url.trim()}
      >
        {loading ? (
          <span className="spinner"></span>
        ) : (
          'Check'
        )}
      </button>
    </form>
  );
}
