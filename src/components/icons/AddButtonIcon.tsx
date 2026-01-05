import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface AddButtonIconProps {
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
}

export const AddButtonIcon: React.FC<AddButtonIconProps> = ({ 
  size = 110, 
  backgroundColor = '#ECF1E8',
  iconColor = '#448C07'
}) => {
  const scale = size / 110;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 110 110" fill="none">
      <Rect 
        width="110" 
        height="110" 
        rx="55" 
        fill={backgroundColor}
      />
      <Path 
        d="M52.5003 68.3337C52.5003 68.9967 52.7637 69.6326 53.2326 70.1014C53.7014 70.5703 54.3373 70.8337 55.0003 70.8337C55.6634 70.8337 56.2993 70.5703 56.7681 70.1014C57.2369 69.6326 57.5003 68.9967 57.5003 68.3337V57.5003H68.3337C68.9967 57.5003 69.6326 57.2369 70.1014 56.7681C70.5703 56.2993 70.8337 55.6634 70.8337 55.0003C70.8337 54.3373 70.5703 53.7014 70.1014 53.2326C69.6326 52.7637 68.9967 52.5003 68.3337 52.5003H57.5003V41.667C57.5003 41.004 57.2369 40.3681 56.7681 39.8992C56.2993 39.4304 55.6634 39.167 55.0003 39.167C54.3373 39.167 53.7014 39.4304 53.2326 39.8992C52.7637 40.3681 52.5003 41.004 52.5003 41.667V52.5003H41.667C41.004 52.5003 40.3681 52.7637 39.8992 53.2326C39.4304 53.7014 39.167 54.3373 39.167 55.0003C39.167 55.6634 39.4304 56.2993 39.8992 56.7681C40.3681 57.2369 41.004 57.5003 41.667 57.5003H52.5003V68.3337Z" 
        fill={iconColor}
      />
    </Svg>
  );
};

export default AddButtonIcon;
