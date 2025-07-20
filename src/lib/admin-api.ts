
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_type: string;
  status: string;
  featured: boolean;
  images: string[];
  amenities: string[];
  features: string[];
  lot_size?: string;
  year_built?: number;
  agent?: any;
  created_at: string;
  updated_at: string;
}

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  photo?: string;
  quote: string;
  rating?: number;
  property_id?: string;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin';
  status: 'Active' | 'Inactive' | 'Suspended';
  avatar: string;
  department: string;
  joinDate: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
  twoFactorVerified?: boolean;
  phoneNumber?: string;
  position?: string;
  bio?: string;
  commissionRate?: number;
  totalSales?: number;
  totalRevenue?: number;
  permissions: string[];
}

interface DashboardStats {
  totalProperties: number;
  pendingInquiries: number;
  totalTestimonials: number;
  adminUser: number;
  propertiesSold: number;
  monthlyRevenue: string;
}

class AdminAPI {
  // Authentication methods
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      // Check if user exists in admin_users table with correct credentials
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError || !adminUser) {
        throw new Error('Invalid email or password');
      }

      // For demo purposes, we'll accept any password for existing admin users
      // In production, you'd want to hash and compare passwords
      const expectedPassword = 'MRDGN123!@#';
      if (password !== expectedPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate a simple token (in production, use proper JWT)
      const token = btoa(`${email}:${Date.now()}`);

      return {
        token,
        user: {
          id: 1,
          name: adminUser.name || 'Admin User',
          email: adminUser.email,
          role: 'Admin',
          status: 'Active',
          avatar: '/placeholder.svg',
          department: 'Management',
          joinDate: adminUser.created_at,
          lastLogin: new Date().toISOString(),
          twoFactorEnabled: false,
          phoneNumber: '+2348012345678',
          position: adminUser.role === 'super_admin' ? 'Super Admin' : 'Editor',
          bio: 'Experienced real estate professional.',
          commissionRate: 5,
          totalSales: 24,
          totalRevenue: 450000000,
          permissions: ['full_access', 'property_management', 'testimonial_management']
        }
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      // Simple token verification (decode and check if not expired)
      const decoded = atob(token);
      const [email, timestamp] = decoded.split(':');
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      
      // Token expires after 24 hours
      return (now - tokenTime) < (24 * 60 * 60 * 1000);
    } catch {
      return false;
    }
  }

  async uploadFile(file: File, bucket: string): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
      
    return publicUrl;
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const properties = await this.getProperties();
    const testimonials = await this.getTestimonials();

    // Calculate real revenue from sold properties
    const soldProperties = properties.filter(p => p.status === 'sold');
    const totalRevenue = soldProperties.reduce((sum, prop) => sum + prop.price, 0);
    
    const monthlyRevenue = `₦${(totalRevenue / 1000000).toFixed(1)}M`;

    return {
      totalProperties: properties.length,
      pendingInquiries: 0,
      totalTestimonials: testimonials.length,
      adminUser: 0,
      propertiesSold: soldProperties.length,
      monthlyRevenue
    };
  }

  // Property methods
  async getProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getProperty(id: string): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProperty(id: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getTestimonial(id: string): Promise<Testimonial> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<Testimonial> {
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonial)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTestimonial(id: string): Promise<void> {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // User management methods
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(user => ({
      id: parseInt(user.id.slice(-8), 16), // Convert UUID to number for UI
      name: user.name || 'Admin User',
      email: user.email,
      role: 'Admin' as const,
      status: 'Active' as const,
      avatar: '/placeholder.svg',
      department: 'Management',
      joinDate: user.created_at,
      lastLogin: new Date().toISOString(),
      twoFactorEnabled: false,
      phoneNumber: '+2348012345678',
      position: user.role === 'super_admin' ? 'Super Admin' : 'Editor',
      bio: 'Experienced real estate professional.',
      commissionRate: 5,
      totalSales: 24,
      totalRevenue: 450000000,
      permissions: ['full_access', 'property_management', 'testimonial_management']
    }));
  }

  // Settings methods
  async getSettings(): Promise<Record<string, any>> {
    return {
      companyName: 'MansaLuxeRealty',
      companySubtitle: 'A subsidiary of MrDGNGroup',
      primaryColor: '#D4AF37',
      secondaryColor: '#000000',
      currency: '₦',
      timezone: 'Africa/Lagos',
      language: 'en',
      emailNotifications: true,
      maintenanceMode: false
    };
  }

  async updateSettings(settings: Record<string, any>): Promise<Record<string, any>> {
    console.log('Updating settings:', settings);
    return settings;
  }
}

export const adminAPI = new AdminAPI();
export type { Property, Testimonial, User, DashboardStats };
