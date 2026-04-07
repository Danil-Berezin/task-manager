export type UserRole = 'admin' | 'executor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  executorId?: string;
}
