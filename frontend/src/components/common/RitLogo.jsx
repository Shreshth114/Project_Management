import React from 'react';
import ritOfficialLogo from '../../assets/rit_official_logo.jpg';

export const RitLogo = ({ size = 'medium', light = false, showText = true }) => {
  // Size dimensions for exact official logo asset
  const logoHeight = size === 'small' ? 36 : size === 'large' ? 68 : 48;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <img 
        src={ritOfficialLogo} 
        alt="Ramaiah Institute of Technology Logo" 
        style={{ 
          height: `${logoHeight}px`, 
          width: 'auto',
          objectFit: 'contain',
          backgroundColor: light ? '#FFFFFF' : 'transparent',
          padding: light ? '3px 8px' : '0',
          borderRadius: light ? '4px' : '0',
          boxShadow: light ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
        }} 
      />
    </div>
  );
};
