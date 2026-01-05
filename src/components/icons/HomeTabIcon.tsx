import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HomeTabIconProps {
  size?: number;
  color?: string;
}

export const HomeTabIcon: React.FC<HomeTabIconProps> = ({ 
  size = 24, 
  color = '#3B2B20' 
}) => {
  const scale = size / 48;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path 
        d="M4 24.408C4 19.83 4 17.542 5.04 15.646C6.076 13.748 7.974 12.572 11.768 10.216L15.768 7.734C19.778 5.244 21.784 4 24 4C26.216 4 28.22 5.244 32.232 7.734L36.232 10.216C40.026 12.572 41.924 13.748 42.962 15.646C44 17.544 44 19.83 44 24.406V27.45C44 35.25 44 39.152 41.656 41.576C39.312 44 35.542 44 28 44H20C12.458 44 8.686 44 6.344 41.576C4.002 39.152 4 35.252 4 27.45V24.408Z" 
        stroke={color}
        strokeWidth="3"
      />
      <Path 
        d="M24 30V36" 
        stroke={color}
        strokeWidth="3" 
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default HomeTabIcon;
