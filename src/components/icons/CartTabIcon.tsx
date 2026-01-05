import React from 'react';
import Svg, { G, Mask, Path, Defs, ClipPath, Rect } from 'react-native-svg';

interface CartTabIconProps {
  size?: number;
  color?: string;
}

export const CartTabIcon: React.FC<CartTabIconProps> = ({ 
  size = 24, 
  color = '#3B2B20' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <G clipPath="url(#clip0_506_655)">
        <Mask 
          id="mask0_506_655" 
          maskUnits="userSpaceOnUse" 
          x="0" 
          y="0" 
          width="48" 
          height="48"
        >
          <Path d="M48 0H0V48H48V0Z" fill="white"/>
        </Mask>
        <G mask="url(#mask0_506_655)">
          <Path 
            d="M14 14.5216V12.3776C14 7.40458 18.0222 2.51994 23.0222 2.05579C28.9778 1.48113 34 6.14474 34 11.9577V15.0078" 
            stroke={color}
            strokeWidth="3" 
            strokeMiterlimit="10" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <Path 
            d="M17.4864 46.0078H30.5137C39.242 46.0078 40.8053 42.4428 41.2613 38.1028L42.8897 24.8171C43.4759 19.4142 41.9561 15.0078 32.6849 15.0078H15.3151C6.04394 15.0078 4.52407 19.4142 5.11031 24.8171L6.73873 38.1028C7.19469 42.4428 8.75798 46.0078 17.4864 46.0078Z" 
            stroke={color}
            strokeWidth="3" 
            strokeMiterlimit="10" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <Path 
            d="M32 23H32.0001" 
            stroke={color}
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <Path 
            d="M16 23H16.0001" 
            stroke={color}
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_506_655">
          <Rect width="48" height="48" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default CartTabIcon;
