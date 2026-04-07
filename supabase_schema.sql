-- Enable UUID extension (usually enabled by default in Supabase, but good to be explicit)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE,
    role TEXT CHECK (role IN ('admin', 'worker')) NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    specialty TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE, -- Can be null if indefinite
    price NUMERIC NOT NULL,
    price_overtime NUMERIC,
    workers_needed INTEGER NOT NULL DEFAULT 1,
    status TEXT CHECK (status IN ('open', 'full', 'completed', 'canceled')) DEFAULT 'open' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Applications Table (Responses to tasks)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(task_id, user_id) -- Prevent duplicate applications
);

-- Disable Row Level Security (RLS) for MVP as requested
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;

-- Optional: Create some indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_applications_task_id ON public.applications(task_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Users of the platform (Admins and Workers)';
COMMENT ON TABLE public.tasks IS 'Job listings created by admins';
COMMENT ON TABLE public.applications IS 'Worker applications for specific tasks';
