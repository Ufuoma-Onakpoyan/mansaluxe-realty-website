import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Building2, MapPin, Bed, Bath, Square, Star } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  status: string;
  images: string[];
  property_type: string;
}

interface Testimonial {
  id: string;
  name: string;
  quote: string;
  rating: number;
  role: string;
  company: string;
}

const Index = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    soldProperties: 0,
    happyClients: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .limit(6);

      // Load testimonials
      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('*')
        .limit(3);

      // Calculate stats
      const { data: allProperties } = await supabase
        .from('properties')
        .select('*');

      const { data: allTestimonials } = await supabase
        .from('testimonials')
        .select('*');

      if (propertiesData) setProperties(propertiesData);
      if (testimonialsData) setTestimonials(testimonialsData);

      if (allProperties && allTestimonials) {
        setStats({
          totalProperties: allProperties.length,
          soldProperties: allProperties.filter(p => p.status === 'sold').length,
          happyClients: allTestimonials.length,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-7xl font-serif font-bold mb-6 text-primary">
            MansaLuxeRealty
          </h1>
          <p className="text-2xl md:text-3xl text-foreground mb-8">
            Luxury Nigerian Real Estate
          </p>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover exceptional properties in Nigeria's most prestigious locations. 
            Your dream luxury home awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-8 py-4 text-lg">
              Explore Properties
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold mb-2">{stats.totalProperties}+</h3>
              <p className="text-lg opacity-90">Luxury Properties</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">{stats.soldProperties}+</h3>
              <p className="text-lg opacity-90">Properties Sold</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">{stats.happyClients}+</h3>
              <p className="text-lg opacity-90">Happy Clients</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 text-foreground">
              Featured Properties
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of the finest luxury properties
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif font-semibold text-xl">
                      {property.title}
                    </h3>
                    <Badge>{property.property_type}</Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {property.description}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {property.location}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.bedrooms}
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms}
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        {property.square_feet} sqft
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-2xl text-primary">
                      ₦{property.price.toLocaleString()}
                    </p>
                    <Button variant="outline">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              View All Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 text-foreground">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Real experiences from satisfied homeowners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < (testimonial.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} {testimonial.company && `at ${testimonial.company}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Let our experts help you discover the perfect luxury property
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-4">
              Browse Properties
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-serif text-2xl font-bold mb-4">MansaLuxeRealty</h3>
              <p className="text-background/80">
                Nigeria's premier luxury real estate company
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Properties</h4>
              <ul className="space-y-2 text-background/80">
                <li>Luxury Homes</li>
                <li>Penthouses</li>
                <li>Commercial</li>
                <li>Investment</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-background/80">
                <li>Property Management</li>
                <li>Investment Advisory</li>
                <li>Market Analysis</li>
                <li>Legal Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-background/80">
                <li>Lagos, Nigeria</li>
                <li>+234 800 000 0000</li>
                <li>info@mansaluxerealty.com</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-background/20">
            <p className="text-background/80">
              © 2024 MansaLuxeRealty. All rights reserved. | 
              <a href="/admin/login" className="ml-2 hover:underline">Admin Panel</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
