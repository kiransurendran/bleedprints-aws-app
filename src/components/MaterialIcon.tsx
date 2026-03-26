import React from 'react';

interface MaterialIconProps {
  icon: string;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({ icon, filled = false, className = '', style }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      ...style,
    }}
  >
    {icon}
  </span>
);

export default MaterialIcon;
