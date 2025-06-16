import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/mockData';
import { AlertTriangle, Lock, MessageSquare, Users, HeartCrack, Sun, Compass, AlertCircle, Home, Trophy, MoreHorizontal } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'alert-triangle': <AlertTriangle className="w-5 h-5" />,
  'lock': <Lock className="w-5 h-5" />,
  'message-square': <MessageSquare className="w-5 h-5" />,
  'users': <Users className="w-5 h-5" />,
  'heart-crack': <HeartCrack className="w-5 h-5" />,
  'sun': <Sun className="w-5 h-5" />,
  'compass': <Compass className="w-5 h-5" />,
  'alert-circle': <AlertCircle className="w-5 h-5" />,
  'home': <Home className="w-5 h-5" />,
  'trophy': <Trophy className="w-5 h-5" />,
  'more-horizontal': <MoreHorizontal className="w-5 h-5" />,
};

const CategoryGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.id}`}
          className="flex flex-col items-center justify-center p-4 bg-white dark:bg-dark-100 rounded-lg shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400 mb-2">
            {iconMap[category.icon]}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {category.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
            {category.description}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;