import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PostProvider } from './context/PostContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Trending from './pages/Trending';
import Search from './pages/Search';
import Live from './pages/Live';
import CategoryView from './pages/CategoryView';
import Groups from './components/groups/Groups';
import GroupChat from './components/groups/GroupChat';
import PrivacyPolicy from './pages/PrivacyPolicy';
import OtherCategory from './pages/OtherCategory';

function AppContent() {
  const location = useLocation();
  const isGroupChat = /^\/groups\/.+\/chat$/.test(location.pathname);
  return (
    <div className={isGroupChat ? 'h-screen overflow-hidden bg-gray-50 dark:bg-dark-300 text-gray-900 dark:text-gray-100 transition-colors duration-200' : 'min-h-screen bg-gray-50 dark:bg-dark-300 text-gray-900 dark:text-gray-100 transition-colors duration-200'}>
      {!isGroupChat && <Header />}
      <div className={isGroupChat ? 'h-screen flex flex-col' : 'pt-16 pb-16 md:pb-0 container mx-auto'}>
        <div className={isGroupChat ? 'flex-1 flex' : 'flex'}>
          {!isGroupChat && <Sidebar />}
          <main className={isGroupChat ? 'flex-1 h-full' : 'flex-1 py-6'}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/search" element={<Search />} />
              <Route path="/live" element={<Live />} />
              <Route path="/category/other" element={<OtherCategory />} />
              <Route path="/category/:categoryId" element={<CategoryView />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/:groupId/chat" element={<GroupChat />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PostProvider>
          <AppContent />
        </PostProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;