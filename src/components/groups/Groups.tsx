import React, { useState, useEffect } from 'react';
import { database } from '../../config/firebase';
import { ref, push, onValue, set, remove, get } from 'firebase/database';
import { Plus, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Group {
  id: string;
  name: string;
  category: string;
  description: string;
  createdAt: number;
  lastMessageTime?: number;
}

const CATEGORIES = [
  'Technology',
  'Science',
  'Arts',
  'Sports',
  'Music',
  'Gaming',
  'Education',
  'Business',
  'Health',
  'Other'
];

const INACTIVE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    const groupsRef = ref(database, 'groups');
    const unsubscribe = onValue(groupsRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupsList = Object.entries(data).map(([id, group]: [string, any]) => ({
          id,
          ...group
        }));

        // Check for inactive groups
        const now = Date.now();
        for (const group of groupsList) {
          const lastMessageTime = group.lastMessageTime || group.createdAt;
          if (now - lastMessageTime > INACTIVE_THRESHOLD) {
            // Delete inactive group
            const groupRef = ref(database, `groups/${group.id}`);
            await remove(groupRef);
          }
        }

        // Update groups list after potential deletions
        const updatedSnapshot = await get(groupsRef);
        const updatedData = updatedSnapshot.val();
        if (updatedData) {
          const updatedGroupsList = Object.entries(updatedData).map(([id, group]: [string, any]) => ({
            id,
            ...group
          }));
          setGroups(updatedGroupsList);
        } else {
          setGroups([]);
        }
      } else {
        setGroups([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const groupsRef = ref(database, 'groups');
    const newGroupRef = push(groupsRef);
    const now = Date.now();
    
    await set(newGroupRef, {
      ...newGroup,
      createdAt: now,
      lastMessageTime: now
    });

    setNewGroup({ name: '', category: '', description: '' });
    setShowCreateModal(false);
  };

  const handleChatClick = (groupId: string, groupName: string) => {
    navigate(`/groups/${groupId}/chat`, { state: { groupName } });
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-dark-100 dark:via-dark-200 dark:to-dark-300 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-700 dark:text-primary-200 drop-shadow">
          Groups
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-full shadow-lg hover:from-primary-600 hover:to-purple-600 transition-all font-semibold text-base sm:text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white/90 dark:bg-dark-200/90 rounded-2xl shadow-xl p-5 sm:p-7 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-dark-100 flex flex-col"
          >
            <h2 className="text-lg sm:text-2xl font-bold mb-2 text-primary-700 dark:text-primary-200">{group.name}</h2>
            <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-xs sm:text-sm mb-3 sm:mb-4 font-medium">
              {group.category}
            </span>
            <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 flex-1 text-sm sm:text-base">{group.description}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => handleChatClick(group.id, group.name)}
                className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-full shadow hover:from-primary-600 hover:to-purple-600 transition-all font-semibold text-sm sm:text-base"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-dark-200 rounded-2xl p-4 sm:p-8 w-full max-w-md shadow-2xl border border-primary-100 dark:border-primary-900/30">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary-700 dark:text-primary-200">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-3 sm:mb-5">
                <label className="block text-xs sm:text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-dark-100 dark:border-dark-100 focus:ring-2 focus:ring-primary-500 text-sm"
                  required
                />
              </div>
              <div className="mb-3 sm:mb-5">
                <label className="block text-xs sm:text-sm font-medium mb-2">Category</label>
                <select
                  value={newGroup.category}
                  onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-dark-100 dark:border-dark-100 focus:ring-2 focus:ring-primary-500 text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4 sm:mb-7">
                <label className="block text-xs sm:text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-dark-100 dark:border-dark-100 focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 sm:px-4 sm:py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-full shadow hover:from-primary-600 hover:to-purple-600 transition-all font-semibold text-sm sm:text-base"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;