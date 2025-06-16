import React, { useState, useEffect } from 'react';
import PostInput from '../components/posts/PostInput';
import PostList from '../components/posts/PostList';
import { usePosts } from '../context/PostContext';
import { Post } from '../types';
import { Radio } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';

const Live: React.FC = () => {
  const { posts, addPost } = usePosts();
  const [livePosts, setLivePosts] = useState<Post[]>([]);
  
  useEffect(() => {
    // Query the last 20 posts ordered by timestamp
    const livePostsRef = query(
      ref(database, 'posts'),
      orderByChild('timestamp'),
      limitToLast(20)
    );

    const unsubscribe = onValue(livePostsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsList = Object.entries(data).map(([id, post]: [string, any]) => ({
          id,
          ...post
        }));
        // Sort by timestamp in descending order (newest first)
        setLivePosts(postsList.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setLivePosts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex items-center mb-6">
        <Radio className="w-6 h-6 text-green-500 mr-2 animate-pulse" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Echoes</h1>
      </div>
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          See feelings as they're being shared in real-time. Add your voice to the conversation.
        </p>
      </div>
      <PostInput />
      <div className="mt-6">
        <PostList posts={livePosts} emptyMessage="No live posts yet. Be the first to share!" />
      </div>
    </div>
  );
};

export default Live;