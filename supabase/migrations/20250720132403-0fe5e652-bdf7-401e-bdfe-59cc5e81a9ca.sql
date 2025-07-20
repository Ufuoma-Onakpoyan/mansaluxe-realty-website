-- Create admin role system
CREATE TYPE admin_role AS ENUM ('super_admin', 'editor', 'viewer');

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'viewer',
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('testimonial-photos', 'testimonial-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('property-media', 'property-media', true);

-- Update RLS policies for admin access
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials"
ON testimonials FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'editor')
  )
);

DROP POLICY IF EXISTS "Admins can insert properties" ON properties;
DROP POLICY IF EXISTS "Admins can update properties" ON properties;
DROP POLICY IF EXISTS "Admins can delete properties" ON properties;

CREATE POLICY "Admins can manage properties"
ON properties FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'editor')
  )
);

-- Storage policies for admin file uploads
CREATE POLICY "Admins can upload testimonial photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'testimonial-photos' AND
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'editor')
  )
);

CREATE POLICY "Admins can view testimonial photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimonial-photos');

CREATE POLICY "Admins can update testimonial photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'testimonial-photos' AND
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'editor')
  )
);

CREATE POLICY "Admins can delete testimonial photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'testimonial-photos' AND
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'editor')
  )
);

CREATE POLICY "Admins can upload property media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-media' AND
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'editor')
  )
);

CREATE POLICY "Admins can view property media"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-media');

CREATE POLICY "Admins can update property media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-media' AND
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'editor')
  )
);

CREATE POLICY "Admins can delete property media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-media' AND
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'editor')
  )
);