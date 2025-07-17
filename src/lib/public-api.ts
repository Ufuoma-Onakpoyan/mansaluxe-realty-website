// Public API endpoints for main website integration
// These endpoints serve data from the admin panel to the public website

export interface PublicProperty {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  type: string;
  status: 'Available' | 'Under Contract' | 'Sold';
  featured: boolean;
  images: string[];
  amenities?: string[];
  features?: string[];
  virtualTourUrl?: string;
  videoUrl?: string;
}

export interface PublicTestimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  photo: string;
  quote: string;
  rating: number;
  property: string;
}

class PublicAPI {
  private baseUrl = window.location.origin;

  // Get all published properties (only Available and Under Contract)
  async getPublishedProperties(): Promise<PublicProperty[]> {
    try {
      const response = await fetch(`${this.baseUrl}/data/properties.json`);
      const allProperties = await response.json();
      
      // Filter to only show published properties (not sold or off-market)
      return allProperties
        .filter((property: any) => 
          property.status === 'Available' || property.status === 'Under Contract'
        )
        .map((property: any) => ({
          id: property.id,
          title: property.title,
          description: property.description,
          price: property.price,
          location: property.location,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          type: property.type,
          status: property.status,
          featured: property.featured,
          images: property.images,
          amenities: property.amenities || [],
          features: property.features || [],
          virtualTourUrl: property.virtualTourUrl,
          videoUrl: property.videoUrl
        }));
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  // Get featured properties only
  async getFeaturedProperties(): Promise<PublicProperty[]> {
    const properties = await this.getPublishedProperties();
    return properties.filter(property => property.featured);
  }

  // Get single property by ID
  async getProperty(id: number): Promise<PublicProperty | null> {
    try {
      const properties = await this.getPublishedProperties();
      return properties.find(property => property.id === id) || null;
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  // Get all testimonials
  async getTestimonials(): Promise<PublicTestimonial[]> {
    try {
      const response = await fetch(`${this.baseUrl}/data/testimonials.json`);
      const testimonials = await response.json();
      
      return testimonials.map((testimonial: any) => ({
        id: testimonial.id,
        name: testimonial.name,
        role: testimonial.role,
        company: testimonial.company,
        photo: testimonial.photo,
        quote: testimonial.quote,
        rating: testimonial.rating,
        property: testimonial.property
      }));
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  }

  // Get company settings/info
  async getCompanyInfo(): Promise<Record<string, any>> {
    try {
      // This would normally come from a settings API endpoint
      return {
        companyName: 'MansaLuxeRealty',
        companySubtitle: 'A subsidiary of MrDGNGroup',
        primaryColor: '#D4AF37',
        secondaryColor: '#000000',
        currency: '₦',
        contactEmail: 'info@mansaluxerealty.com',
        contactPhone: '+234-801-234-5678',
        address: 'Lagos, Nigeria',
        socialMedia: {
          instagram: '@mansaluxerealty',
          facebook: 'MansaLuxeRealty',
          twitter: '@mansaluxe'
        }
      };
    } catch (error) {
      console.error('Error fetching company info:', error);
      return {};
    }
  }

  // Search properties
  async searchProperties(filters: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    type?: string;
  }): Promise<PublicProperty[]> {
    const properties = await this.getPublishedProperties();
    
    return properties.filter(property => {
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      if (filters.bedrooms && property.bedrooms !== filters.bedrooms) {
        return false;
      }
      if (filters.type && property.type.toLowerCase() !== filters.type.toLowerCase()) {
        return false;
      }
      // Price filtering would need price conversion logic
      return true;
    });
  }
}

export const publicAPI = new PublicAPI();