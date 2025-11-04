import { Platform } from 'react-native';

type ConvertFn = (input: string) => Promise<string | Error> | Promise<string>;

type ConverterModule = {
  convertOggToWav?: ConvertFn;
  convertAacToWav?: ConvertFn;
};

const moduleLoader = (): ConverterModule => {
  if (Platform.OS === 'android') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('./audioConverter.android');
  }
  // Default to iOS behaviour for other platforms (including web/testing)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('./audioConverter.ios');
};

const converters = moduleLoader();

export const convertOggToWav = async (input: string): Promise<string> => {
  if (typeof converters.convertOggToWav === 'function') {
    const result = await converters.convertOggToWav(input);
    if (result instanceof Error) {
      throw result;
    }
    return result;
  }
  return input;
};

export const convertAacToWav = async (input: string): Promise<string> => {
  if (typeof converters.convertAacToWav === 'function') {
    const result = await converters.convertAacToWav(input);
    if (result instanceof Error) {
      throw result;
    }
    return result;
  }
  return input;
};
