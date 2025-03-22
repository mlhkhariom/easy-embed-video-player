
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
  }, [settings.primaryColor, settings.customCSS]);

  return null;
};

export default DynamicStyles;
