
import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const { settings } = useAdmin();
  const siteName = settings?.siteName || 'FreeCinema';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-moviemate-background border-t border-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Site Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">{siteName}</h3>
            <p className="text-gray-400 mb-4">
              {settings?.siteDescription || 'Watch movies and TV shows online for free'}
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
              <li><Link to="/movies" className="text-gray-400 hover:text-white transition">Movies</Link></li>
              <li><Link to="/tv-serials" className="text-gray-400 hover:text-white transition">TV Shows</Link></li>
              <li><Link to="/trending" className="text-gray-400 hover:text-white transition">Trending</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/dmca" className="text-gray-400 hover:text-white transition">DMCA</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-400">
          <p className="flex items-center justify-center">
            Made with <Heart className="h-4 w-4 mx-1 text-red-500" fill="currentColor" /> by MovieMate
          </p>
          <p className="mt-2">
            &copy; {currentYear} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
