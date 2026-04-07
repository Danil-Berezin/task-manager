import { supabase } from './supabase';
import type { Database } from '../types/database';

type UserInsert = Database['public']['Tables']['users']['Insert'];

export const getOrCreateTestUser = async (): Promise<string> => {
  // 1. Check localStorage
  const storedId = localStorage.getItem('my_user_id');
  if (storedId) {
    return storedId;
  }

  // 2. Generate new test user
  const newUser: UserInsert = {
    full_name: "Тестовый Рабочий",
    role: "worker",
    specialty: "Разнорабочий",
    phone: "+79990000000"
  };

  try {
    // 3. Insert into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert(newUser)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating test user:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    // 4. Save ID to localStorage
    localStorage.setItem('my_user_id', data.id);
    
    return data.id;
  } catch (error) {
    console.error('Failed to get or create test user:', error);
    // Fallback or rethrow depending on needs. For now rethrow.
    throw error;
  }
};
