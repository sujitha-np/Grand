import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChevronLeftIconProps {
  size?: number;
  color?: string;
}

export const ChevronLeftIcon: React.FC<ChevronLeftIconProps> = ({
  size = 24,
  color = '#3B2B20',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M30.1802 8.15984L17.1402 21.1998C15.6002 22.7398 15.6002 25.2598 17.1402 26.7998L30.1802 39.8398"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ChevronLeftIcon;
