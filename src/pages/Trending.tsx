import React from 'react';
import PostList from '../components/posts/PostList';
import { usePosts } from '../context/PostContext';
import { Flame } from 'lucide-react';

const Trending: React.FC = () => {
  const { trendingPosts } = usePosts();

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex items-center mb-6">
        <Flame className="w-6 h-6 text-orange-500 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trending</h1>
      </div>
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          The most resonating feelings being shared right now.
        </p>
      </div>
      <PostList 
        posts={trendingPosts} 
        emptyMessage="No trending posts yet. Check back soon!" 
      />
    </div>
  );
};

export default Trending;