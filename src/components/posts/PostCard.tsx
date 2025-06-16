import React, { useState, useRef, useEffect } from 'react';
import { Heart, Flame, Frown, MessageCircle } from 'lucide-react';
import { Post } from '../../types';
import { usePosts } from '../../context/PostContext';
import { motion, AnimatePresence } from 'framer-motion';

interface PostCardProps {
  post: Post;
}

const EMOJI_OPTIONS = [
  { key: 'cry', emoji: '😢' },
  { key: 'smile', emoji: '🙂' },
  { key: 'laugh', emoji: '😂' },
  { key: 'neutral', emoji: '😐' },
];

const REACTION_ICONS = {
  hearts: <Heart className="w-5 h-5" />,
  flames: <Flame className="w-5 h-5" />,
  cry: '😢',
  smile: '🙂',
  laugh: '😂',
  neutral: '😐',
};
const EMOJI_KEYS = ['cry', 'smile', 'laugh', 'neutral'];

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { addReaction, addReply } = usePosts();
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleReply = async () => {
    if (replyContent.trim()) {
      await addReply(post.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const userId = localStorage.getItem('userId');
  const userReaction = userId ? post.userReactions?.[userId] : null;

  // Count reactions for each emoji
  const emojiCounts: { [key: string]: number } = {};
  Object.values(post.userReactions || {}).forEach((reaction) => {
    emojiCounts[reaction] = (emojiCounts[reaction] || 0) + 1;
  });

  // Handle click outside picker to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-dark-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 mb-4"
    >
      <div className="mb-3">
        <p className="text-gray-900 dark:text-gray-100 text-lg font-medium leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
        {post.category && (
          <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300">
            {post.category}
          </span>
        )}
        <span className="block mt-2 text-xs text-gray-500 dark:text-gray-400">
          {formatTime(post.timestamp)}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-dark-200">
        {/* Left: reactions */}
        <div className="flex flex-row flex-wrap items-center gap-1.5">
          {/* Heart reaction */}
          <ReactionButton 
            count={post.reactions.hearts || 0}
            reactionType='hearts'
            isActive={userReaction === 'hearts'}
            onClick={() => addReaction(post.id, 'hearts')}
            size="small"
          />
          {/* Fire reaction */}
          <ReactionButton 
            count={post.reactions.flames || 0}
            reactionType='flames'
            isActive={userReaction === 'flames'}
            onClick={() => addReaction(post.id, 'flames')}
            size="small"
          />
          {/* Emoji reactions in fixed order, only if count > 0 */}
          {EMOJI_KEYS.map(key => (
            (post.reactions[key] || 0) > 0 && (
              <button
                key={key}
                onClick={() => addReaction(post.id, key)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-colors text-base ${userReaction === key ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-gray-100 dark:hover:bg-dark-200'}`}
                style={{ minWidth: 32 }}
              >
                <span className="w-4 h-4 flex items-center justify-center text-base">
                  {REACTION_ICONS[key]}
                </span>
                <span className="text-xs font-medium">{post.reactions[key] || 0}</span>
              </button>
            )
          ))}
          {/* Emoji Picker Button (shows only remaining options) */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              style={{ minWidth: 32 }}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                <Frown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </span>
            </motion.button>
            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className="absolute z-10 left-1/2 -translate-x-1/2 mt-3 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-100 rounded-xl shadow-xl p-2 flex gap-2">
                {(userReaction && EMOJI_KEYS.includes(userReaction)
                  ? EMOJI_OPTIONS.filter(option => option.key !== userReaction)
                  : EMOJI_OPTIONS
                ).map(option => (
                  <button
                    key={option.key}
                    className="text-xl hover:scale-125 transition-transform focus:outline-none"
                    onClick={() => {
                      addReaction(post.id, option.key);
                      setShowEmojiPicker(false);
                    }}
                    style={{ minWidth: 32 }}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* End Emoji Picker Button */}
        </div>
        {/* Right: reply icon */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1 text-gray-500 group px-1.5 py-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-200"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{post.replies?.length || 0}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-3"
          >
            {post.replies?.map(reply => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-50 dark:bg-dark-200 rounded-lg p-3"
              >
                <p className="text-sm text-gray-800 dark:text-gray-200">{reply.content}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                  {formatTime(reply.timestamp)}
                </span>
              </motion.div>
            ))}
            
            {!isReplying ? (
              <button
                onClick={() => setIsReplying(true)}
                className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:dark:hover:text-primary-300"
              >
                Add a reply...
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full p-2 text-sm bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-700 focus:border-transparent resize-none"
                  rows={2}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsReplying(false)}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                    className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface ReactionButtonProps {
  count: number;
  reactionType: 'hearts' | 'flames' | 'frowns';
  isActive: boolean;
  onClick: () => void;
  size: 'small' | 'large';
}

const ReactionButton: React.FC<ReactionButtonProps> = ({ count, reactionType, isActive, onClick, size }) => {
  const colors = {
    hearts: { active: '#EF4444', inactive: '#6B7280' }, // red-500 and gray-500
    flames: { active: '#F97316', inactive: '#6B7280' }, // orange-500 and gray-500
    frowns: { active: '#3B82F6', inactive: '#6B7280' }, // A shade of blue when active, gray when inactive
  };

  const iconColor = isActive ? colors[reactionType].active : colors[reactionType].inactive;
  const iconFill = isActive && reactionType !== 'frowns' ? colors[reactionType].active : 'none';

  const IconComponent = reactionType === 'hearts' ? Heart : reactionType === 'flames' ? Flame : Frown;

  return (
    <motion.button 
      whileTap={{ scale: 0.95 }} 
      className={`flex items-center space-x-1 group ${isActive ? '' : 'opacity-70 hover:opacity-100'}`}
      onClick={onClick}
    >
      <AnimatePresence mode="wait">
        <motion.span 
          key={reactionType + (isActive ? '-active' : '-inactive')}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: isActive ? 1.2 : 1, opacity: 1 }}
          exit={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {isActive ? (
            <span className="w-5 h-5 flex items-center justify-center">
              {reactionType === 'hearts' && '❤️'}
              {reactionType === 'flames' && '🔥'}
              {reactionType === 'frowns' && '😟'}
            </span>
          ) : (
            <IconComponent 
              className="w-5 h-5"
              color={iconColor}
              fill={iconFill}
            />
          )}
        </motion.span>
      </AnimatePresence>
      <motion.span className="text-gray-600 dark:text-gray-400 text-sm">{count}</motion.span>
    </motion.button>
  );
};

export default PostCard;