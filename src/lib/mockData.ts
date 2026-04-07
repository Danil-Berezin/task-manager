import type { Task, User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
  },
  {
    id: '2',
    name: 'John Doe',
    role: 'executor',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
  },
  {
    id: '3',
    name: 'Jane Smith',
    role: 'executor',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: '101',
    title: 'Разработать логотип для кофейни',
    description: 'Нужен современный, минималистичный логотип для новой кофейни в центре города.',
    price: 5000,
    status: 'open',
    createdAt: '2023-10-26T10:00:00Z',
  },
  {
    id: '102',
    title: 'Верстка лендинга',
    description: 'Сверстать лендинг по готовому макету Figma. Адаптив, анимации.',
    price: 12000,
    status: 'in_progress',
    createdAt: '2023-10-25T14:30:00Z',
    executorId: '2',
  },
  {
    id: '103',
    title: 'Написать скрипт парсинга',
    description: 'Скрипт на Python для сбора данных с сайта объявлений.',
    price: 3000,
    status: 'completed',
    createdAt: '2023-10-24T09:15:00Z',
    executorId: '3',
  },
];
