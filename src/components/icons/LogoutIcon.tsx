import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LogoutIconProps {
  size?: number;
  color?: string;
}

export const LogoutIcon: React.FC<LogoutIconProps> = ({
  size = 24,
  color = '#E42727',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Path
        d="M30.75 4.113C34.4675 6.25931 37.3729 9.57231 39.0157 13.5382C40.6584 17.504 40.9466 21.9011 39.8356 26.0475C38.7245 30.1938 36.2764 33.8577 32.8709 36.4709C29.4653 39.0841 25.2926 40.5005 21 40.5005C16.7074 40.5005 12.5347 39.0841 9.12916 36.4709C5.7236 33.8577 3.27546 30.1938 2.16445 26.0475C1.05344 21.9011 1.34164 17.504 2.98436 13.5382C4.62707 9.57231 7.53249 6.25931 11.25 4.113M21 1.5V16.5"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
