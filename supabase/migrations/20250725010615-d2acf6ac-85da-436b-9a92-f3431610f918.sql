-- Fix the security warning by setting the search_path
CREATE OR REPLACE FUNCTION public.link_admin_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  -- Check if the user's email exists in admin_users table without a user_id
  UPDATE public.admin_users 
  SET user_id = NEW.id
  WHERE email = NEW.email 
  AND user_id IS NULL;
  
  RETURN NEW;
END;
$$;