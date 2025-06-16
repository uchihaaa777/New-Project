import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../config/firebase';
import { ref, push, onValue, update, remove } from 'firebase/database';
import { Send, ArrowLeft, Reply, X, Smile, Trash2 } from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const EMOJI_OPTIONS = [
  { key: 'like', emoji: '👍' },
  { key: 'heart', emoji: '❤️' },
  { key: 'laugh', emoji: '😂' },
  { key: 'wow', emoji: '😮' },
  { key: 'sad', emoji: '😢' },
];

// Only allow emoji avatars from the provided list
const PROFILE_EMOJIS = [
  "🧑‍💻", "👩‍🎤", "👨‍🚀", "👩‍🔬",
  "👨‍🎨", "👩‍🏫", "👨‍⚕️", "👩‍🍳",
  "😎", "🤓", "🥸", "😇",
  "😜", "🥳", "😍", "🤖",
  "👽", "🐼", "🐱", "🐶",
  "🐸", "🦊", "🐯", "🐵"
];

interface Message {
  id: string;
  text: string;
  sender: string; // sessionId
  timestamp: number;
  replyTo?: {
    id: string;
    text: string;
    sender: string;
  };
  reactions?: {
    [key: string]: {
      [userId: string]: boolean;
    };
  };
  voiceNoteUrl?: string;
  profileEmoji?: string;
}

const GroupChat: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const groupName = location.state?.groupName || 'Group Chat';
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const [profileEmoji, setProfileEmoji] = useState<string>(() => {
    return localStorage.getItem("profileEmoji") || PROFILE_EMOJIS[0];
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  useEffect(() => {
    if (!groupId) return;
    const messagesRef = ref(database, `groups/${groupId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.entries(data).map(([id, message]: [string, any]) => ({
          id,
          ...message
        }));
        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));
      }
    });
    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("profileEmoji", profileEmoji);
  }, [profileEmoji]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;
    const now = Date.now();
    const messagesRef = ref(database, `groups/${groupId}/messages`);
    const newMessageRef = push(messagesRef);
    const updates: { [key: string]: any } = {};
    updates[`groups/${groupId}/lastMessageTime`] = now;
    updates[`groups/${groupId}/messages/${newMessageRef.key}`] = {
      text: newMessage,
      sender: sessionId,
      timestamp: now,
      reactions: {},
      profileEmoji,
      ...(replyingTo && {
        replyTo: {
          id: replyingTo.id,
          text: replyingTo.text,
          sender: replyingTo.sender
        }
      })
    };
    await update(ref(database), updates);
    setNewMessage('');
    setReplyingTo(null);
  };

  const handleReply = (message: Message) => setReplyingTo(message);
  const cancelReply = () => setReplyingTo(null);

  const handleReaction = async (messageId: string, reactionKey: string) => {
    if (!groupId) return;
    const messageRef = ref(database, `groups/${groupId}/messages/${messageId}`);
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    const currentReactions = message.reactions || {};
    const reactionUsers = currentReactions[reactionKey] || {};
    const hasReacted = reactionUsers[sessionId];
    const updates: { [key: string]: any } = {};
    if (hasReacted) {
      updates[`reactions/${reactionKey}/${sessionId}`] = null;
    } else {
      updates[`reactions/${reactionKey}/${sessionId}`] = true;
    }
    await update(messageRef, updates);
    setShowEmojiPicker(null);
  };

  const getReactionCount = (message: Message, reactionKey: string) => {
    return Object.keys(message.reactions?.[reactionKey] || {}).length;
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!groupId) return;
    const messageRef = ref(database, `groups/${groupId}/messages/${messageId}`);
    await remove(messageRef);
  };

  // Voice note handlers
  const handleStartRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    setAudioChunks([]);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      setAudioChunks((prev) => [...prev, e.data]);
    };
    recorder.onstop = async () => {
      setRecording(false);
      setIsSendingVoice(true);
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        await sendVoiceNote(base64Audio);
        setIsSendingVoice(false);
      };
      reader.readAsDataURL(audioBlob);
    };
    setMediaRecorder(recorder);
    recorder.start();
    setRecording(true);
  };

  const handleStopRecording = () => {
    mediaRecorder?.stop();
    setMediaRecorder(null);
  };

  const sendVoiceNote = async (base64Audio: string) => {
    if (!groupId) return;
    const now = Date.now();
    const messagesRef = ref(database, `groups/${groupId}/messages`);
    const newMessageRef = push(messagesRef);
    const updates: { [key: string]: any } = {};
    updates[`groups/${groupId}/lastMessageTime`] = now;
    updates[`groups/${groupId}/messages/${newMessageRef.key}`] = {
      text: '',
      sender: sessionId,
      timestamp: now,
      reactions: {},
      voiceNoteUrl: base64Audio,
      profileEmoji,
      ...(replyingTo && {
        replyTo: {
          id: replyingTo.id,
          text: replyingTo.text,
          sender: replyingTo.sender
        }
      })
    };
    await update(ref(database), updates);
    setReplyingTo(null);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-dark-100 dark:via-dark-200 dark:to-dark-300 overflow-hidden">
      {/* Emoji avatar selector */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white/80 dark:bg-dark-200/80 border-b border-gray-200 dark:border-dark-100 mt-16 shadow-sm backdrop-blur">
        <span className="text-sm font-medium">Choose your profile emoji:</span>
        <div className="flex gap-1 flex-wrap">
          {PROFILE_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setProfileEmoji(emoji)}
              className={`text-2xl rounded-full border-2 transition-all duration-150 ${profileEmoji === emoji ? 'border-primary-500 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'} focus:outline-none bg-white dark:bg-dark-100`}
              style={{ width: 38, height: 38, lineHeight: '34px', padding: 0 }}
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/90 dark:bg-dark-200/90 p-4 border-b border-gray-200 dark:border-dark-100 flex items-center fixed top-0 left-0 right-0 z-50 shadow-md w-full backdrop-blur">
        <button
          onClick={() => navigate('/groups')}
          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold truncate flex-1">{groupName}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-1 sm:px-4 py-6 space-y-6 overflow-x-hidden w-full">
        {messages.map((message) => {
          const isMine = message.sender === sessionId;
          const avatar = message.profileEmoji || PROFILE_EMOJIS[0];
          return (
            <div key={message.id} className={`w-full flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
              {!isMine && (
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    fontSize: 30,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f3f4f6',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
                  }}
                  className="mr-2"
                >
                  {avatar}
                </span>
              )}
              <div
                className={`flex ${isMine ? 'justify-end' : 'justify-start'} relative w-full`}
                style={{ overflowX: 'visible' }}
              >
                <div
                  className={`rounded-2xl p-4 relative break-words bg-clip-padding shadow-md ${
                    isMine
                      ? 'bg-gradient-to-br from-primary-500 to-purple-500 text-white'
                      : 'bg-white/90 dark:bg-dark-100/90 text-gray-800 dark:text-gray-200'
                  } max-w-[90vw] sm:max-w-md`}
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    marginLeft: isMine ? 'auto' : '0',
                    marginRight: isMine ? '0' : 'auto',
                    minWidth: '60px',
                    whiteSpace: 'pre-line',
                    border: isMine ? '1.5px solid #a5b4fc' : '1.5px solid #e0e7ef'
                  }}
                >
                  {message.replyTo && (
                    <div className={`mb-2 p-2 rounded-lg ${
                      isMine
                        ? 'bg-primary-600/80 text-white'
                        : 'bg-gray-100/80 dark:bg-dark-200/80 text-gray-600 dark:text-gray-400'
                    }`}>
                      <p className="text-xs font-medium">Replying to message</p>
                      <p className="text-xs truncate">{message.replyTo.text}</p>
                    </div>
                  )}
                  {message.voiceNoteUrl ? (
                    <audio controls src={message.voiceNoteUrl} className="mb-1 w-full" />
                  ) : (
                    <p
                      className="text-base mb-1 break-words whitespace-pre-line leading-relaxed"
                      style={{
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word',
                        fontSize: '1.08rem',
                        lineHeight: '1.7',
                        margin: 0,
                        padding: 0,
                        letterSpacing: '0.01em'
                      }}
                    >
                      {message.text}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </p>
                    {isMine && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="ml-2 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 z-10 flex flex-col space-y-1 ${
                      isMine ? '-left-6' : '-right-6'
                    }`}
                    style={{ overflow: 'visible' }}
                  >
                    <button
                      onClick={() => {
                        const newValue = showEmojiPicker === message.id ? null : message.id;
                        setShowEmojiPicker(newValue);
                      }}
                      className="p-1 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-100 shadow rounded-full hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                      style={{ width: 24, height: 24 }}
                    >
                      <Smile className="w-3 h-3" />
                    </button>
                    {showEmojiPicker === message.id && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 ${
                          isMine
                            ? 'left-0 -translate-x-full'
                            : 'right-0 translate-x-full'
                        } bg-white dark:bg-dark-200 border border-blue-500 border-2 dark:border-blue-500 rounded-xl shadow-xl p-2 flex gap-2 z-50`}
                        style={{ whiteSpace: 'nowrap', overflow: 'visible', maxWidth: '220px' }}
                      >
                        {EMOJI_OPTIONS.map(option => (
                          <button
                            key={option.key}
                            className="text-xl hover:scale-125 transition-transform focus:outline-none"
                            onClick={() => handleReaction(message.id, option.key)}
                            style={{ minWidth: 32 }}
                          >
                            {option.emoji}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => handleReply(message)}
                      className="p-1 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-100 shadow rounded-full hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                      style={{ width: 24, height: 24 }}
                    >
                      <Reply className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              {isMine && (
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    fontSize: 30,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f3f4f6',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
                  }}
                  className="ml-2"
                >
                  {avatar}
                </span>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {replyingTo && (
        <div className="px-1 sm:px-4 py-2 bg-gray-100/90 dark:bg-dark-100/90 border-t border-gray-200 dark:border-dark-100 sticky bottom-16 z-20 w-full rounded-t-xl shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Replying to message</p>
              <p className="text-sm truncate">{replyingTo.text}</p>
            </div>
            <button
              onClick={cancelReply}
              className="p-1 hover:bg-gray-200 dark:hover:bg-dark-200 rounded-full transition-colors flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="p-1 sm:p-4 border-t border-gray-200 dark:border-dark-100 sticky bottom-[0.5%] z-30 bg-white/90 dark:bg-dark-200/90 w-full shadow-lg backdrop-blur">
        <div className="flex items-center space-x-2 w-full">
          <div className="flex-1 relative w-full">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
              className="w-full px-4 py-2 pr-12 border rounded-full dark:bg-dark-100 dark:border-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/90"
              style={{ overflowX: 'hidden', fontSize: '1.05rem', letterSpacing: '0.01em' }}
              disabled={recording || isSendingVoice}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newMessage.trim() || recording || isSendingVoice}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {!recording ? (
            <button
              type="button"
              onClick={handleStartRecording}
              className="p-2 rounded-full bg-gray-200 dark:bg-dark-100 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
              disabled={isSendingVoice}
              title="Record voice note"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" fill={isSendingVoice ? "#aaa" : "#ef4444"} />
                <rect x="10" y="8" width="4" height="8" rx="2" fill="#fff" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopRecording}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Stop recording"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect x="7" y="7" width="10" height="10" rx="2" fill="#fff" />
              </svg>
            </button>
          )}
        </div>
        {recording && (
          <div className="text-xs text-red-500 mt-1">Recording... Click stop to send.</div>
        )}
        {isSendingVoice && (
          <div className="text-xs text-blue-500 mt-1">Sending voice note...</div>
        )}
      </form>
    </div>
  );
};

export default GroupChat;