-- Create admin record for test@mansaluxerealty.com user
-- First, let's insert the admin record linking to the existing auth user
INSERT INTO public.admin_users (email, name, role, user_id)
SELECT 
  'test@mansaluxerealty.com' as email,
  'Test User' as name,
  'super_admin'::admin_role as role,
  au.id as user_id
FROM auth.users au 
WHERE au.email = 'test@mansaluxerealty.com'
ON CONFLICT (email) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  updated_at = now();