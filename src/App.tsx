import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import MenuDetail from './pages/MenuDetail';
import Board from './pages/Board';
import Me from './pages/Me';

// Create a client
const queryClient = new QueryClient();

function AppContent() {
  const { user, loading, signInAnon } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      signInAnon();
    }
  }, [loading, user, signInAnon]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/menu/:id" element={<MenuDetail />} />
          <Route path="/board" element={<Board />} />
          <Route path="/me" element={<Me />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
