import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PrivacySecurityIconProps {
  size?: number;
  color?: string;
}

export const PrivacySecurityIcon: React.FC<PrivacySecurityIconProps> = ({
  size = 32,
  color = '#3B2B20',
}) => {
  const scale = size / 32;
  const width = 32 * scale;
  const height = 40 * scale;

  return (
    <Svg width={width} height={height} viewBox="0 0 32 40" fill="none">
      <Path 
        d="M14 30H18V18H14V30ZM16 14C16.5667 14 17.042 13.808 17.426 13.424C17.81 13.04 18.0013 12.5653 18 12C17.9987 11.4347 17.8067 10.96 17.424 10.576C17.0413 10.192 16.5667 10 16 10C15.4333 10 14.9587 10.192 14.576 10.576C14.1933 10.96 14.0013 11.4347 14 12C13.9987 12.5653 14.1907 13.0407 14.576 13.426C14.9613 13.8113 15.436 14.0027 16 14ZM16 40C11.3667 38.8333 7.54133 36.1747 4.524 32.024C1.50667 27.8733 -0.00133245 23.2653 8.83392e-07 18.2V6L16 0L32 6V18.2C32 23.2667 30.492 27.8753 27.476 32.026C24.46 36.1767 20.6347 38.8347 16 40ZM16 35.8C19.4667 34.7 22.3333 32.5 24.6 29.2C26.8667 25.9 28 22.2333 28 18.2V8.75L16 4.25L4 8.75V18.2C4 22.2333 5.13333 25.9 7.4 29.2C9.66667 32.5 12.5333 34.7 16 35.8Z" 
        fill={color}
      />
    </Svg>
  );
};
