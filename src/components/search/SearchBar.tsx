import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search feelings, topics, or categories..."
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-dark-100 rounded-lg bg-gray-50 dark:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-700 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-200"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            type="submit"
            className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 focus:outline-none"
          >
            <span className="sr-only">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;