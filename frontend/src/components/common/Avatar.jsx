import React from 'react';

// The base Face SVG template used for all procedurally generated avatars
const FaceSVG = ({ bg, skin, hair, eyes, mouth, accessory }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Background */}
    <rect width="100" height="100" fill={bg} />
    
    {/* Back Hair (if any) */}
    {hair?.back}
    
    {/* Head/Face Base */}
    <path 
      d="M 25 50 Q 25 85 50 85 Q 75 85 75 50 Q 75 20 50 20 Q 25 20 25 50 Z" 
      fill={skin} 
    />
    
    {/* Front Hair */}
    {hair?.front}
    
    {/* Eyes */}
    {eyes}
    
    {/* Mouth */}
    {mouth}
    
    {/* Accessory (clothing, glasses, headphones, etc) */}
    {accessory}
  </svg>
);

export const predefinedAvatars = [
  {
    id: 'avatar_1',
    // Stylish Male (Sunglasses)
    svg: (
      <FaceSVG 
        bg="#FFEBEE" skin="#F5CBA7"
        hair={{
          back: null,
          front: <path d="M 15 50 Q 50 10 85 50 Q 50 20 15 50" fill="#2C3E50" />
        }}
        eyes={<g><rect x="30" y="45" width="40" height="12" rx="2" fill="#1a202c"/><path d="M 25 50 L 30 50 M 70 50 L 75 50" stroke="#1a202c" strokeWidth="2"/></g>}
        mouth={<path d="M 45 70 Q 50 75 55 70" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>}
        
      />
    )
  },
  {
    id: 'avatar_2',
    // Stylish Female (Sunglasses)
    svg: (
      <FaceSVG 
        bg="#E3F2FD" skin="#FAD7A1"
        hair={{
          back: <path d="M 20 50 Q 20 80 30 100 L 70 100 Q 80 80 80 50 Z" fill="#4A2311"/>,
          front: <path d="M 15 55 Q 50 10 85 55 Q 50 30 15 55" fill="#4A2311" />
        }}
        eyes={<g><path d="M 28 42 Q 50 50 72 42 L 68 55 Q 50 60 32 55 Z" fill="#1a202c"/><path d="M 25 45 L 28 42 M 72 42 L 75 45" stroke="#1a202c" strokeWidth="2"/></g>}
        mouth={<path d="M 42 72 Q 50 70 58 72 Q 50 78 42 72 Z" fill="#D81B60"/>}
        
      />
    )
  },
  {
    id: 'avatar_3',
    // Professional Male
    svg: (
      <FaceSVG 
        bg="#E8F5E9" skin="#E5C298"
        hair={{
          back: null,
          front: <path d="M 20 50 Q 50 20 80 50 Z" fill="#1A202C" />
        }}
        eyes={<g><circle cx="38" cy="50" r="3" fill="#1a202c"/><circle cx="62" cy="50" r="3" fill="#1a202c"/></g>}
        mouth={<path d="M 45 72 L 55 72" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>}
        accessory={<g><path d="M 20 100 L 45 75 L 55 75 L 80 100 Z" fill="#2C3E50"/><path d="M 45 75 L 50 85 L 55 75 Z" fill="#ECF0F1"/><path d="M 48 80 L 52 80 L 50 95 Z" fill="#E74C3C"/></g>}
      />
    )
  },
  {
    id: 'avatar_4',
    // Professional Female
    svg: (
      <FaceSVG 
        bg="#F3E5F5" skin="#FFDDBB"
        hair={{
          back: <path d="M 25 45 Q 50 0 75 45 Z" fill="#2C3E50" />,
          front: <path d="M 20 50 Q 50 30 80 50 Z" fill="#2C3E50" />
        }}
        eyes={<g><circle cx="38" cy="52" r="3.5" fill="#1a202c"/><circle cx="62" cy="52" r="3.5" fill="#1a202c"/><path d="M 32 46 Q 38 42 44 46" fill="none" stroke="#2C3E50" strokeWidth="1.5"/><path d="M 56 46 Q 62 42 68 46" fill="none" stroke="#2C3E50" strokeWidth="1.5"/></g>}
        mouth={<path d="M 42 70 Q 50 76 58 70" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>}
        accessory={<path d="M 25 100 Q 50 70 75 100 Z" fill="#8E44AD" />}
      />
    )
  },
  {
    id: 'avatar_5',
    // Developer / Tech
    svg: (
      <FaceSVG 
        bg="#FFF3E0" skin="#F5CBA7"
        hair={{
          back: null,
          front: <path d="M 15 55 Q 50 15 85 55 Q 50 40 15 55" fill="#8E44AD" />
        }}
        eyes={<g><circle cx="38" cy="50" r="3" fill="#1a202c"/><circle cx="62" cy="50" r="3" fill="#1a202c"/></g>}
        mouth={<path d="M 45 70 Q 50 72 55 70" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>}
        accessory={<g><path d="M 25 50 A 25 25 0 0 1 75 50" fill="none" stroke="#2C3E50" strokeWidth="4"/><rect x="20" y="45" width="10" height="15" rx="3" fill="#2C3E50"/><rect x="70" y="45" width="10" height="15" rx="3" fill="#2C3E50"/></g>}
      />
    )
  },
  {
    id: 'avatar_6',
    // Smart / Glasses
    svg: (
      <FaceSVG 
        bg="#E0F7FA" skin="#FAD7A1"
        hair={{
          back: null,
          front: <path d="M 20 48 Q 50 25 80 48 Q 50 35 20 48" fill="#D35400" />
        }}
        eyes={<g><circle cx="38" cy="52" r="3" fill="#1a202c"/><circle cx="62" cy="52" r="3" fill="#1a202c"/></g>}
        mouth={<path d="M 42 72 Q 50 70 58 72" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>}
        accessory={<g><rect x="30" y="46" width="16" height="12" rx="2" fill="none" stroke="#1a202c" strokeWidth="2"/><rect x="54" y="46" width="16" height="12" rx="2" fill="none" stroke="#1a202c" strokeWidth="2"/><line x1="46" y1="52" x2="54" y2="52" stroke="#1a202c" strokeWidth="2"/></g>}
      />
    )
  },
  {
    id: 'avatar_7',
    // Casual
    svg: (
      <FaceSVG 
        bg="#FCE4EC" skin="#FFDDBB"
        hair={{
          back: <path d="M 15 60 Q 50 0 85 60 Z" fill="#F39C12"/>,
          front: <path d="M 20 50 Q 50 30 80 50" fill="#F39C12" />
        }}
        eyes={<g><circle cx="38" cy="52" r="3" fill="#1a202c"/><circle cx="62" cy="52" r="3" fill="#1a202c"/></g>}
        mouth={<path d="M 40 70 Q 50 78 60 70" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>}
        accessory={<path d="M 20 100 Q 50 75 80 100 Z" fill="#3498DB" />}
      />
    )
  },
  {
    id: 'avatar_8',
    // Sporty
    svg: (
      <FaceSVG 
        bg="#FFF8E1" skin="#8D5524"
        hair={{
          back: null,
          front: <path d="M 15 50 Q 50 20 85 50 Z" fill="#1A202C" />
        }}
        eyes={<g><circle cx="38" cy="52" r="3.5" fill="#1a202c"/><circle cx="62" cy="52" r="3.5" fill="#1a202c"/></g>}
        mouth={<path d="M 42 72 L 58 72" fill="none" stroke="#1a202c" strokeWidth="2.5" strokeLinecap="round"/>}
        accessory={<g><path d="M 25 45 Q 50 20 75 45 Z" fill="#E74C3C"/><rect x="45" y="38" width="10" height="4" fill="#FFFFFF"/></g>}
      />
    )
  },
  {
    id: 'avatar_9',
    // Creative
    svg: (
      <FaceSVG 
        bg="#F3E5F5" skin="#E5C298"
        hair={{
          back: <path d="M 10 50 Q 50 0 90 50 Q 80 90 50 90 Q 20 90 10 50 Z" fill="#E83E8C" opacity="0.8"/>,
          front: <path d="M 15 50 Q 50 20 85 50" fill="#E83E8C" />
        }}
        eyes={<g><path d="M 32 50 Q 38 45 44 50" fill="none" stroke="#1a202c" strokeWidth="2"/><path d="M 56 50 Q 62 45 68 50" fill="none" stroke="#1a202c" strokeWidth="2"/></g>}
        mouth={<path d="M 45 70 Q 50 75 55 70" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>}
        accessory={<circle cx="30" cy="65" r="2" fill="#E83E8C"/>}
      />
    )
  },
  {
    id: 'avatar_10',
    // Gamer
    svg: (
      <FaceSVG 
        bg="#E8EAF6" skin="#FAD7A1"
        hair={{
          back: null,
          front: <path d="M 20 45 L 30 35 L 40 45 L 50 30 L 60 45 L 70 35 L 80 45 Z" fill="#27AE60" />
        }}
        eyes={<g><circle cx="38" cy="52" r="3" fill="#1a202c"/><circle cx="62" cy="52" r="3" fill="#1a202c"/></g>}
        mouth={<path d="M 42 70 Q 50 72 58 70" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>}
        accessory={<g><path d="M 20 45 A 30 30 0 0 1 80 45" fill="none" stroke="#2C3E50" strokeWidth="5"/><rect x="15" y="40" width="10" height="20" rx="4" fill="#34495E"/><rect x="75" y="40" width="10" height="20" rx="4" fill="#34495E"/><line x1="25" y1="50" x2="30" y2="55" stroke="#2C3E50" strokeWidth="3"/></g>}
      />
    )
  },
  {
    id: 'avatar_11',
    // Confident
    svg: (
      <FaceSVG 
        bg="#E0F2F1" skin="#C68642"
        hair={{
          back: null,
          front: <path d="M 25 45 Q 50 15 75 45" fill="#3E2723" />
        }}
        eyes={<g><circle cx="38" cy="52" r="3" fill="#1a202c"/><circle cx="62" cy="52" r="3" fill="#1a202c"/><path d="M 32 46 L 44 48" stroke="#1a202c" strokeWidth="1.5"/><path d="M 68 46 L 56 48" stroke="#1a202c" strokeWidth="1.5"/></g>}
        mouth={<path d="M 42 70 L 58 65" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>}
        accessory={<path d="M 25 100 Q 50 60 75 100 Z" fill="#E67E22" />}
      />
    )
  },
  {
    id: 'avatar_12',
    // Cheerful
    svg: (
      <FaceSVG 
        bg="#FFFDE7" skin="#FFDDBB"
        hair={{
          back: <path d="M 15 60 Q 20 100 50 100 Q 80 100 85 60 Z" fill="#F1C40F" opacity="0.5"/>,
          front: <path d="M 20 50 Q 50 25 80 50" fill="#F1C40F" />
        }}
        eyes={<g><path d="M 32 52 Q 38 48 44 52" fill="none" stroke="#1a202c" strokeWidth="2"/><path d="M 56 52 Q 62 48 68 52" fill="none" stroke="#1a202c" strokeWidth="2"/></g>}
        mouth={<path d="M 40 68 Q 50 82 60 68 Z" fill="#E74C3C"/>}
        
      />
    )
  },
  {
    id: 'avatar_13',
    // Minimal
    svg: (
      <FaceSVG 
        bg="#ECEFF1" skin="#E5C298"
        hair={{
          back: null,
          front: <path d="M 20 50 Q 50 35 80 50 Z" fill="#7F8C8D" />
        }}
        eyes={<g><circle cx="38" cy="52" r="2" fill="#1a202c"/><circle cx="62" cy="52" r="2" fill="#1a202c"/></g>}
        mouth={<path d="M 45 72 L 55 72" fill="none" stroke="#1a202c" strokeWidth="1.5" strokeLinecap="round"/>}
        accessory={<path d="M 30 100 Q 50 80 70 100 Z" fill="#BDC3C7" />}
      />
    )
  },
  {
    id: 'avatar_14',
    // Futuristic
    svg: (
      <FaceSVG 
        bg="#000000" skin="#F5CBA7"
        hair={{
          back: null,
          front: <path d="M 20 48 L 40 30 L 60 30 L 80 48 Z" fill="#9B59B6" />
        }}
        eyes={<g><rect x="30" y="48" width="16" height="6" fill="#00FFCC"/><rect x="54" y="48" width="16" height="6" fill="#00FFCC"/><line x1="46" y1="51" x2="54" y2="51" stroke="#00FFCC" strokeWidth="2"/></g>}
        mouth={<path d="M 42 72 L 58 72" fill="none" stroke="#00FFCC" strokeWidth="1.5" strokeLinecap="round"/>}
        accessory={<path d="M 20 100 L 35 80 L 65 80 L 80 100 Z" fill="#34495E" />}
      />
    )
  },
  {
    id: 'avatar_15',
    // Neutral / Unisex
    svg: (
      <FaceSVG 
        bg="#E8F5E9" skin="#FAD7A1"
        hair={{
          back: null,
          front: <path d="M 15 52 Q 50 25 85 52" fill="#8D6E63" />
        }}
        eyes={<g><circle cx="38" cy="52" r="3" fill="#1a202c"/><circle cx="62" cy="52" r="3" fill="#1a202c"/></g>}
        mouth={<path d="M 42 70 Q 50 74 58 70" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>}
        accessory={<path d="M 25 100 Q 50 65 75 100 Z" fill="#A5D6A7" />}
      />
    )
  },
  {
    id: 'avatar_16',
    // Cool / Beanie
    svg: (
      <FaceSVG 
        bg="#FFECB3" skin="#E5C298"
        hair={{
          back: null,
          front: <path d="M 20 50 Q 50 40 80 50" fill="#2C3E50" />
        }}
        eyes={<g><circle cx="38" cy="52" r="3" fill="#1a202c"/><circle cx="62" cy="52" r="3" fill="#1a202c"/></g>}
        mouth={<path d="M 45 70 Q 50 72 55 70" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>}
        accessory={<path d="M 15 45 Q 50 10 85 45 Z" fill="#E67E22" />}
      />
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
      fontSize: `${size * 0.4}px`,
      textTransform: 'uppercase',
      ...style
    }}>
      {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
    </div>
  );
};
