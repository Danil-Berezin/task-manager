# 🚀 TaskFlow: Telegram Mini App для управления задачами

<p align="center">
 <img width="374" height="476" alt="image" src="https://github.com/user-attachments/assets/693b8830-b195-42a1-9d9b-dfb994910071" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

**TaskFlow** — это современное веб-приложение (Telegram Mini App), разработанное для эффективного управления задачами и сменами. Платформа автоматизирует взаимодействие между администраторами и исполнителями (воркерами), позволяя создавать задачи, управлять заявками и отслеживать выполнение работ в режиме реального времени.

---

## ✨ Ключевые возможности

### 🛡️ Для администраторов (Admin)
- **Dashboard**: Полный обзор всех активных, завершенных и отмененных задач.
- **Создание задач**: Интуитивная форма для публикации новых заявок (название, описание, адрес, время, оплата, количество воркеров).
- **Управление заявками**: Просмотр списка откликнувшихся исполнителей и подтверждение их участия в один клик.
- **База сотрудников**: Просмотр списка всех зарегистрированных пользователей с их специализациями и статусом.

### 👤 Для исполнителей (Executor / Worker)
- **Лента задач**: Актуальный список доступных задач с детальной информацией (местоположение на карте, оплата, график).
- **Отклик на задачи**: Возможность подать заявку на участие в один клик.
- **Мои смены**: Персональный календарь подтвержденных задач для удобного планирования.
- **Профиль**: Управление личной информацией, специализацией и статусом верификации.

---

## 🛠 Технологический стек

| Категория | Технология | Описание |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite | Реактивный интерфейс с строгой типизацией и быстрой сборкой. |
| **Backend & DB** | Supabase (PostgreSQL) | Backend-as-a-Service для аутентификации, базы данных и API. |
| **Интеграция** | Telegram Mini Apps SDK | Бесшовная интеграция приложения в экосистему Telegram. |
| **Стилизация** | Tailwind CSS | Утилитарный CSS-фреймворк для быстрой и кастомной стилизации. |
| **Анимации** | Framer Motion | Плавные и производительные анимации интерфейса. |
| **Иконки** | Lucide React | Легковесная и современная библиотека иконок. |

---

<details>
<summary>📂 Посмотреть структуру проекта</summary>

```text
src/
├── components/     # Переиспользуемые UI-компоненты (навигация, уведомления, анимации)
├── contexts/       # React Контексты (например, система уведомлений)
├── lib/            # Логика взаимодействия с внешними сервисами (Supabase, Telegram API)
├── pages/          # Страницы приложения, разделенные по ролям:
│   ├── admin/      # Панель администратора, создание задач, детали задач
│   └── executor/   # Лента задач, мои смены, профиль исполнителя
├── types/          # TypeScript интерфейсы и типы для базы данных
├── App.tsx         # Основной компонент с маршрутизацией и логикой авторизации
└── main.tsx        # Точка входа в приложение```
</details>

---

## 🚀 Локальный запуск

### Требования
- Node.js (v18+)
- npm

### Инструкция
1. **Клонируйте репозиторий**:
   ```bash
   git clone https://github.com/Danil-Berezin/TaskFlow.git
   cd TaskFlow
  ```
Установите зависимости:
Примечание: флаг --legacy-peer-deps может потребоваться из-за версий зависимостей.

npm install --legacy-peer-deps

Настройте переменные окружения:
Создайте файл .env в корне проекта и добавьте ваши ключи из Supabase: 
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Разверните схему БД:
Перейдите в ваш проект Supabase -> SQL Editor и выполните скрипт из файла supabase_schema.sql для создания таблиц.
Запустите приложение: npm run dev

Приложение будет доступно для разработки и тестирования в вашем браузере.

📸 Скриншоты приложения

<img width="377" height="847" alt="image" src="https://github.com/user-attachments/assets/0340f2a2-0a7b-4ae2-a725-188f3f7c62d6" />
<img width="375" height="849" alt="image" src="https://github.com/user-attachments/assets/478d27dd-5062-4537-b4e1-ecc5d3b58e90" />
<img width="371" height="846" alt="image" src="https://github.com/user-attachments/assets/ea97cdd3-fb85-471b-8dea-1c470d0787dc" />
<img width="380" height="845" alt="image" src="https://github.com/user-attachments/assets/24d26146-4096-424b-92be-913a98d560bf" />
<img width="377" height="845" alt="image" src="https://github.com/user-attachments/assets/aed9eee6-6cc9-4f3e-be42-cfd2eb0492e1" />
<img width="377" height="844" alt="image" src="https://github.com/user-attachments/assets/2977c86e-aad4-4c71-9efa-a3fba98ab3bb" />
<img width="371" height="842" alt="image" src="https://github.com/user-attachments/assets/8df08bec-045f-4f89-b3ee-096b92a810f5" />
<img width="375" height="844" alt="image" src="https://github.com/user-attachments/assets/f2c5b611-2ccc-48c6-892d-c3b8a02c4364" />
