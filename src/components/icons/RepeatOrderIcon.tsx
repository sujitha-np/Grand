import React from 'react';
import Svg, { Rect, G, Mask, Path, Defs, ClipPath } from 'react-native-svg';

interface RepeatOrderIconProps {
  size?: number;
}

export const RepeatOrderIcon: React.FC<RepeatOrderIconProps> = ({ size = 56 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Rect width="200" height="200" rx="60" fill="#F3E7D3"/>
      <G clipPath="url(#clip0_533_679)">
        <Mask id="mask0_533_679" maskUnits="userSpaceOnUse" x="57" y="57" width="87" height="86">
          <Path d="M143 57H57V143H143V57Z" fill="white"/>
        </Mask>
        <G mask="url(#mask0_533_679)">
          <Path d="M107.168 67.75L115.911 76.1351L87.4235 76.0634C74.631 76.0634 64.1318 86.5626 64.1318 99.4267C64.1318 105.841 66.7476 111.682 70.976 115.91" stroke="#3B2B20" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <Path opacity="0.5" d="M92.8338 132.248L84.0903 123.863L112.578 123.935C125.37 123.935 135.87 113.436 135.87 100.571C135.87 94.1573 133.254 88.3167 129.025 84.0884" stroke="#3B2B20" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_533_679">
          <Rect width="86" height="86" fill="white" transform="translate(57 57)"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default RepeatOrderIcon;
