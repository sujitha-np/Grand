import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface EmailIconProps {
  size?: number;
  color?: string;
}

export const EmailIcon: React.FC<EmailIconProps> = ({
  size = 24,
  color = '#3B2B20',
}) => {
  return (
    <Svg width={size} height={size * 0.795} viewBox="0 0 39 31" fill="none">
      <Path
        d="M9.5 9.5L17 15.5C17.7094 16.068 18.5912 16.3775 19.5 16.3775C20.4088 16.3775 21.2906 16.068 22 15.5L29.5 9.5M37.5 25.5V5.5C37.5 4.43913 37.0786 3.42172 36.3284 2.67157C35.5783 1.92143 34.5609 1.5 33.5 1.5H5.5C4.43913 1.5 3.42172 1.92143 2.67157 2.67157C1.92143 3.42172 1.5 4.43913 1.5 5.5V25.5C1.5 26.5609 1.92143 27.5783 2.67157 28.3284C3.42172 29.0786 4.43913 29.5 5.5 29.5H33.5C34.5609 29.5 35.5783 29.0786 36.3284 28.3284C37.0786 27.5783 37.5 26.5609 37.5 25.5Z"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
