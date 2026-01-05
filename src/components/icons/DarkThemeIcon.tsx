import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface DarkThemeIconProps {
  size?: number;
  color?: string;
}

export const DarkThemeIcon: React.FC<DarkThemeIconProps> = ({
  size = 40,
  color = '#3B2B20',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path 
        d="M20 40C31.046 40 40 31.046 40 20C40 8.954 31.046 0 20 0C8.954 0 0 8.954 0 20C0 31.046 8.954 40 20 40ZM20 37V3C24.5087 3 28.8327 4.79107 32.0208 7.97919C35.2089 11.1673 37 15.4913 37 20C37 24.5087 35.2089 28.8327 32.0208 32.0208C28.8327 35.2089 24.5087 37 20 37Z" 
        fill={color}
      />
    </Svg>
  );
};
