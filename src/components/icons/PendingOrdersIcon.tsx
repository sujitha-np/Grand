import React from 'react';
import Svg, { Rect, G, Mask, Path, Defs, ClipPath } from 'react-native-svg';

interface PendingOrdersIconProps {
  size?: number;
}

export const PendingOrdersIcon: React.FC<PendingOrdersIconProps> = ({ size = 56 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Rect width="200" height="200" rx="60" fill="#F3E7D3"/>
      <G clipPath="url(#clip0_533_674)">
        <Mask id="mask0_533_674" maskUnits="userSpaceOnUse" x="57" y="57" width="86" height="86">
          <Path d="M143 57H57V143H143V57Z" fill="white"/>
        </Mask>
        <G mask="url(#mask0_533_674)">
          <Path d="M85.6665 64.1665V74.9165" stroke="#3B2B20" strokeWidth="4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M114.333 64.1665V74.9165" stroke="#3B2B20" strokeWidth="4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          <Path opacity="0.5" d="M69.5415 89.5718H130.458" stroke="#3B2B20" strokeWidth="4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M132.25 87.4582V117.917C132.25 128.667 126.875 135.833 114.333 135.833H85.6667C73.125 135.833 67.75 128.667 67.75 117.917V87.4582C67.75 76.7082 73.125 69.5415 85.6667 69.5415H114.333C126.875 69.5415 132.25 76.7082 132.25 87.4582Z" stroke="#3B2B20" strokeWidth="4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          <Path opacity="0.5" d="M99.9839 106.089H100.016" stroke="#3B2B20" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <Path opacity="0.5" d="M86.7212 106.089H86.7534" stroke="#3B2B20" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <Path opacity="0.5" d="M86.7217 116.839H86.7539" stroke="#3B2B20" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_533_674">
          <Rect width="86" height="86" fill="white" transform="translate(57 57)"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default PendingOrdersIcon;
