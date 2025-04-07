
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
        
        /* Enhanced CSS Variables */
        --primary-light: ${settings.primaryColor}20;
        --primary-medium: ${settings.primaryColor}40;
        --primary-dark: ${settings.primaryColor}80;
        --text-shadow-primary: 0 0 8px ${settings.primaryColor}60;
        --glow-primary: 0 0 15px ${settings.primaryColor}40;
        --gradient-primary: linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor || '#7E69AB'});
        --card-bg: rgba(26, 31, 44, 0.8);
        --card-border: ${settings.primaryColor}20;
        --card-shadow: 0 4px 20px ${settings.primaryColor}10;
      }
      
      /* Base styles */
      .btn-primary, .btn-primary-hover:hover {
        background-color: ${settings.primaryColor};
        color: white;
        transition: all 0.3s ease;
      }
      
      .btn-primary:hover {
        box-shadow: 0 0 12px ${settings.primaryColor}80;
        transform: translateY(-2px);
      }
      
      /* Theme borders and cards */
      .theme-border {
        border-color: ${settings.primaryColor}40;
      }
      
      .theme-card {
        background-color: var(--card-bg);
        backdrop-filter: blur(12px);
        border: 1px solid var(--card-border);
        box-shadow: var(--card-shadow);
        transition: all 0.3s ease;
      }
      
      .theme-card:hover {
        box-shadow: 0 6px 24px ${settings.primaryColor}30;
        transform: translateY(-3px) scale(1.01);
      }
      
      /* Enhanced animations */
      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 15px 0 ${settings.primaryColor}40;
        }
        50% {
          box-shadow: 0 0 25px 5px ${settings.primaryColor}60;
        }
      }
      
      .pulse-glow {
        animation: pulse-glow 2s infinite;
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      
      .float {
        animation: float 5s ease-in-out infinite;
      }
      
      /* Text effects */
      .text-gradient {
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      
      .glow-text {
        text-shadow: var(--text-shadow-primary);
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar-thumb {
        background-color: ${settings.primaryColor}50;
        border-radius: 8px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background-color: ${settings.primaryColor};
      }
      
      ::-webkit-scrollbar-track {
        background-color: rgba(26, 31, 44, 0.4);
      }
      
      /* Player enhancements */
      .enhanced-player {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 30px -5px ${settings.primaryColor}30;
        transition: all 0.4s ease;
      }
      
      .enhanced-player:hover {
        box-shadow: 0 15px 40px -5px ${settings.primaryColor}50;
      }
      
      .player-controls-overlay {
        background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        backdrop-filter: blur(4px);
      }
      
      /* Glass morphism effects */
      .glass-card {
        background-color: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }
      
      /* Apply user's custom CSS */
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
