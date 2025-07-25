import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  MessageSquareText, 
  Users, 
  Settings, 
  LogOut,
  Crown
} from 'lucide-react';

const navigation = [
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminNavbar() {
  const location = useLocation();
  const { user, adminUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/d7dc5cc8-9f13-460e-9a16-e8567e5fc867.png" 
                alt="Mansa Luxe Realty Logo" 
                className="h-8 w-auto sm:h-10"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs text-orange-300">
                  Admin Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-900/30 text-orange-300'
                      : 'text-orange-200 hover:text-orange-300 hover:bg-orange-900/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && adminUser && (
              <div className="hidden sm:flex items-center space-x-2 text-orange-200">
                <span className="text-xs sm:text-sm truncate max-w-32">{adminUser.name || user.email}</span>
                <span className="text-xs bg-orange-900/30 text-orange-300 px-2 py-1 rounded whitespace-nowrap">
                  {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            )}
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-orange-200 hover:text-orange-300 hover:bg-orange-900/20 px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-800">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-900/30 text-orange-300'
                    : 'text-orange-200 hover:text-orange-300 hover:bg-orange-900/20'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}