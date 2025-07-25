-- Fix infinite recursion in admin_users RLS policies
-- Create a security definer function to check admin role without triggering RLS recursion

CREATE OR REPLACE FUNCTION public.get_admin_user_by_id(check_user_id uuid)
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  role admin_role,
  user_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    adu.id,
    adu.email,
    adu.name,
    adu.role,
    adu.user_id,
    adu.created_at,
    adu.updated_at
  FROM public.admin_users adu
  WHERE adu.user_id = check_user_id;
$$;

-- Drop the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Admin users can view admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update admin records" ON public.admin_users;

-- Create new RLS policies using the security definer function to avoid recursion
CREATE POLICY "Admin users can view admin records" 
ON public.admin_users 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.is_admin_user(auth.uid())
);

CREATE POLICY "Admin users can update admin records" 
ON public.admin_users 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  OR public.is_admin_user(auth.uid())
)
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_admin_user(auth.uid())
);