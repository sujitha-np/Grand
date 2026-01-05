import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CheckmarkIconProps {
  size?: number;
  color?: string;
}

export const CheckmarkIcon: React.FC<CheckmarkIconProps> = ({
  size = 24,
  color = '#7C3A00',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M10 24L18 32L38 12"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CheckmarkIcon;
