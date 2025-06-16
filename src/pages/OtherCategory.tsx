import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../context/PostContext';

const OtherCategory: React.FC = () => {
  const [customCategory, setCustomCategory] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addPost } = usePosts();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCategory.trim() || !content.trim()) return;
    setSubmitting(true);
    await addPost(content, customCategory.trim());
    setSubmitting(false);
    navigate(`/category/${encodeURIComponent(customCategory.trim())}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Share Your Feelings (Other)
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Custom Category Name
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={e => setCustomCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-md dark:bg-dark-100 dark:border-dark-100"
            placeholder="Enter your category"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Your Feelings (unlimited words)
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-4 py-2 border rounded-md dark:bg-dark-100 dark:border-dark-100"
            rows={8}
            placeholder="Share your feelings anonymously..."
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !customCategory.trim() || !content.trim()}
          className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Anonymously'}
        </button>
      </form>
    </div>
  );
};

export default OtherCategory;
