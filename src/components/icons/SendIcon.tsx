import React from 'react';
import Svg, { Path, G, Mask } from 'react-native-svg';

interface SendIconProps {
  size?: number;
  color?: string;
}

const SendIcon: React.FC<SendIconProps> = ({ size = 24, color = '#3B2B20' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Mask
        id="mask0_664_477"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="64"
        height="64"
      >
        <Path d="M64 0H0V64H64V0Z" fill="white" />
      </Mask>
      <G mask="url(#mask0_664_477)">
        <Path
          d="M25.3597 11.2813L48.1863 22.6947C58.4263 27.8146 58.4263 36.1879 48.1863 41.3079L25.3597 52.7213C9.99973 60.4013 3.73306 54.1079 11.4131 38.7746L13.7331 34.1613C14.3197 32.9879 14.3197 31.0413 13.7331 29.8679L11.4131 25.228C3.73306 9.89467 10.0264 3.60134 25.3597 11.2813Z"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14.5059 32H28.9058"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export default SendIcon;
