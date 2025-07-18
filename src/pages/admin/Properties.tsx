import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { propertiesService, Property } from '@/lib/properties-service';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Building2, MapPin, Bed, Bath, Square, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    area: '',
    type: '',
    status: 'available' as 'available' | 'sold' | 'pending',
    featured: false,
    images: [''],
    amenities: [] as string[],
    features: [] as string[],
    virtualTourUrl: '',
    videoUrl: '',
    floorPlanImages: [] as string[]
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await propertiesService.getProperties();
      // Sort properties alphabetically by title
      const sortedData = data.sort((a, b) => a.title.localeCompare(b.title));
      setProperties(sortedData);
    } catch (error) {
      console.error('Failed to load properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      location: '',
      bedrooms: 0,
      bathrooms: 0,
      area: '',
      type: '',
      status: 'available' as 'available' | 'sold' | 'pending',
      featured: false,
      images: [''],
      amenities: [] as string[],
      features: [] as string[],
      virtualTourUrl: '',
      videoUrl: '',
      floorPlanImages: [] as string[]
    });
    setEditingProperty(null);
    setUploadedImages([]);
  };

  const openModal = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        title: property.title,
        description: property.description || '',
        price: property.price.toString(),
        location: property.location,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        area: property.area || '',
        type: property.type || '',
        status: property.status,
        featured: property.featured || false,
        images: property.images.length > 0 ? property.images : [''],
        amenities: property.amenities || [],
        features: property.features || [],
        virtualTourUrl: property.virtualTourUrl || '',
        videoUrl: property.videoUrl || '',
        floorPlanImages: property.floorPlanImages || []
      });
      setUploadedImages(property.images || []);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        newImages.push(publicUrl);
      }

      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      setFormData({ ...formData, images: updatedImages });

      toast({
        title: "Success",
        description: `${newImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    setFormData({ ...formData, images: updatedImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const propertyData = {
        ...formData,
        images: uploadedImages.filter(img => img.trim() !== '')
      };

      if (editingProperty) {
        await propertiesService.updateProperty(editingProperty.id, propertyData);
        toast({
          title: "Success",
          description: "Property updated successfully",
        });
      } else {
        await propertiesService.createProperty(propertyData);
        toast({
          title: "Success",
          description: "Property created successfully",
        });
      }

      setIsModalOpen(false);
      resetForm();
      await loadProperties();
    } catch (error) {
      console.error('Failed to save property:', error);
      toast({
        title: "Error",
        description: "Failed to save property",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await propertiesService.deleteProperty(id);
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      await loadProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Scroll to top when component mounts or properties change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Properties Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your luxury property listings
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openModal()} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Property</span>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Luxury Penthouse Victoria Island"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Stunning property with panoramic views..."
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="₦850,000,000"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Victoria Island, Lagos"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="350 sqm"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Property Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Duplex">Duplex</SelectItem>
                      <SelectItem value="Mansion">Mansion</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: 'available' | 'sold' | 'pending') => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="pending">Under Contract</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label>Property Images</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> property images
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 50MB each</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Property ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isUploading && (
                      <p className="text-sm text-muted-foreground">Uploading images...</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-border"
                  />
                  <Label htmlFor="featured">Featured Property</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {editingProperty ? 'Update Property' : 'Create Property'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
            
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif font-semibold text-lg truncate">
                  {property.title}
                </h3>
                {property.featured && (
                  <Badge variant="default" className="ml-2">Featured</Badge>
                )}
              </div>
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {property.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
                    {property.area}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg text-primary">₦{property.price.toLocaleString()}</p>
                  <Badge variant={property.status === 'available' ? 'default' : property.status === 'sold' ? 'secondary' : 'outline'}>
                    {property.status === 'available' ? 'Available' : property.status === 'sold' ? 'Sold' : 'Under Contract'}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openModal(property)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(property.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No properties found. Add your first property to get started.</p>
        </div>
      )}
    </div>
  );
}