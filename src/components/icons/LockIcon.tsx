import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LockIconProps {
  size?: number;
  color?: string;
}

export const LockIcon: React.FC<LockIconProps> = ({
  size = 24,
  color = '#3B2B20',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 39 39" fill="none">
      <Path
        d="M8.7002 15.8997V12.2998C8.7002 6.3419 10.5002 1.5 19.5002 1.5C28.5002 1.5 30.3002 6.3419 30.3002 12.2998V15.8997"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M28.5 37.4999H10.5C3.3 37.4999 1.5 35.7 1.5 28.5001V24.9002C1.5 17.7004 3.3 15.9004 10.5 15.9004H28.5C35.7 15.9004 37.5 17.7004 37.5 24.9002V28.5001C37.5 35.7 35.7 37.4999 28.5 37.4999Z"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26.6938 26.6992H26.7099"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.4917 26.6992H19.5079"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.29 26.6992H12.3062"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
