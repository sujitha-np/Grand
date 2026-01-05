import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface UserAvatarIconProps {
  size?: number;
}

export const UserAvatarIcon: React.FC<UserAvatarIconProps> = ({ size = 96 }) => {
  const scale = size / 96;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <Rect width="96" height="96" rx="44" fill="#F3E7D3" />
      <Path
        d="M32 60C32 57.8783 32.8429 55.8434 34.3431 54.3431C35.8434 52.8429 37.8783 52 40 52H56C58.1217 52 60.1566 52.8429 61.6569 54.3431C63.1571 55.8434 64 57.8783 64 60C64 61.0609 63.5786 62.0783 62.8284 62.8284C62.0783 63.5786 61.0609 64 60 64H36C34.9391 64 33.9217 63.5786 33.1716 62.8284C32.4214 62.0783 32 61.0609 32 60Z"
        stroke="#3B2B20"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <Path
        d="M48 44C51.3137 44 54 41.3137 54 38C54 34.6863 51.3137 32 48 32C44.6863 32 42 34.6863 42 38C42 41.3137 44.6863 44 48 44Z"
        stroke="#3B2B20"
        strokeWidth="3"
      />
    </Svg>
  );
};
