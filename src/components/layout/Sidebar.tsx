import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleOtherClick = () => {
    // Go to the dedicated Other page
    navigate('/category/other');
  };

  return (
    <aside className="hidden lg:block sticky top-20 w-60 h-[calc(100vh-5rem)] overflow-y-auto pt-6 pb-12 pl-4">
      <div className="pr-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 px-3">Categories</h2>
        <nav className="space-y-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-dark-100 transition-colors"
            >
              <span className="mr-3 text-primary-500 dark:text-primary-400 flex items-center justify-center">
                {iconMap[category.icon] || <MoreHorizontal className="w-5 h-5" />}
              </span>
              {category.name}
            </Link>
          ))}
          <button
            onClick={handleOtherClick}
            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 dark:text-white transition-colors shadow"
            style={{ border: 'none' }}
          >
            <span className="mr-3 text-white flex items-center justify-center">
              {iconMap['more-horizontal']}
            </span>
            Other
          </button>
        </nav>

        <div className="mt-8 px-3">
          <div className="bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 p-4 rounded-lg">
            <h3 className="font-medium text-primary-800 dark:text-primary-300 mb-2">Welcome to Echo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A safe space to share your feelings anonymously. Be kind and supportive to others.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;