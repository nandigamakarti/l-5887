
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SlackLogo from './SlackLogo';

interface NavbarProps {
  isScrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isScrolled }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <SlackLogo />
          </Link>

          {/* Desktop Navigation - Reorganized */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Features Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors rounded-lg hover:bg-gray-50"
                onMouseEnter={() => setIsProductDropdownOpen(true)}
                onMouseLeave={() => setIsProductDropdownOpen(false)}
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Features</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {isProductDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2"
                    onMouseEnter={() => setIsProductDropdownOpen(true)}
                    onMouseLeave={() => setIsProductDropdownOpen(false)}
                  >
                    <Link 
                      to="#ai-agents" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      <Sparkles className="w-5 h-5 mr-3 text-purple-500" />
                      <div>
                        <div className="font-medium">AI Agents</div>
                        <div className="text-sm text-gray-500">Intelligent automation</div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pricing */}
            <Link 
              to="#pricing" 
              className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium rounded-lg hover:bg-gray-50"
            >
              Pricing
            </Link>

            {/* Resources */}
            <Link 
              to="#resources" 
              className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium rounded-lg hover:bg-gray-50"
            >
              Resources
            </Link>

            {/* Company */}
            <Link 
              to="#company" 
              className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium rounded-lg hover:bg-gray-50"
            >
              Company
            </Link>
          </div>

          {/* Auth Buttons - Repositioned */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/workspaces">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/workspaces">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-purple-600"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md"
            >
              <div className="py-4 space-y-2">
                <Link 
                  to="#features" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  Features
                </Link>
                <Link 
                  to="#pricing" 
                  className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Pricing
                </Link>
                <Link 
                  to="#resources" 
                  className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Resources
                </Link>
                <Link 
                  to="#company" 
                  className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Company
                </Link>
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <Link to="/workspaces" onClick={toggleMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-purple-600 hover:bg-purple-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/workspaces" onClick={toggleMobileMenu}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
