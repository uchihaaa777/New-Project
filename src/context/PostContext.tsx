import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, Category, Reply } from '../types';
import { database } from '../config/firebase';
import { ref, onValue, push, set, update, get } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

interface PostContextType {
  posts: Post[];
  trendingPosts: Post[];
  addPost: (content: string, category?: Category) => void;
  addReaction: (postId: string, reactionType: string) => void;
  getPostsByCategory: (category: Category) => Post[];
  addReply: (postId: string, content: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const postsRef = ref(database, 'posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray = Object.entries(data).map(([id, post]: [string, any]) => ({
          id,
          ...post,
        }));
        setPosts(postsArray.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const trendingPosts = [...posts]
    .sort((a, b) => {
      const totalA = a.reactions.hearts + a.reactions.flames;
      const totalB = b.reactions.hearts + b.reactions.flames;
      return totalB - totalA;
    })
    .slice(0, 10);

  const addPost = async (content: string, category?: Category | string) => {
    const userId = localStorage.getItem('userId') || uuidv4();
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }

    // Create post data without undefined values
    const postData: any = {
      id: uuidv4(),
      content,
      timestamp: Date.now(),
      reactions: {
        hearts: 0,
        flames: 0,
        frowns: 0,
      },
      userReactions: {},
      replies: [],
    };

    // Only add category if it exists
    if (category) {
      postData.category = category;
    }
    
    const postRef = ref(database, `posts/${postData.id}`);
    await set(postRef, postData);
  };

  const addReaction = async (postId: string, reactionType: string) => {
    const userId = localStorage.getItem('userId') || uuidv4();
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }

    const postRef = ref(database, `posts/${postId}`);
    const snapshot = await get(postRef);
    const post = snapshot.val();

    if (post) {
      const userReactions = post.userReactions || {};
      const currentReaction = userReactions[userId];
      const reactions = { ...post.reactions };
      const updates: any = {};

      // If user clicks the same reaction, remove it (toggle off)
      if (currentReaction === reactionType) {
        reactions[reactionType] = Math.max(0, (reactions[reactionType] || 1) - 1);
        userReactions[userId] = null;
        updates.reactions = reactions;
        updates.userReactions = userReactions;
        await update(postRef, updates);
        return;
      }

      // Remove previous reaction if exists
      if (currentReaction) {
        if (reactions[currentReaction] !== undefined) {
          reactions[currentReaction] = Math.max(0, reactions[currentReaction] - 1);
        }
      }

      // Add new reaction
      reactions[reactionType] = (reactions[reactionType] || 0) + 1;
      userReactions[userId] = reactionType;
      updates.reactions = reactions;
      updates.userReactions = userReactions;
      await update(postRef, updates);
    }
  };

  const addReply = async (postId: string, content: string) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const postRef = ref(database, `posts/${postId}`);
    const snapshot = await get(postRef);
    const post = snapshot.val();
    
    if (post) {
      const newReply: Reply = {
        id: uuidv4(),
        content,
        timestamp: Date.now(),
        userId
      };
      
      const replies = post.replies || [];
      const updates = {
        replies: [...replies, newReply]
      };
      await update(postRef, updates);
    }
  };

  const getPostsByCategory = (category: Category | string) => {
    return posts.filter(post => post.category === category);
  };

  return (
    <PostContext.Provider value={{ 
      posts, 
      trendingPosts, 
      addPost, 
      addReaction, 
      getPostsByCategory,
      addReply
    }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = (): PostContextType => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};