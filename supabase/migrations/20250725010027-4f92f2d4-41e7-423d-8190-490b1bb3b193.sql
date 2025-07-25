-- First add a unique constraint on email column
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_email_unique UNIQUE (email);

-- Insert a default admin user for testing
-- Note: In production, you would create admin users through a proper registration process

-- Insert admin user into admin_users table
INSERT INTO public.admin_users (user_id, email, name, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@mansaluxerealty.com', 'Admin User', 'super_admin')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Insert another admin user for testing
INSERT INTO public.admin_users (user_id, email, name, role)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'editor@mansaluxerealty.com', 'Editor User', 'editor')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;