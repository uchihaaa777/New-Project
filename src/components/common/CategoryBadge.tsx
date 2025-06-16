import React from 'react';
import { Category } from '../../types';
import { categories } from '../../data/mockData';

interface CategoryBadgeProps {
  categoryId: Category;
  size?: 'sm' | 'md';
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ categoryId, size = 'md' }) => {
  const category = categories.find(c => c.id === categoryId);
  
  if (!category) return null;
  
  return (
    <span 
      className={`
        inline-flex items-center rounded-full bg-primary-100 dark:bg-primary-900/30 
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-sm'}
        font-medium text-primary-800 dark:text-primary-300
      `}
    >
      {category.name}
    </span>
  );
};

export default CategoryBadge;