import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { adminAPI, Property, Testimonial } from '@/lib/admin-api';
import { TrendingUp, DollarSign, Home, Star } from 'lucide-react';

interface ReportsData {
  properties: Property[];
  testimonials: Testimonial[];
  propertyTypeData: Array<{ name: string; value: number; color: string }>;
  priceRangeData: Array<{ range: string; count: number }>;
  monthlyData: Array<{ month: string; properties: number; sales: number }>;
  statusData: Array<{ status: string; count: number }>;
  ratingData: Array<{ rating: number; count: number }>;
}

export default function Reports() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReportsData = async () => {
      try {
        const properties = await adminAPI.getProperties();
        const testimonials = await adminAPI.getTestimonials();

        // Process property types
        const typeCount = properties.reduce((acc, prop) => {
          acc[prop.property_type] = (acc[prop.property_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const propertyTypeData = Object.entries(typeCount).map(([name, value], index) => ({
          name,
          value,
          color: ['#D4AF37', '#8B7355', '#F4E4BC', '#A0956B'][index % 4]
        }));

        // Process price ranges
        const priceRanges = [
          { min: 0, max: 50000000, label: '₦0-50M' },
          { min: 50000000, max: 100000000, label: '₦50M-100M' },
          { min: 100000000, max: 200000000, label: '₦100M-200M' },
          { min: 200000000, max: Infinity, label: '₦200M+' }
        ];

        const priceRangeData = priceRanges.map(range => ({
          range: range.label,
          count: properties.filter(prop => {
            const price = prop.price;
            return price >= range.min && price < range.max;
          }).length
        }));

        // Mock monthly data (in real app, this would come from database)
        const monthlyData = [
          { month: 'Jan', properties: 2, sales: 1 },
          { month: 'Feb', properties: 1, sales: 0 },
          { month: 'Mar', properties: 2, sales: 1 },
          { month: 'Apr', properties: 0, sales: 0 },
          { month: 'May', properties: 0, sales: 0 },
          { month: 'Jun', properties: 0, sales: 0 }
        ];

        // Process property status
        const statusCount = properties.reduce((acc, prop) => {
          acc[prop.status] = (acc[prop.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const statusData = Object.entries(statusCount).map(([status, count]) => ({
          status,
          count
        }));

        // Process testimonial ratings
        const ratingCount = testimonials.reduce((acc, test) => {
          const rating = test.rating || 5;
          acc[rating] = (acc[rating] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        const ratingData = [1, 2, 3, 4, 5].map(rating => ({
          rating,
          count: ratingCount[rating] || 0
        }));

        setData({
          properties,
          testimonials,
          propertyTypeData,
          priceRangeData,
          monthlyData,
          statusData,
          ratingData
        });
      } catch (error) {
        console.error('Failed to load reports data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportsData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load reports data</p>
        </div>
      </div>
    );
  }

  const totalRevenue = data.properties
    .filter(p => p.status === 'sold')
    .reduce((sum, prop) => sum + prop.price, 0);

  const averageRating = data.testimonials.length > 0 
    ? (data.testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / data.testimonials.length).toFixed(1)
    : '0';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights into your property business performance.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold text-foreground">{data.properties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Properties Sold</p>
                <p className="text-2xl font-bold text-foreground">
                  {data.properties.filter(p => p.status === 'sold').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">
                  ₦{(totalRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-foreground">{averageRating}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Property Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Properties",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.propertyTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {data.propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Price Range Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Price Range Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Properties",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.priceRangeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                properties: {
                  label: "New Properties",
                  color: "hsl(var(--primary))",
                },
                sales: {
                  label: "Sales",
                  color: "hsl(142, 76%, 36%)",
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="properties" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="sales" stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Property Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Property Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Properties",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif">Customer Satisfaction Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Reviews",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" label={{ value: 'Rating (Stars)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Number of Reviews', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}