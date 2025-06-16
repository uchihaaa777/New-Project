import React from 'react';
import PostCard from './PostCard';
import { Post } from '../../types';

interface PostListProps {
  posts: Post[];
  emptyMessage?: string;
}

const PostList: React.FC<PostListProps> = ({ posts, emptyMessage = "No posts yet" }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;