import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChevronRightIconProps {
  size?: number;
  color?: string;
}

export const ChevronRightIcon: React.FC<ChevronRightIconProps> = ({ 
  size = 24, 
  color = '#3B2B20' 
}) => {
  const scale = size / 48;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path 
        d="M17.8198 39.8402L30.8598 26.8002C32.3998 25.2602 32.3998 22.7402 30.8598 21.2002L17.8198 8.16016" 
        stroke={color}
        strokeWidth="5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ChevronRightIcon;
