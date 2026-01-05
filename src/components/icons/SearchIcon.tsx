import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SearchIconProps {
  size?: number;
  color?: string;
}

export const SearchIcon: React.FC<SearchIconProps> = ({ 
  size = 24, 
  color = '#3B2B20' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path 
        d="M30 30L38 38M2 18C2 22.2435 3.68571 26.3131 6.68629 29.3137C9.68687 32.3143 13.7565 34 18 34C22.2435 34 26.3131 32.3143 29.3137 29.3137C32.3143 26.3131 34 22.2435 34 18C34 13.7565 32.3143 9.68687 29.3137 6.68629C26.3131 3.68571 22.2435 2 18 2C13.7565 2 9.68687 3.68571 6.68629 6.68629C3.68571 9.68687 2 13.7565 2 18Z" 
        stroke={color} 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SearchIcon;
