import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const activeUserIdRef = useRef(null);

  const userId = currentUser?.user_id;

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    try {
      const data = await notificationService.getNotificationsForUser(userId);
      // Ensure we only set notifications if the user is still the current user
      if (activeUserIdRef.current === userId) {
        setNotifications(data || []);
      }
    } catch (err) {
      console.warn('Failed to load user notifications:', err);
    }
  }, [userId]);

  useEffect(() => {
    activeUserIdRef.current = userId;

    if (!userId) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));

    // 1. Set up Supabase Realtime subscription
    const unsubscribe = notificationService.subscribeToUserNotifications(userId, () => {
      fetchNotifications();
    });

    // 2. Set up fallback polling (every 15 seconds) to guarantee updates even if Postgres replication is disabled
    const intervalId = setInterval(() => {
      // Only poll if tab is currently visible to save resources
      if (!document.hidden) {
        fetchNotifications();
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = async (item) => {
    if (!userId || !item) return;

    // Optimistically update state
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, is_read: true } : n))
    );

    await notificationService.markAsRead(userId, item);
  };

  const markAllAsRead = async () => {
    if (!userId || notifications.length === 0) return;

    // Optimistically update state
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    await notificationService.markAllAsRead(userId, notifications);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
