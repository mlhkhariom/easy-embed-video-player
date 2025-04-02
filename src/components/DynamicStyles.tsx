
import { useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const DynamicStyles = () => {
  const { settings } = useAdmin();

  useEffect(() => {
    // Create style element for custom CSS
    const style = document.createElement('style');
    style.id = 'admin-custom-styles';
    style.innerHTML = `
      :root {
        --primary: ${settings.primaryColor};
        --moviemate-primary: ${settings.primaryColor};
        --secondary: ${settings.secondaryColor || '#7E69AB'};
        --accent: ${settings.accentColor || '#6E59A5'};
        --sidebar-background: ${settings.sidebarBackgroundColor || '#1a1f2c'};
      }
      
      /* Customize button and link hover states */
      .btn-primary, .btn-primary-hover:hover {
        background-color: ${settings.primaryColor};
        color: white;
        transform: translateY(0);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .btn-primary:hover, .btn-primary-hover:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px ${settings.primaryColor}50;
      }
      
      .btn-primary:active, .btn-primary-hover:active {
        transform: translateY(0);
      }
      
      /* Apply custom theme colors */
      .theme-border {
        border-color: ${settings.primaryColor}40; /* 40 is for 25% opacity */
      }
      
      /* Enhanced 3D card styles */
      .theme-card {
        background-color: rgba(26, 31, 44, 0.8);
        backdrop-filter: blur(12px);
        border: 1px solid ${settings.primaryColor}20;
        box-shadow: 0 4px 20px ${settings.primaryColor}10;
        transform: translateZ(0);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .theme-card:hover {
        transform: translateY(-5px) translateZ(5px);
        box-shadow: 0 8px 30px ${settings.primaryColor}30;
      }
      
      /* 3D buttons */
      .button-3d {
        position: relative;
        background: linear-gradient(to bottom, ${settings.primaryColor}, ${settings.primaryColor}dd);
        border-radius: 8px;
        box-shadow: 0 4px 0 ${settings.primaryColor}80, 0 8px 16px rgba(0, 0, 0, 0.2);
        transform: translateY(0);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      
      .button-3d:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 0 ${settings.primaryColor}80, 0 12px 20px rgba(0, 0, 0, 0.25);
      }
      
      .button-3d:active {
        transform: translateY(2px);
        box-shadow: 0 2px 0 ${settings.primaryColor}80, 0 4px 8px rgba(0, 0, 0, 0.2);
      }
      
      /* Neumorphic elements */
      .neumorphic {
        background: #1a1f2c;
        border-radius: 15px;
        box-shadow: 
          8px 8px 16px rgba(0, 0, 0, 0.4),
          -8px -8px 16px rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
      }
      
      .neumorphic:hover {
        box-shadow: 
          6px 6px 10px rgba(0, 0, 0, 0.4),
          -6px -6px 10px rgba(255, 255, 255, 0.05),
          inset 2px 2px 5px rgba(0, 0, 0, 0.05),
          inset -2px -2px 5px rgba(255, 255, 255, 0.05);
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(26, 31, 44, 0.8);
      }
      
      ::-webkit-scrollbar-thumb {
        background-color: ${settings.primaryColor}50;
        border-radius: 10px;
        transition: background-color 0.3s ease;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background-color: ${settings.primaryColor};
      }
      
      /* 3D text effects */
      .text-3d {
        color: white;
        text-shadow: 
          0 2px 0 rgba(0, 0, 0, 0.3),
          0 4px 10px rgba(0, 0, 0, 0.2);
      }
      
      .text-gradient {
        background: linear-gradient(120deg, ${settings.primaryColor}, ${settings.secondaryColor || '#7E69AB'});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      /* Glassmorphism */
      .glass-card {
        background: rgba(26, 31, 44, 0.6);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }
      
      /* Button hover effects */
      .btn-glow:hover {
        box-shadow: 0 0 15px ${settings.primaryColor};
      }
      
      /* Image hover effects */
      .img-hover-zoom {
        overflow: hidden;
      }
      
      .img-hover-zoom img {
        transition: transform 0.5s ease;
      }
      
      .img-hover-zoom:hover img {
        transform: scale(1.1);
      }
      
      ${settings.customCSS || ''}
    `;
    
    // Add or replace the style element
    const existingStyle = document.getElementById('admin-custom-styles');
    if (existingStyle) {
      existingStyle.innerHTML = style.innerHTML;
    } else {
      document.head.appendChild(style);
    }
    
    return () => {
      // Cleanup
      const styleElement = document.getElementById('admin-custom-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [settings.primaryColor, settings.secondaryColor, settings.accentColor, settings.sidebarBackgroundColor, settings.customCSS]);

  return null;
};

export default DynamicStyles;
