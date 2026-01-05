/**
 * Form Input Icons - Native SVG Components
 * These replace the imported SVG files with native react-native-svg components
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const ProfileFormIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#3B2B20',
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Path
      d="M8 36C8 33.8783 8.84285 31.8434 10.3431 30.3431C11.8434 28.8429 13.8783 28 16 28H32C34.1217 28 36.1566 28.8429 37.6569 30.3431C39.1571 31.8434 40 33.8783 40 36C40 37.0609 39.5786 38.0783 38.8284 38.8284C38.0783 39.5786 37.0609 40 36 40H12C10.9391 40 9.92172 39.5786 9.17157 38.8284C8.42143 38.0783 8 37.0609 8 36Z"
      stroke={color}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <Path
      d="M24 20C27.3137 20 30 17.3137 30 14C30 10.6863 27.3137 8 24 8C20.6863 8 18 10.6863 18 14C18 17.3137 20.6863 20 24 20Z"
      stroke={color}
      strokeWidth="3"
    />
  </Svg>
);

export const PhoneFormIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#3B2B20',
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Path
      d="M18.5 7.65C18.2833 7.05 17.6833 6.66667 17 6.66667H10.3333C9.41667 6.66667 8.66667 7.41667 8.66667 8.33333C8.66667 26.6333 23.3667 41.3333 41.6667 41.3333C42.5833 41.3333 43.3333 40.5833 43.3333 39.6667V33C43.3333 32.3167 42.95 31.7167 42.35 31.5L35.85 29.3333C35.3167 29.1333 34.7167 29.2667 34.3167 29.6667L30.5333 33.45C24.5667 30.3833 19.6167 25.45 16.55 19.4667L20.3333 15.6833C20.7333 15.2833 20.8667 14.6833 20.6667 14.15L18.5 7.65Z"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MailFormIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#3B2B20',
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Path
      d="M14 18L21.5 24C22.2094 24.568 23.0912 24.8775 24 24.8775C24.9088 24.8775 25.7906 24.568 26.5 24L34 18M42 34V14C42 12.9391 41.5786 11.9217 40.8284 11.1716C40.0783 10.4214 39.0609 10 38 10H10C8.93913 10 7.92172 10.4214 7.17157 11.1716C6.42143 11.9217 6 12.9391 6 14V34C6 35.0609 6.42143 36.0783 7.17157 36.8284C7.92172 37.5786 8.93913 38 10 38H38C39.0609 38 40.0783 37.5786 40.8284 36.8284C41.5786 36.0783 42 35.0609 42 34Z"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CalendarFormIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#3B2B20',
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Path
      d="M16 4V10"
      stroke={color}
      strokeWidth="3"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M32 4V10"
      stroke={color}
      strokeWidth="3"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 18.1797H41"
      stroke={color}
      strokeWidth="3"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M42 17V34C42 40 39 44 32 44H16C9 44 6 40 6 34V17C6 11 9 7 16 7H32C39 7 42 11 42 17Z"
      stroke={color}
      strokeWidth="3"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23.991 27.3984H24.009"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.5886 27.3984H16.6066"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.5886 33.3984H16.6066"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const DropdownFormIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#3B2B20',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Company Building Icon for Company Name field
export const CompanyBuildingIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#3B2B20',
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Path
      d="M8 40H40"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M32.0001 8H16.0001C11.2001 8 9.6001 10.864 9.6001 14.4V40H38.4001V14.4C38.4001 10.864 36.8001 8 32.0001 8Z"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 31.1997H20.8"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M27.2 31.1997H32"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 24H20.8"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M27.2 24H32"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 16.8003H20.8"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M27.2 16.8003H32"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Designation / Person Badge Icon
export const DesignationIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#3B2B20',
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Path
      d="M16 28C13.8783 28 11.8434 28.8429 10.3431 30.3431C8.84285 31.8434 8 33.8783 8 36C8 37.0609 8.42143 38.0783 9.17157 38.8284C9.92172 39.5786 10.9391 40 12 40H36C37.0609 40 38.0783 39.5786 38.8284 38.8284C39.5786 38.0783 40 37.0609 40 36C40 33.8783 39.1571 31.8434 37.6569 30.3431C36.1566 28.8429 34.1217 28 32 28"
      stroke={color}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <Path
      d="M24 20C27.3137 20 30 17.3137 30 14C30 10.6863 27.3137 8 24 8C20.6863 8 18 10.6863 18 14C18 17.3137 20.6863 20 24 20Z"
      stroke={color}
      strokeWidth={3}
    />
    <Path
      d="M23 29.2479L22.12 37.3599H25.88L25 29.2479L27 26.2399C26.38 26.1279 24.67 26.0479 24 26.0479C23.33 26.0479 21.62 26.1279 21 26.2399L23 29.2479Z"
      fill={color}
    />
  </Svg>
);

// Employee Code Icon (same as designation per provided SVG)
export const EmployeeCodeIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#3B2B20',
}) => <DesignationIcon size={size} color={color} />;

// QID Icon (same as designation per provided SVG)
export const QIDIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#3B2B20',
}) => <DesignationIcon size={size} color={color} />;

export const MaleFormIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#3B2B20',
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Path
      d="M20.5 43C29.0604 43 36 36.0604 36 27.5C36 18.9396 29.0604 12 20.5 12C11.9396 12 5 18.9396 5 27.5C5 36.0604 11.9396 43 20.5 43Z"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M43 5L32 16"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M30 5H43V18"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
