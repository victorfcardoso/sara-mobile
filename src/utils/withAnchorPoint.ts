import type { TransformsStyle } from 'react-native';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

const isValidSize = (size: Size): boolean => {
  'worklet';
  return size && size.width > 0 && size.height > 0;
};

const defaultAnchorPoint = { x: 0.5, y: 0.5 };

type TransformValue = Record<string, number | string | number[]>;

export const withAnchorPoint = (
  transform: TransformsStyle,
  anchorPoint: Point,
  size: Size,
): TransformsStyle => {
  'worklet';
  if (!isValidSize(size)) {
    return transform;
  }

  const baseTransform = transform.transform;
  if (!baseTransform) {
    return transform;
  }

  if (!Array.isArray(baseTransform)) {
    return { transform: baseTransform };
  }

  const transforms = [...baseTransform] as TransformValue[];

  if (anchorPoint.x !== defaultAnchorPoint.x && size.width) {
    transforms.unshift({
      translateX: size.width * (anchorPoint.x - defaultAnchorPoint.x),
    });
    transforms.push({
      translateX: size.width * (defaultAnchorPoint.x - anchorPoint.x),
    });
  }

  if (anchorPoint.y !== defaultAnchorPoint.y && size.height) {
    transforms.unshift({
      translateY: size.height * (anchorPoint.y - defaultAnchorPoint.y),
    });
    transforms.push({
      translateY: size.height * (defaultAnchorPoint.y - anchorPoint.y),
    });
  }

  return { transform: transforms as unknown as TransformsStyle['transform'] };
};
