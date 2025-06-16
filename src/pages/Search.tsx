import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import CategoryGrid from '../components/common/CategoryGrid';
import PostList from '../components/posts/PostList';
import { usePosts } from '../context/PostContext';
import { Post } from '../types';

const Search: React.FC = () => {
  const { posts } = usePosts();
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    const results = posts.filter(post => 
      post.content.toLowerCase().includes(query.toLowerCase()) || 
      post.category?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleOtherClick = () => {
    const customCategory = window.prompt('Enter your custom category name:');
    if (customCategory && customCategory.trim()) {
      navigate(`/category/${encodeURIComponent(customCategory.trim())}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Discover</h1>
      <SearchBar onSearch={handleSearch} />
      
      {hasSearched ? (
        <>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Search Results
          </h2>
          <PostList 
            posts={searchResults} 
            emptyMessage="No posts found matching your search criteria." 
          />
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Browse by Category
          </h2>
          <CategoryGrid />
          <div>
            <button
              onClick={handleOtherClick}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-dark-100 transition-colors"
              style={{ background: 'none', border: 'none' }}
            >
              <span className="mr-3">➕</span>
              Other (Add your own)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Search;