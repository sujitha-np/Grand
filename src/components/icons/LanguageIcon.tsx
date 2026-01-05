import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LanguageIconProps {
  size?: number;
  color?: string;
}

export const LanguageIcon: React.FC<LanguageIconProps> = ({
  size = 24,
  color = '#3B2B20',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M26 38L33 20L40 38M27.75 34H38.25M6 14H20M20 14H24M20 14C20 17.26 18.414 21.852 15.522 25.31M15.522 25.31C13.58 27.64 11.042 29.45 8 30M15.522 25.31L10 20M15.522 25.31L20.4 30M15 13.636V10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
