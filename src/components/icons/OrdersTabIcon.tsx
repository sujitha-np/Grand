import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface OrdersTabIconProps {
  size?: number;
  color?: string;
}

export const OrdersTabIcon: React.FC<OrdersTabIconProps> = ({ 
  size = 24, 
  color = '#3B2B20' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path 
        d="M30 19H14M20 29H14M6 22C6 14.5 6 10.75 7.91 8.122C8.52612 7.27334 9.2719 6.52689 10.12 5.91C12.75 4 16.502 4 24 4C31.498 4 35.25 4 37.878 5.91C38.7268 6.52673 39.4733 7.27319 40.09 8.122C42 10.75 42 14.502 42 22V26C42 33.5 42 37.25 40.09 39.878C39.4733 40.7268 38.7268 41.4733 37.878 42.09C35.25 44 31.498 44 24 44C16.502 44 12.75 44 10.122 42.09C9.27319 41.4733 8.52673 40.7268 7.91 39.878C6 37.25 6 33.498 6 26V22Z" 
        stroke={color}
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default OrdersTabIcon;
