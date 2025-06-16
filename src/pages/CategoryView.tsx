import React from 'react';
import { useParams } from 'react-router-dom';
import PostInput from '../components/posts/PostInput';
import PostList from '../components/posts/PostList';
import { usePosts } from '../context/PostContext';
import { Category } from '../types';
import { categories } from '../data/mockData';

const CategoryView: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { getPostsByCategory } = usePosts();
  
  const category = categories.find(c => c.id === categoryId);
  const isCustomCategory = !category && categoryId && categoryId !== 'other';
  const categoryName = category
    ? category.name
    : isCustomCategory
      ? decodeURIComponent(categoryId!)
      : 'Other';

  const categoryPosts = getPostsByCategory(categoryId as Category);

  if (!category && !isCustomCategory && categoryId !== 'other') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Category Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The category you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {categoryName}
      </h1>
      <PostInput initialCategory={categoryId as Category} />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {categoryName} Echoes
      </h2>
      <PostList 
        posts={categoryPosts} 
        emptyMessage={`No posts in ${categoryName} yet. Be the first to share!`} 
      />
    </div>
  );
};

export default CategoryView;