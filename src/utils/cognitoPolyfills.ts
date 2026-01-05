import 'react-native-get-random-values';
import { Buffer } from 'buffer';

const globalRef = globalThis as typeof globalThis & { Buffer?: typeof Buffer };

if (!globalRef.Buffer) {
  globalRef.Buffer = Buffer;
}
