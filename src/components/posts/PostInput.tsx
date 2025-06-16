import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { usePosts } from '../../context/PostContext';
import { Category } from '../../types';
import { categories } from '../../data/mockData';

interface PostInputProps {
  initialCategory?: Category;
}

const PostInput: React.FC<PostInputProps> = ({ initialCategory }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category | undefined>(initialCategory);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addPost } = usePosts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      addPost(content, category);
      setContent('');
      setIsExpanded(false);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl shadow-md p-4 mb-6 transition-all">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            placeholder="Share your feelings anonymously..."
            className="w-full p-3 bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-700 focus:border-transparent resize-none transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-200"
            rows={isExpanded ? 5 : 3}
          />
          
          {isExpanded && (
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id === category ? undefined : cat.id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    category === cat.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
          
          <div className={`flex justify-end mt-3 ${isExpanded ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">Echo</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostInput;