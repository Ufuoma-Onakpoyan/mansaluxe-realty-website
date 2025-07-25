-- Add the missing updated_at column to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();