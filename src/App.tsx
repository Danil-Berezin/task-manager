import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { getTelegramUser } from './lib/telegram';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateTaskPage from './pages/admin/CreateTaskPage';
import AdminTaskDetails from './pages/admin/AdminTaskDetails';
import WorkerJobFeed from './pages/executor/WorkerJobFeed';
import WorkerTaskDetails from './pages/executor/WorkerTaskDetails';
import AdminBasePage from './pages/admin/AdminBasePage';
import WorkerMyShifts from './pages/executor/WorkerMyShifts';
import WorkerProfile from './pages/executor/WorkerProfile';
import RegistrationPage from './pages/RegistrationPage';
import PageTransition from './components/PageTransition';
import { NotificationProvider } from './contexts/NotificationContext';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegistrationPageWrapper /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/admin/create" element={<PageTransition><CreateTaskPage /></PageTransition>} />
        <Route path="/admin/task/:id" element={<PageTransition><AdminTaskDetails /></PageTransition>} />
        <Route path="/admin/base" element={<PageTransition><AdminBasePage /></PageTransition>} />
        <Route path="/executor" element={<PageTransition><WorkerJobFeed /></PageTransition>} />
        <Route path="/executor/task/:id" element={<PageTransition><WorkerTaskDetails /></PageTransition>} />
        <Route path="/executor/shifts" element={<PageTransition><WorkerMyShifts /></PageTransition>} />
        <Route path="/executor/profile" element={<PageTransition><WorkerProfile /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// Wrapper to pass props to RegistrationPage
const RegistrationPageWrapper: React.FC = () => {
  const telegramUser = getTelegramUser();

  if (!telegramUser) {
    return <Navigate to="/" />;
  }

  const handleSuccess = () => {
    // After registration, verify the user and redirect
    // For simplicity, we can reload or manually navigate
    // Let's assume registration sets everything up, we just need to re-trigger the auth check
    // But since we are inside the router, a reload is the safest way to re-run the App component's logic
    window.location.reload(); 
  };

  return <RegistrationPage telegramUser={telegramUser} onSuccess={handleSuccess} />;
};

const AppContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const telegramUser = getTelegramUser();

      if (!telegramUser) {
        // Not in Telegram (Browser Mode) -> Stay on Home (Debug Mode)
        setLoading(false);
        return;
      }

      // In Telegram -> Check Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error('Error checking user:', error);
        // Fallback to home on error? Or show error screen?
        // For now, stay on home (or maybe registration if we assume error means no user?)
        // Better to handle "no user" explicitly
      }

      if (user) {
        // Scenario A: User found
        localStorage.setItem('my_user_id', user.id); // Keep legacy logic working
        
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/executor');
        }
      } else {
        // Scenario B: User NOT found
        navigate('/register');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <NotificationProvider>
      <AnimatedRoutes />
    </NotificationProvider>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
