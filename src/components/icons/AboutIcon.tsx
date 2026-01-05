import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface AboutIconProps {
  size?: number;
  color?: string;
}

export const AboutIcon: React.FC<AboutIconProps> = ({
  size = 24,
  color = '#3B2B20',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 0C8.95434 0 0 8.95425 0 20C0 31.0456 8.95434 40 20 40C31.0458 40 40 31.0457 40 20C40 8.95425 31.0458 0 20 0ZM20 36C11.1776 36 4.00003 28.8224 4.00003 20C4.00003 11.1775 11.1775 4.00003 20 4.00003C28.8225 4.00003 36 11.1775 36 20C36 28.8224 28.8225 36 20 36ZM22.5044 12C22.5044 13.4501 21.4486 14.5 20.0203 14.5C18.5343 14.5 17.5043 13.45 17.5043 11.9722C17.5043 10.5519 18.5621 9.50006 20.0203 9.50006C21.4486 9.50006 22.5044 10.5519 22.5044 12ZM18.0044 18H22.0043V30H18.0044V18Z"
        fill={color}
      />
    </Svg>
  );
};
