import React from 'react';
import Svg, { Path, G, Mask, ClipPath, Defs, Rect } from 'react-native-svg';

interface EyeOffIconProps {
  size?: number;
  color?: string;
}

export const EyeOffIcon: React.FC<EyeOffIconProps> = ({
  size = 24,
  color = '#3B2B20',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <ClipPath id="clip0">
          <Rect width="48" height="48" fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0)">
        <Mask
          id="mask0"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="48"
          height="48"
        >
          <Path d="M48 0H0V48H48V0Z" fill="white" />
        </Mask>
        <G mask="url(#mask0)">
          <Path
            d="M29.0598 18.9398L18.9398 29.0598C17.6398 27.7598 16.8398 25.9798 16.8398 23.9998C16.8398 20.0398 20.0398 16.8398 23.9998 16.8398C25.9798 16.8398 27.7598 17.6398 29.0598 18.9398Z"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M35.6402 11.5409C32.1402 8.90094 28.1402 7.46094 24.0002 7.46094C16.9402 7.46094 10.3602 11.6209 5.78018 18.8209C3.98018 21.641 3.98018 26.381 5.78018 29.201C7.36018 31.681 9.20018 33.821 11.2002 35.541"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M16.8398 39.0594C19.1198 40.0194 21.5398 40.5394 23.9998 40.5394C31.0598 40.5394 37.6398 36.3794 42.2198 29.1794C44.0198 26.3594 44.0198 21.6194 42.2198 18.7994C41.5598 17.7594 40.8398 16.7794 40.0998 15.8594"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M31.0199 25.3984C30.4999 28.2184 28.1999 30.5184 25.3799 31.0384"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M18.94 29.0586L4 43.9986"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M44.0001 4L29.0601 18.94"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </G>
    </Svg>
  );
};
