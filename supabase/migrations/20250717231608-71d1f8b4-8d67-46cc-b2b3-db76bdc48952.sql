-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(15, 2) NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending')),
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  agent JSONB,
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_feet INTEGER,
  lot_size TEXT,
  year_built INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for main website)
CREATE POLICY "Properties are viewable by everyone" 
ON public.properties 
FOR SELECT 
USING (true);

-- Create policies for admin access (you'll need authentication later)
CREATE POLICY "Admins can insert properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update properties" 
ON public.properties 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete properties" 
ON public.properties 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  photo TEXT,
  quote TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  property_id UUID REFERENCES public.properties(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonials
CREATE POLICY "Testimonials are viewable by everyone" 
ON public.testimonials 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage testimonials" 
ON public.testimonials 
FOR ALL 
USING (true);

-- Create trigger for testimonials timestamps
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();