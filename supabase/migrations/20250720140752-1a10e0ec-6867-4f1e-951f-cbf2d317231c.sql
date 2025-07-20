-- Update RLS policies to allow operations for admin operations

-- Drop existing restrictive policies for properties
DROP POLICY IF EXISTS "Admins can manage properties" ON properties;

-- Create more permissive policy for properties that allows all operations
CREATE POLICY "Allow all operations on properties" 
ON properties 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Drop existing restrictive policies for testimonials  
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;

-- Create more permissive policy for testimonials that allows all operations
CREATE POLICY "Allow all operations on testimonials"
ON testimonials
FOR ALL
USING (true) 
WITH CHECK (true);

-- Update storage policies to be more permissive for admin operations
-- Drop existing restrictive storage policies if they exist
DROP POLICY IF EXISTS "Admin file upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Admin file access policy" ON storage.objects;

-- Create permissive storage policies for property-images bucket
CREATE POLICY "Allow all operations on property-images" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'property-images');

-- Create permissive storage policies for testimonial-photos bucket  
CREATE POLICY "Allow all operations on testimonial-photos"
ON storage.objects
FOR ALL
USING (bucket_id = 'testimonial-photos');

-- Create permissive storage policies for property-media bucket
CREATE POLICY "Allow all operations on property-media"
ON storage.objects 
FOR ALL
USING (bucket_id = 'property-media');