-- Drop existing problematic RLS policies on admin_users
DROP POLICY IF EXISTS "Super admin can create admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admin can delete other admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view own admin record OR super admins view all" ON public.admin_users;
DROP POLICY IF EXISTS "Users can update own admin record OR super admins update any" ON public.admin_users;

-- Create a security definer function to check if current user is admin
-- This function bypasses RLS to prevent recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'editor')
  );
$function$;

-- Create a security definer function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  );
$function$;

-- Create new RLS policies using the security definer functions
CREATE POLICY "Users can view own admin record OR super admins view all" 
ON public.admin_users 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.is_current_user_super_admin()
);

CREATE POLICY "Users can update own admin record OR super admins update any" 
ON public.admin_users 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  OR public.is_current_user_super_admin()
)
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_current_user_super_admin()
);

CREATE POLICY "Super admin can create admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (public.is_current_user_super_admin());

CREATE POLICY "Super admin can delete other admin users" 
ON public.admin_users 
FOR DELETE 
USING (
  user_id != auth.uid() 
  AND public.is_current_user_super_admin()
);