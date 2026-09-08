import { supabase } from '../lib/supabase';

export const messageService = {
  async getMessagesForUser(userId) {
    const { data, error } = await supabase
      .from('message')
      .select(`
        *,
        sender:users!sender_id(role, email),
        receiver:users!receiver_id(role, email)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('sent_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  },

  async getAllMessages() {
    const { data, error } = await supabase
      .from('message')
      .select(`
        *,
        sender:users!sender_id(role, email),
        receiver:users!receiver_id(role, email)
      `)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async sendMessage(payload) {
    const { data, error } = await supabase
      .from('message')
      .insert({
        sender_id: payload.sender_id,
        receiver_id: payload.receiver_id,
        message_text: payload.message_text
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteMessage(messageId) {
    const { data, error } = await supabase
      .from('message')
      .delete()
      .eq('message_id', messageId);

    if (error) throw error;
    return data;
  }
};
