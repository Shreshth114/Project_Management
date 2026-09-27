import React from 'react';

export const predefinedAvatars = [
  {
    id: 'avatar_1',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#FFE5B4" />
        <circle cx="50" cy="40" r="20" fill="#8B4513" />
        <path d="M 20 100 Q 50 60 80 100" fill="#4A90E2" />
      </svg>
    )
  },
  {
    id: 'avatar_2',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#E6E6FA" />
        <circle cx="50" cy="40" r="20" fill="#333" />
        <path d="M 20 100 Q 50 60 80 100" fill="#FF69B4" />
      </svg>
    )
  },
  {
    id: 'avatar_3',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#FFF0F5" />
        <circle cx="50" cy="40" r="20" fill="#D2B48C" />
        <path d="M 20 100 Q 50 60 80 100" fill="#20B2AA" />
      </svg>
    )
  },
  {
    id: 'avatar_4',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#F0F8FF" />
        <circle cx="50" cy="40" r="20" fill="#A0522D" />
        <path d="M 20 100 Q 50 60 80 100" fill="#FF8C00" />
      </svg>
    )
  },
  {
    id: 'avatar_5',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#F5FFFA" />
        <circle cx="50" cy="40" r="20" fill="#2F4F4F" />
        <path d="M 20 100 Q 50 60 80 100" fill="#9370DB" />
      </svg>
    )
  },
  {
    id: 'avatar_6',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#FDF5E6" />
        <circle cx="50" cy="40" r="20" fill="#800000" />
        <path d="M 20 100 Q 50 60 80 100" fill="#3CB371" />
      </svg>
    )
  }
];

export const Avatar = ({ user, size = 32, style = {} }) => {
  const avatarId = user?.avatar_url;
  
  if (avatarId && avatarId.startsWith('avatar_')) {
    const avatar = predefinedAvatars.find(a => a.id === avatarId);
    if (avatar) {
      return (
        <div style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}>
          {avatar.svg}
        </div>
      );
    }
  }

  // Fallback to initials
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: 'var(--rit-orange-red)', // Use a primary color
      color: '#FFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: `${Math.max(10, size / 2.5)}px`,
      ...style
    }}>
      {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
    </div>
  );
};
