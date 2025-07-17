import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI, DashboardStats } from '@/lib/admin-api';
import { Building2, MessageSquareText, Users, TrendingUp, DollarSign, Home } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        // TODO: Add error handling and retry logic
        const dashboardStats = await adminAPI.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // TODO: Show error toast or notification
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: Building2,
      description: 'Active listings',
      color: 'text-blue-500'
    },
    {
      title: 'Properties Sold',
      value: stats.propertiesSold,
      icon: Home,
      description: 'Completed transactions',
      color: 'text-green-500'
    },
    {
      title: 'Pending Inquiries',
      value: stats.pendingInquiries,
      icon: TrendingUp,
      description: 'Awaiting response',
      color: 'text-orange-500'
    },
    {
      title: 'Total Testimonials',
      value: stats.totalTestimonials,
      icon: MessageSquareText,
      description: 'Client reviews',
      color: 'text-purple-500'
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers,
      icon: Users,
      description: 'Active staff',
      color: 'text-indigo-500'
    },
    {
      title: 'Monthly Revenue',
      value: stats.monthlyRevenue,
      icon: DollarSign,
      description: 'Current month',
      color: 'text-primary',
      isSpecial: true
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome to MansaLuxeRealty Admin Panel. Here's an overview of your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`transition-all hover:shadow-lg ${card.isSpecial ? 'border-primary/50 bg-gradient-to-br from-card to-primary/5' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.isSpecial ? 'text-primary' : 'text-foreground'}`}>
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* TODO: Replace with real recent activity data */}
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">New property added: Luxury Penthouse Victoria Island</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Property sold: Executive Duplex Ikoyi</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">New testimonial received from Dr. Adebayo Okafor</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 text-left border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                <Building2 className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium">Add Property</p>
                <p className="text-xs text-muted-foreground">List new property</p>
              </button>
              <button className="p-4 text-left border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                <MessageSquareText className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium">Add Testimonial</p>
                <p className="text-xs text-muted-foreground">Client review</p>
              </button>
              <button className="p-4 text-left border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                <Users className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium">Manage Users</p>
                <p className="text-xs text-muted-foreground">Staff accounts</p>
              </button>
              <button className="p-4 text-left border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                <TrendingUp className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium">View Reports</p>
                <p className="text-xs text-muted-foreground">Analytics</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}