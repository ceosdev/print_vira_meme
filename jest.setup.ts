import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
// Reanimated 4 roda sobre react-native-worklets; no Jest usamos o mock oficial (guia "Testing" do worklets).
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
