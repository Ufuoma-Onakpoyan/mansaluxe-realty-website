-- Create storage bucket for property images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('property-images', 'property-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for property images storage
CREATE POLICY "Anyone can view property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Admin can upload property images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Admin can update property images" ON storage.objects
FOR UPDATE USING (bucket_id = 'property-images');

CREATE POLICY "Admin can delete property images" ON storage.objects
FOR DELETE USING (bucket_id = 'property-images');