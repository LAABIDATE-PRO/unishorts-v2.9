import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-8 px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Film className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">UniShorts</span>
            </Link>
            <p className="text-muted-foreground">
              The stage for the next generation of storytellers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link to="/explore" className="text-muted-foreground hover:text-primary">Explore</Link></li>
                <li><Link to="/upload" className="text-muted-foreground hover:text-primary">Submit Film</Link></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-primary">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {/* Add social media icons here if needed */}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} UniShorts. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;