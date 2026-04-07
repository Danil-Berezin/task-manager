import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getOrCreateTestUser } from '../lib/auth';

interface NotificationContextType {
  approvedCount: number;
}

const NotificationContext = createContext<NotificationContextType>({ approvedCount: 0 });

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [approvedCount, setApprovedCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetchInitialCount();

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'applications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new.status === 'approved' && payload.old.status !== 'approved') {
            setApprovedCount(prev => prev + 1);
            alert('🎉 Вас утвердили на заявку!');
          } else if (payload.new.status === 'rejected' && payload.old.status !== 'rejected') {
             // Optional: notify about rejection
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const initUser = async () => {
    try {
      const id = await getOrCreateTestUser();
      setUserId(id);
    } catch (err) {
      console.error('Error getting user ID:', err);
    }
  };

  const fetchInitialCount = async () => {
    if (!userId) return;
    try {
      // Assuming we want to count ALL approved applications for now
      // Or maybe only those that are "new" (unread)?
      // For this task, user said "count: exact" with eq('status', 'approved')
      // However, usually we'd only count UNREAD notifications.
      // But based on instruction: "Сделай запрос ... eq('status', 'approved') ... Сохрани количество"
      // This means the badge shows TOTAL approved applications.
      
      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'approved');
      
      if (!error && count !== null) {
        setApprovedCount(count);
      }
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ approvedCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
