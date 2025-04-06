
import React from 'react';
import { useAdmin } from '../contexts/AdminContext';

const GlobalCSS: React.FC = () => {
  const { settings } = useAdmin();

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      :root {
        --primary-color: ${settings.primaryColor || '#9b87f5'};
        --secondary-color: ${settings.secondaryColor || '#7E69AB'};
        --accent-color: ${settings.accentColor || '#6E59A5'};
        --sidebar-background: ${settings.sidebarBackgroundColor || '#1a1f2c'};
      }
      
      ${settings.customCSS || ''}
    `}} />
  );
};

export default GlobalCSS;
