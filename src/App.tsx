import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import MenuDetail from './pages/MenuDetail';
import Board from './pages/Board';
import Me from './pages/Me';
import Admin from './pages/Admin';
import AdminUsers from './pages/AdminUsers';
import EditMenu from './pages/EditMenu';
import ManageMenus from './pages/ManageMenus';

// Create a client
const queryClient = new QueryClient();

function AppContent() {
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
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/menus" element={<ManageMenus />} />
            <Route path="/admin/edit/:id" element={<EditMenu />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
