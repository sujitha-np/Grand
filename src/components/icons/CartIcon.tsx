import React from 'react';
import Svg, { Rect, G, Mask, Path, Defs, ClipPath } from 'react-native-svg';

interface CartIconProps {
  size?: number;
}

export const CartIcon: React.FC<CartIconProps> = ({ size = 56 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Rect width="200" height="200" rx="60" fill="#F3E7D3"/>
      <G clipPath="url(#clip0_533_684)">
        <Mask id="mask0_533_684" maskUnits="userSpaceOnUse" x="57" y="57" width="86" height="86">
          <Path d="M143 57H57V143H143V57Z" fill="white"/>
        </Mask>
        <G mask="url(#mask0_533_684)">
          <Path opacity="0.5" d="M82.083 83.0176V79.1764C82.083 70.2664 89.2895 61.5147 98.2478 60.6831C108.918 59.6535 117.916 68.0092 117.916 78.424V83.8888" stroke="#3B2B20" strokeWidth="4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M88.3294 139.43H111.67C127.308 139.43 130.109 133.043 130.926 125.267L133.844 101.464C134.894 91.7835 132.171 83.8887 115.56 83.8887H84.4393C67.8284 83.8887 65.1053 91.7835 66.1556 101.464L69.0732 125.267C69.8902 133.043 72.6911 139.43 88.3294 139.43Z" stroke="#3B2B20" strokeWidth="4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          <Path opacity="0.6" d="M114.333 98.208H114.333" stroke="#3B2B20" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          <Path opacity="0.6" d="M85.667 98.208H85.6671" stroke="#3B2B20" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_533_684">
          <Rect width="86" height="86" fill="white" transform="translate(57 57)"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default CartIcon;
