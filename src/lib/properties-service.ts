import { adminSupabase } from '@/integrations/supabase/admin-client';

export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  status: 'available' | 'sold' | 'pending';
  images: string[];
  amenities: string[];
  features: string[];
  agent?: any;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: string;
  year_built?: number;
  created_at: string;
  updated_at: string;
  
  // Additional fields for compatibility with the existing admin interface
  area?: string;
  type?: string;
  featured?: boolean;
  virtualTourUrl?: string;
  videoUrl?: string;
  floorPlanImages?: string[];
}

export interface CreatePropertyData {
  title: string;
  description?: string;
  price: string;
  location: string;
  status?: 'available' | 'sold' | 'pending';
  images?: string[];
  amenities?: string[];
  features?: string[];
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: string;
  year_built?: number;
  area?: string;
  type?: string;
  featured?: boolean;
  virtualTourUrl?: string;
  videoUrl?: string;
  floorPlanImages?: string[];
}

export const propertiesService = {
  async getProperties(): Promise<Property[]> {
    const { data, error } = await adminSupabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    return data.map(property => ({
      ...property,
      // Map database fields to frontend interface
      area: property.lot_size || (property.square_feet ? `${property.square_feet} sqft` : ''),
      type: property.property_type || '',
      featured: false, // Default for now
      status: property.status as 'available' | 'sold' | 'pending',
      description: property.description || '',
      images: property.images || [],
      amenities: property.amenities || [],
      features: property.features || [],
    }));
  },

  async getProperty(id: string): Promise<Property | null> {
    const { data, error } = await adminSupabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Property not found
      }
      throw new Error(`Failed to fetch property: ${error.message}`);
    }

    return {
      ...data,
      area: data.lot_size || (data.square_feet ? `${data.square_feet} sqft` : ''),
      type: data.property_type || '',
      featured: false,
      status: data.status as 'available' | 'sold' | 'pending',
      description: data.description || '',
      images: data.images || [],
      amenities: data.amenities || [],
      features: data.features || [],
    };
  },

  async createProperty(propertyData: CreatePropertyData): Promise<Property> {
    // Convert price string to number
    const priceNumber = parseFloat(propertyData.price.replace(/[^\d.-]/g, ''));
    
    const insertData = {
      title: propertyData.title,
      description: propertyData.description,
      price: priceNumber,
      location: propertyData.location,
      status: propertyData.status || 'available',
      images: propertyData.images || [],
      amenities: propertyData.amenities || [],
      features: propertyData.features || [],
      property_type: propertyData.type || propertyData.property_type,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      square_feet: propertyData.area ? parseInt(propertyData.area.replace(/[^\d]/g, '')) : undefined,
      lot_size: propertyData.area,
      year_built: propertyData.year_built,
      agent: propertyData.virtualTourUrl || propertyData.videoUrl ? {
        virtualTourUrl: propertyData.virtualTourUrl,
        videoUrl: propertyData.videoUrl,
        floorPlanImages: propertyData.floorPlanImages
      } : null
    };

    const { data, error } = await adminSupabase
      .from('properties')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }

    return {
      ...data,
      area: data.lot_size || (data.square_feet ? `${data.square_feet} sqft` : ''),
      type: data.property_type || '',
      featured: false,
      status: data.status as 'available' | 'sold' | 'pending',
      description: data.description || '',
      images: data.images || [],
      amenities: data.amenities || [],
      features: data.features || [],
    };
  },

  async updateProperty(id: string, propertyData: Partial<CreatePropertyData>): Promise<Property> {
    const updateData: any = {};

    if (propertyData.title) updateData.title = propertyData.title;
    if (propertyData.description) updateData.description = propertyData.description;
    if (propertyData.price) {
      updateData.price = parseFloat(propertyData.price.replace(/[^\d.-]/g, ''));
    }
    if (propertyData.location) updateData.location = propertyData.location;
    if (propertyData.status) updateData.status = propertyData.status;
    if (propertyData.images) updateData.images = propertyData.images;
    if (propertyData.amenities) updateData.amenities = propertyData.amenities;
    if (propertyData.features) updateData.features = propertyData.features;
    if (propertyData.type || propertyData.property_type) {
      updateData.property_type = propertyData.type || propertyData.property_type;
    }
    if (propertyData.bedrooms !== undefined) updateData.bedrooms = propertyData.bedrooms;
    if (propertyData.bathrooms !== undefined) updateData.bathrooms = propertyData.bathrooms;
    if (propertyData.area) {
      updateData.square_feet = parseInt(propertyData.area.replace(/[^\d]/g, ''));
      updateData.lot_size = propertyData.area;
    }
    if (propertyData.year_built) updateData.year_built = propertyData.year_built;

    if (propertyData.virtualTourUrl || propertyData.videoUrl || propertyData.floorPlanImages) {
      updateData.agent = {
        virtualTourUrl: propertyData.virtualTourUrl,
        videoUrl: propertyData.videoUrl,
        floorPlanImages: propertyData.floorPlanImages
      };
    }

    const { data, error } = await adminSupabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }

    return {
      ...data,
      area: data.lot_size || (data.square_feet ? `${data.square_feet} sqft` : ''),
      type: data.property_type || '',
      featured: false,
      status: data.status as 'available' | 'sold' | 'pending',
      description: data.description || '',
      images: data.images || [],
      amenities: data.amenities || [],
      features: data.features || [],
    };
  },

  async deleteProperty(id: string): Promise<void> {
    const { error } = await adminSupabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }
};