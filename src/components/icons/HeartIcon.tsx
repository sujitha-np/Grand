import React from 'react';
import Svg, { Mask, G, Path } from 'react-native-svg';

interface HeartIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export const HeartIcon: React.FC<HeartIconProps> = ({ 
  size = 58, 
  color = '#3B2B20',
  filled = false
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 58 58" fill="none">
      <Mask 
        id="mask0_419_3252" 
        maskUnits="userSpaceOnUse" 
        x="0" 
        y="0" 
        width="58" 
        height="58"
      >
        <Path d="M58 0H0V58H58V0Z" fill="white"/>
      </Mask>
      <G mask="url(#mask0_419_3252)">
        <Path 
          d="M30.498 50.2904C29.6763 50.5804 28.323 50.5804 27.5013 50.2904C20.493 47.8979 4.83301 37.917 4.83301 21.0004C4.83301 13.5329 10.8505 7.49121 18.2697 7.49121C22.668 7.49121 26.5588 9.61788 28.9997 12.9045C31.4405 9.61788 35.3555 7.49121 39.7297 7.49121C47.1488 7.49121 53.1663 13.5329 53.1663 21.0004C53.1663 37.917 37.5063 47.8979 30.498 50.2904Z" 
          stroke={color}
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill={filled ? color : 'none'}
        />
      </G>
    </Svg>
  );
};

export default HeartIcon;
