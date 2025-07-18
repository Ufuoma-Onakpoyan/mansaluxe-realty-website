// Admin API functions - placeholder implementations
// TODO: Replace with real API calls to backend

interface Property {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  type: string;
  status: 'Available' | 'Under Contract' | 'Sold' | 'Off Market';
  featured: boolean;
  images: string[];
  amenities: string[];
  features: string[];
  virtualTourUrl?: string;
  videoUrl?: string;
  floorPlanImages?: string[];
  documents?: { name: string, url: string }[];
  agent?: number; // Agent ID
  viewCount?: number;
  priceHistory?: { date: string, price: string }[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  photo: string;
  quote: string;
  rating: number;
  property: string;
  createdAt: string;
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
  private baseUrl = '/data'; // TODO: Replace with actual API base URL

  // Authentication methods - placeholder
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    console.log('Login attempt:', email, password);
    
    // Check specific credentials
    if (email !== 'onakpoyanufuoma@gmail.com' || password !== 'MRDGN123!@#') {
      throw new Error('Invalid email or password');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Successful login with specific credentials
    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 1,
        name: 'Admin User',
        email: email,
        role: 'Admin',
        status: 'Active',
        avatar: '/placeholder.svg',
        department: 'Management',
        joinDate: '2023-01-01',
        lastLogin: new Date().toISOString(),
        twoFactorEnabled: false,
        phoneNumber: '+2348012345678',
        position: 'Managing Director',
        bio: 'Experienced real estate professional with over 10 years in luxury properties.',
        commissionRate: 5,
        totalSales: 24,
        totalRevenue: 450000000,
        permissions: ['full_access', 'user_management', 'property_management', 'testimonial_management', 'settings']
      }
    };
  }

  async logout(): Promise<void> {
    // TODO: Implement real logout (invalidate token)
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  async verifyToken(token: string): Promise<boolean> {
    // TODO: Implement real token verification
    return token && token.startsWith('mock-jwt-token');
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const properties = await this.getProperties();
    const testimonials = await this.getTestimonials();

    // Calculate real revenue from sold properties
    const soldProperties = properties.filter(p => p.status === 'Sold');
    const totalRevenue = soldProperties.reduce((sum, prop) => {
      const price = parseFloat(prop.price.replace(/[^\d]/g, ''));
      return sum + price;
    }, 0);
    
    const monthlyRevenue = `₦${(totalRevenue / 1000000).toFixed(1)}M`;

    return {
      totalProperties: properties.length,
      pendingInquiries: 0, // Removed - not needed
      totalTestimonials: testimonials.length,
      adminUser: 0, // Removed - not needed
      propertiesSold: soldProperties.length,
      monthlyRevenue
    };
  }

  // Property methods
  async getProperties(): Promise<Property[]> {
    // TODO: Replace with real API call with authentication headers
    const response = await fetch('/data/properties.json');
    return response.json();
  }

  async getProperty(id: number): Promise<Property> {
    const properties = await this.getProperties();
    const property = properties.find(p => p.id === id);
    if (!property) throw new Error('Property not found');
    return property;
  }

  async createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    // TODO: Replace with real API call
    const now = new Date().toISOString().split('T')[0];
    const newProperty: Property = {
      ...property,
      id: Date.now(),
      createdAt: now,
      updatedAt: now
    };
    
    console.log('Creating property:', newProperty);
    return newProperty;
  }

  async updateProperty(id: number, updates: Partial<Property>): Promise<Property> {
    // TODO: Replace with real API call
    const property = await this.getProperty(id);
    const updatedProperty: Property = {
      ...property,
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    console.log('Updating property:', updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<void> {
    // TODO: Replace with real API call
    console.log('Deleting property:', id);
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    // TODO: Replace with real API call
    const response = await fetch('/data/testimonials.json');
    return response.json();
  }

  async getTestimonial(id: number): Promise<Testimonial> {
    const testimonials = await this.getTestimonials();
    const testimonial = testimonials.find(t => t.id === id);
    if (!testimonial) throw new Error('Testimonial not found');
    return testimonial;
  }

  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt'>): Promise<Testimonial> {
    // TODO: Replace with real API call
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    console.log('Creating testimonial:', newTestimonial);
    return newTestimonial;
  }

  async updateTestimonial(id: number, updates: Partial<Testimonial>): Promise<Testimonial> {
    // TODO: Replace with real API call
    const testimonial = await this.getTestimonial(id);
    const updatedTestimonial: Testimonial = {
      ...testimonial,
      ...updates
    };
    
    console.log('Updating testimonial:', updatedTestimonial);
    return updatedTestimonial;
  }

  async deleteTestimonial(id: number): Promise<void> {
    // TODO: Replace with real API call
    console.log('Deleting testimonial:', id);
  }

  // User methods
  async getUsers(): Promise<User[]> {
    // TODO: Replace with real API call
    const response = await fetch('/data/users.json');
    return response.json();
  }

  async getUser(id: number): Promise<User> {
    const users = await this.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async createUser(user: Omit<User, 'id' | 'joinDate' | 'lastLogin'>): Promise<User> {
    // TODO: Replace with real API call
    const newUser: User = {
      ...user,
      id: Date.now(),
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString()
    };
    
    console.log('Creating user:', newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    // TODO: Replace with real API call
    const user = await this.getUser(id);
    const updatedUser: User = {
      ...user,
      ...updates
    };
    
    console.log('Updating user:', updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    // TODO: Replace with real API call
    console.log('Deleting user:', id);
  }

  // Settings methods
  async getSettings(): Promise<Record<string, any>> {
    // TODO: Replace with real API call
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
    // TODO: Replace with real API call
    console.log('Updating settings:', settings);
    return settings;
  }
}

export const adminAPI = new AdminAPI();
export type { Property, Testimonial, User, DashboardStats };