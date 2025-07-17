import React from 'react';
import { Link } from 'react-router-dom';

export function AdminFooter() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © 2024 MansaLuxeRealty - A subsidiary of MrDGNGroup. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Site
            </Link>
            <span className="text-xs text-muted-foreground">
              Admin Panel v1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}