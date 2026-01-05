import React from 'react';
import Svg, { Rect, G, Mask, Path, Defs, ClipPath } from 'react-native-svg';

interface HelpIconProps {
  size?: number;
}

export const HelpIcon: React.FC<HelpIconProps> = ({ size = 96 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <Rect width="96" height="96" rx="48" fill="#F3E7D3" />
      <G clipPath="url(#clip0_430_4613)">
        <Mask
          id="mask0_430_4613"
          maskUnits="userSpaceOnUse"
          x="24"
          y="24"
          width="48"
          height="48"
        >
          <Path d="M72 24H24V72H72V24Z" fill="white" />
        </Mask>
        <G mask="url(#mask0_430_4613)">
          <Path
            d="M58 60.8594H50L41.1 66.7794C39.78 67.6594 38 66.7196 38 65.1196V60.8594C32 60.8594 28 56.8594 28 50.8594V38.8594C28 32.8594 32 28.8594 38 28.8594H58C64 28.8594 68 32.8594 68 38.8594V50.8594C68 56.8594 64 60.8594 58 60.8594Z"
            stroke="#3B2B20"
            strokeWidth="3"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M48.0007 46.7188V46.2988C48.0007 44.9388 48.8407 44.2188 49.6807 43.6388C50.5007 43.0788 51.3205 42.3588 51.3205 41.0388C51.3205 39.1988 49.8407 37.7188 48.0007 37.7188C46.1607 37.7188 44.6807 39.1988 44.6807 41.0388"
            stroke="#3B2B20"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M47.9912 51.5H48.0084"
            stroke="#3B2B20"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_430_4613">
          <Rect width="48" height="48" fill="white" x="24" y="24" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
