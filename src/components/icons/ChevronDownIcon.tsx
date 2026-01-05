import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChevronDownIconProps {
  size?: number;
  color?: string;
}

export const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({
  size = 24,
  color = '#3B2B20',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M39.8402 17.8198L26.8002 30.8598C25.2602 32.3998 22.7402 32.3998 21.2002 30.8598L8.16016 17.8198"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ChevronDownIcon;
