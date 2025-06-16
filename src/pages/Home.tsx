import React from 'react';
import PostInput from '../components/posts/PostInput';
import PostList from '../components/posts/PostList';
import { usePosts } from '../context/PostContext';

const Home: React.FC = () => {
  const { posts } = usePosts();

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Home</h1>
      <PostInput />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Echoes</h2>
      <PostList posts={posts} emptyMessage="Be the first to share your feelings!" />
    </div>
  );
};

export default Home;