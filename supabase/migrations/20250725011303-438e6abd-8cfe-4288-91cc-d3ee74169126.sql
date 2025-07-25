-- The trigger is failing because auth.users doesn't have updated_at field
-- Let's fix the trigger function to not reference non-existent fields

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
  
  -- Always return NEW for AFTER INSERT triggers
  RETURN NEW;
END;
$$;