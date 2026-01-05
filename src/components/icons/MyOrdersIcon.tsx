import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface MyOrdersIconProps {
  size?: number;
}

export const MyOrdersIcon: React.FC<MyOrdersIconProps> = ({ size = 56 }) => {
  const scale = size / 200;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Rect width="200" height="200" rx="60" fill="#F3E7D3"/>
      <Path 
        opacity="0.5" 
        d="M110.75 91.042H96.4168H82.0835M92.8335 108.959H82.0835" 
        stroke="#3B2B20" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M67.75 96.417C67.75 82.9795 67.75 76.2607 71.1721 71.5522C72.276 70.0317 73.6122 68.6943 75.1317 67.5891C79.8437 64.167 86.5661 64.167 100 64.167C113.434 64.167 120.156 64.167 124.865 67.5891C126.386 68.694 127.723 70.0315 128.828 71.5522C132.25 76.2607 132.25 82.9831 132.25 96.417V103.584C132.25 117.021 132.25 123.74 128.828 128.448C127.723 129.969 126.386 131.307 124.865 132.412C120.156 135.834 113.434 135.834 100 135.834C86.5661 135.834 79.8437 135.834 75.1352 132.412C73.6145 131.307 72.277 129.969 71.1721 128.448C67.75 123.74 67.75 117.018 67.75 103.584V96.417Z" 
        stroke="#3B2B20" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default MyOrdersIcon;
