-- Create a function to automatically link auth users to admin_users table
CREATE OR REPLACE FUNCTION public.link_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user's email exists in admin_users table without a user_id
  UPDATE public.admin_users 
  SET user_id = NEW.id
  WHERE email = NEW.email 
  AND user_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically link admin users when they sign up
CREATE OR REPLACE TRIGGER on_auth_user_created_link_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_admin_user();