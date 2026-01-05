import React from 'react';

type AnySvg = React.ComponentType<any> | number | undefined | null;

interface SafeSvgProps {
  icon: AnySvg;
  width?: number;
  height?: number;
  color?: string;
}

export const SafeSvg: React.FC<SafeSvgProps> = ({
  icon,
  width = 20,
  height = 20,
  color,
}) => {
  if (!icon) return null;
  if (typeof icon === 'number') {
    // Imported as a numeric resource ID; cannot render as a component.
    return null;
  }
  const IconComponent = icon as React.ComponentType<any>;
  return (
    <IconComponent
      width={width}
      height={height}
      // Many SVGs use stroke; propagate color for both to be safe
      color={color}
      stroke={color}
    />
  );
};

export default SafeSvg;
