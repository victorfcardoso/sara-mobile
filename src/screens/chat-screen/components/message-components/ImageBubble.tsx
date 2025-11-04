import { Platform } from 'react-native';

type ImageModule = typeof import('./ImageBubble.ios');

const loadModule = (): ImageModule => {
  if (Platform.OS === 'android') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('./ImageBubble.android');
  }
  // Default to iOS implementation for other platforms (including tests)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('./ImageBubble.ios');
};

const imageModule = loadModule();

export const ImageBubble = imageModule.ImageBubble;
export const ImageBubbleContainer = imageModule.ImageBubbleContainer;
