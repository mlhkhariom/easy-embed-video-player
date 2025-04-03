
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
      
      /* Enhanced card styles */
      .enhanced-card {
        position: relative;
        background: rgba(26, 31, 44, 0.8);
        backdrop-filter: blur(12px);
        border: 1px solid ${settings.primaryColor}20;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        transform-style: preserve-3d;
        perspective: 1000px;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .enhanced-card:hover {
        transform: translateY(-5px) translateZ(10px) rotateX(2deg);
        box-shadow: 
          0 15px 35px rgba(0, 0, 0, 0.3),
          0 0 15px ${settings.primaryColor}40;
        border-color: ${settings.primaryColor}40;
      }
      
      .enhanced-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom right, ${settings.primaryColor}10, transparent);
        border-radius: inherit;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      
      .enhanced-card:hover::before {
        opacity: 1;
      }
      
      /* Enhanced buttons */
      .enhanced-button {
        position: relative;
        background: ${settings.primaryColor};
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-weight: 500;
        overflow: hidden;
        transition: all 0.3s ease;
        outline: none;
        cursor: pointer;
      }
      
      .enhanced-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.7s ease;
      }
      
      .enhanced-button:hover::before {
        left: 100%;
      }
      
      .enhanced-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px ${settings.primaryColor}50;
      }
      
      .enhanced-button:active {
        transform: translateY(1px);
      }
      
      /* Glass morphism */
      .glass-panel {
        background: rgba(25, 30, 40, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }
      
      /* Improved scrollbar */
      ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(15, 20, 30, 0.8);
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, ${settings.primaryColor}80, ${settings.secondaryColor || '#7E69AB'}80);
        border-radius: 10px;
        border: 2px solid rgba(15, 20, 30, 0.8);
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, ${settings.primaryColor}, ${settings.secondaryColor || '#7E69AB'});
      }
      
      /* Enhanced text effects */
      .enhanced-text {
        background: linear-gradient(to right, ${settings.primaryColor}, ${settings.secondaryColor || '#7E69AB'});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      /* Enhanced player */
      .enhanced-player {
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        box-shadow: 
          0 20px 40px rgba(0, 0, 0, 0.3),
          0 0 15px ${settings.primaryColor}30;
        border: 1px solid ${settings.primaryColor}20;
        transform: translateZ(0);
      }
      
      .enhanced-player::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 12px;
        padding: 2px;
        background: linear-gradient(to bottom right, ${settings.primaryColor}60, transparent);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }
      
      .enhanced-player-controls {
        background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      }
      
      /* Page transitions */
      .page-transition-enter {
        opacity: 0;
        transform: translateY(20px);
      }
      
      .page-transition-enter-active {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 300ms, transform 300ms;
      }
      
      .page-transition-exit {
        opacity: 1;
        transform: translateY(0);
      }
      
      .page-transition-exit-active {
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 300ms, transform 300ms;
      }
      
      /* Country flag effect */
      .country-flag {
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        transition: transform 0.3s ease;
      }
      
      .country-flag:hover {
        transform: scale(1.1);
      }
      
      /* Admin panel enhancements */
      .admin-card {
        background: rgba(30, 35, 45, 0.6);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 
          0 10px 30px rgba(0, 0, 0, 0.2),
          0 0 10px ${settings.primaryColor}20;
        transition: all 0.3s ease;
      }
      
      .admin-card:hover {
        transform: translateY(-5px);
        box-shadow: 
          0 15px 35px rgba(0, 0, 0, 0.2),
          0 0 15px ${settings.primaryColor}30;
        border-color: ${settings.primaryColor}30;
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
