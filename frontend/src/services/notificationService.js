import { supabase } from '../lib/supabase';
import { parseDate } from '../utils/dateFormat';

// In-memory cache for resolved user names (faculty, student, admin) to avoid repeated queries
const senderNameCache = new Map();

/**
 * Normalizes message text into { subject, content }
 * Handles patterns like "[Subject]\nContent" or "[Subject] Content"
 */
export const parseMessageText = (text) => {
  if (!text) return { subject: 'Notification', content: '' };
  const trimmed = text.trim();
  const match = trimmed.match(/^\[(.*?)\](?:\s*\n|\s*)([\s\S]*)$/);
  if (match) {
    return {
      subject: match[1].trim() || 'Notification',
      content: match[2].trim()
    };
  }
  return {
    subject: 'System Notice',
    content: trimmed
  };
};

/**
 * Formats a Date/timestamp into local time (e.g. 'Today, 12:25 AM' or '28/09/2026, 12:25 AM')
 */
export const formatNotificationDate = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = parseDate(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);

    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timeStr = `${hour12}:${minutes} ${ampm}`;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((today - itemDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${timeStr}`;
    }
    if (diffDays === 1) {
      return `Yesterday, ${timeStr}`;
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}, ${timeStr}`;
  } catch {
    return String(dateVal);
  }
};

/**
 * Helper to check local read status fallback
 */
const getLocalReadSet = (userId) => {
  try {
    const list = JSON.parse(localStorage.getItem(`rit_read_notifs_${userId}`) || '[]');
    return new Set(list);
  } catch {
    return new Set();
  }
};

/**
 * Helper to save local read status
 */
const saveLocalReadId = (userId, id) => {
  try {
    const key = `rit_read_notifs_${userId}`;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(key, JSON.stringify(list));
    }
  } catch (err) {
    console.warn('Failed to save read status locally:', err);
  }
};

/**
 * Resolves sender name from cache or DB based on role and user_id
 */
const resolveSenderDisplay = async (senderUser) => {
  if (!senderUser) return 'Admin Office';
  const { user_id, role, email } = senderUser;

  if (senderNameCache.has(user_id)) {
    return senderNameCache.get(user_id);
  }

  if (role === 'ADMIN') {
    const display = 'Admin Office';
    senderNameCache.set(user_id, display);
    return display;
  }

  try {
    if (role === 'TEACHER' || role === 'FACULTY' || role === 'COORDINATOR') {
      const { data: fac } = await supabase
        .from('faculty')
        .select('name, is_coordinator')
        .eq('user_id', user_id)
        .maybeSingle();

      if (fac?.name) {
        const title = fac.is_coordinator ? `${fac.name} (Coordinator)` : `${fac.name} (Faculty)`;
        senderNameCache.set(user_id, title);
        return title;
      }
    }

    if (role === 'STUDENT') {
      const { data: std } = await supabase
        .from('student')
        .select('name, usn')
        .eq('user_id', user_id)
        .maybeSingle();

      if (std?.name) {
        const title = std.usn ? `${std.name} (${std.usn})` : std.name;
        senderNameCache.set(user_id, title);
        return title;
      }
    }
  } catch (err) {
    console.warn('Could not resolve sender profile:', err);
  }

  // Graceful fallback to email prefix or role
  const fallback = email ? email.split('@')[0] : (role || 'System');
  senderNameCache.set(user_id, fallback);
  return fallback;
};

/**
 * Maps role to appropriate category label
 */
const getCategoryLabel = (senderRole, text) => {
  if (senderRole === 'ADMIN' || text?.toLowerCase().includes('circular')) {
    return 'OFFICIAL CIRCULAR';
  }
  if (senderRole === 'COORDINATOR') {
    return 'COORDINATOR NOTICE';
  }
  if (senderRole === 'FACULTY' || senderRole === 'TEACHER') {
    return 'FACULTY MESSAGE';
  }
  if (senderRole === 'STUDENT') {
    return 'STUDENT MESSAGE';
  }
  return 'NOTIFICATION';
};

export const notificationService = {
  /**
   * Fetches centralized notifications for a specific logged-in user
   * Combines incoming messages (where receiver_id == userId) and notifications (where user_id == userId)
   */
  async getNotificationsForUser(userId) {
    if (!userId) return [];

    const localReadSet = getLocalReadSet(userId);
    const notificationsList = [];

    // 1. Fetch incoming messages where receiver_id is this user
    try {
      const { data: messages, error: msgError } = await supabase
        .from('message')
        .select(`
          message_id,
          sender_id,
          receiver_id,
          message_text,
          sent_at,
          is_read,
          sender:users!sender_id(user_id, role, email)
        `)
        .eq('receiver_id', userId)
        .order('sent_at', { ascending: false });

      if (msgError) {
        console.warn('Error fetching messages for notifications:', msgError.message);
      } else if (messages && messages.length > 0) {
        for (const m of messages) {
          const parsed = parseMessageText(m.message_text);
          const notifId = `msg-${m.message_id}`;
          const isRead = Boolean(m.is_read || localReadSet.has(notifId));
          const senderDisplay = await resolveSenderDisplay(m.sender);

          notificationsList.push({
            id: notifId,
            table: 'message',
            recordId: m.message_id,
            subject: parsed.subject,
            content: parsed.content || m.message_text,
            sender: senderDisplay,
            senderRole: m.sender?.role || 'SYSTEM',
            timestamp: formatNotificationDate(m.sent_at),
            rawDate: parseDate(m.sent_at || Date.now()).getTime(),
            is_read: isRead,
            category: getCategoryLabel(m.sender?.role, m.message_text)
          });
        }
      }
    } catch (err) {
      console.warn('Exception querying messages for notification dropdown:', err);
    }

    // 2. Fetch notifications from notification table where user_id is this user (if present)
    try {
      const { data: notifs, error: notifError } = await supabase
        .from('notification')
        .select('notification_id, user_id, title, message, is_read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (notifError) {
        // Table may not have rows or restricted by RLS for non-admins
        console.warn('Notice querying notification table:', notifError.message);
      } else if (notifs && notifs.length > 0) {
        for (const n of notifs) {
          const notifId = `notif-${n.notification_id}`;
          const isRead = Boolean(n.is_read || localReadSet.has(notifId));

          notificationsList.push({
            id: notifId,
            table: 'notification',
            recordId: n.notification_id,
            subject: n.title || 'Official Notification',
            content: n.message || '',
            sender: 'Admin Office',
            senderRole: 'ADMIN',
            timestamp: formatNotificationDate(n.created_at),
            rawDate: parseDate(n.created_at || Date.now()).getTime(),
            is_read: isRead,
            category: 'OFFICIAL CIRCULAR'
          });
        }
      }
    } catch (err) {
      console.warn('Exception querying notification table:', err);
    }

    // 3. Sort by most recent first
    notificationsList.sort((a, b) => b.rawDate - a.rawDate);

    return notificationsList;
  },

  /**
   * Marks a notification as read both in local storage and in Supabase
   */
  async markAsRead(userId, notificationItem) {
    if (!userId || !notificationItem) return;

    saveLocalReadId(userId, notificationItem.id);

    try {
      if (notificationItem.table === 'message') {
        await supabase
          .from('message')
          .update({ is_read: true })
          .eq('message_id', notificationItem.recordId);
      } else if (notificationItem.table === 'notification') {
        await supabase
          .from('notification')
          .update({ is_read: true })
          .eq('notification_id', notificationItem.recordId);
      }
    } catch (err) {
      console.warn('Failed to update is_read in database, kept local read status:', err);
    }
  },

  /**
   * Marks all provided notifications as read
   */
  async markAllAsRead(userId, notifications) {
    if (!userId || !Array.isArray(notifications)) return;

    const unreadItems = notifications.filter(n => !n.is_read);
    unreadItems.forEach(n => saveLocalReadId(userId, n.id));

    const messageIds = unreadItems
      .filter(n => n.table === 'message')
      .map(n => n.recordId);

    const notifIds = unreadItems
      .filter(n => n.table === 'notification')
      .map(n => n.recordId);

    try {
      if (messageIds.length > 0) {
        await supabase
          .from('message')
          .update({ is_read: true })
          .in('message_id', messageIds);
      }
      if (notifIds.length > 0) {
        await supabase
          .from('notification')
          .update({ is_read: true })
          .in('notification_id', notifIds);
      }
    } catch (err) {
      console.warn('Failed to mark all as read in database, local read status retained:', err);
    }
  },

  /**
   * Subscribes to Supabase Realtime changes on message and notification tables for this user
   */
  subscribeToUserNotifications(userId, onUpdate) {
    if (!userId) return () => {};

    const channelName = `realtime-notifications-user-${userId}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message',
          filter: `receiver_id=eq.${userId}`
        },
        () => {
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification',
          filter: `user_id=eq.${userId}`
        },
        () => {
          onUpdate();
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn(`[Realtime Notifications] Subscription status: ${status}`, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
