import React from 'react';
import Svg, { Mask, G, Path } from 'react-native-svg';

interface MessageTabIconProps {
  size?: number;
  color?: string;
}

export const MessageTabIcon: React.FC<MessageTabIconProps> = ({ 
  size = 24, 
  color = '#3B2B20' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Mask 
        id="mask0_506_637" 
        maskUnits="userSpaceOnUse" 
        x="0" 
        y="0" 
        width="48" 
        height="48"
      >
        <Path d="M48 0H0V48H48V0Z" fill="white"/>
      </Mask>
      <G mask="url(#mask0_506_637)">
        <Path 
          d="M34 42.5H14C6.7 42.5 2.5 38.3 2.5 31V17C2.5 9.7 6.7 5.5 14 5.5H34C41.3 5.5 45.5 9.7 45.5 17V31C45.5 38.3 41.3 42.5 34 42.5ZM14 8.5C8.28 8.5 5.5 11.28 5.5 17V31C5.5 36.72 8.28 39.5 14 39.5H34C39.72 39.5 42.5 36.72 42.5 31V17C42.5 11.28 39.72 8.5 34 8.5H14Z" 
          fill={color}
        />
        <Path 
          d="M23.9996 25.74C22.3196 25.74 20.6196 25.22 19.3196 24.16L13.0596 19.1599C12.4196 18.6399 12.2996 17.6999 12.8196 17.0599C13.3396 16.4199 14.2796 16.2999 14.9196 16.8199L21.1796 21.82C22.6996 23.04 25.2796 23.04 26.7996 21.82L33.0596 16.8199C33.6996 16.2999 34.6596 16.3999 35.1596 17.0599C35.6796 17.6999 35.5796 18.6599 34.9196 19.1599L28.6596 24.16C27.3796 25.22 25.6796 25.74 23.9996 25.74Z" 
          fill={color}
        />
      </G>
    </Svg>
  );
};

export default MessageTabIcon;
