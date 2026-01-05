import React from 'react';
import Svg, { G, Mask, Path, Defs, ClipPath, Rect } from 'react-native-svg';

interface NotificationBellProps {
  size?: number;
  color?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  size = 24, 
  color = 'white' 
}) => {
  const scale = size / 72;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <G clipPath="url(#clip0_432_586)">
        <Mask id="mask0_432_586" maskUnits="userSpaceOnUse" x="0" y="0" width="72" height="72">
          <Path d="M72 0H0V72H72V0Z" fill="white"/>
        </Mask>
        <G mask="url(#mask0_432_586)">
          <Path 
            d="M36.0599 8.73047C26.1298 8.73047 18.0598 16.8005 18.0598 26.7305V35.4006C18.0598 37.2306 17.2798 40.0206 16.3498 41.5806L12.8998 47.3106C10.7698 50.8506 12.2398 54.7806 16.1398 56.1006C29.0698 60.4206 43.0199 60.4206 55.9499 56.1006C59.5799 54.9006 61.1699 50.6106 59.1899 47.3106L55.7399 41.5806C54.8399 40.0206 54.0599 37.2306 54.0599 35.4006V26.7305C54.0599 16.8305 45.9599 8.73047 36.0599 8.73047Z" 
            stroke={color} 
            strokeWidth="5" 
            strokeMiterlimit="10" 
            strokeLinecap="round"
          />
          <Path 
            d="M41.6098 9.59836C40.6798 9.32836 39.7198 9.11836 38.7298 8.99836C35.8498 8.63836 33.0898 8.84836 30.5098 9.59836C31.3798 7.37836 33.5398 5.81836 36.0598 5.81836C38.5798 5.81836 40.7398 7.37836 41.6098 9.59836Z" 
            stroke={color} 
            strokeWidth="5" 
            strokeMiterlimit="10" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <Path 
            d="M45.0595 57.1816C45.0595 62.1316 41.0095 66.1816 36.0595 66.1816C33.5995 66.1816 31.3195 65.1616 29.6996 63.5416C28.0796 61.9216 27.0596 59.6416 27.0596 57.1816" 
            stroke={color} 
            strokeWidth="5" 
            strokeMiterlimit="10"
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_432_586">
          <Rect width="72" height="72" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default NotificationBell;
