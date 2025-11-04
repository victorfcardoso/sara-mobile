import { PressableProps } from 'react-native';
import { DerivedValue } from 'react-native-reanimated';

export type SendMessageButtonProps = PressableProps & {};

export type AddCommandButtonProps = PressableProps & {
  derivedAddMenuOptionStateValue: DerivedValue<number>;
};

export type PhotosCommandButtonProps = PressableProps & {};

export type VoiceRecordButtonProps = PressableProps & {};
