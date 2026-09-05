import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
// Reanimated 4 roda sobre react-native-worklets; no Jest usamos o mock oficial (guia "Testing" do worklets).
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));

// expo-image → Image do RN (permite fireEvent(el, 'load') nos testes)
jest.mock('expo-image', () => {
  const React = require('react');
  const { Image } = require('react-native');
  return { Image: (props: Record<string, unknown>) => React.createElement(Image, props) };
});

// view-shot: captura vira um arquivo temporário fictício
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(async () => 'file:///tmp/capture.jpg'),
  releaseCapture: jest.fn(),
}));

// file-system legacy: sistema de arquivos em memória
jest.mock('expo-file-system/legacy', () => {
  const files = new Map<string, { modificationTime: number }>();
  const dirs = new Set<string>();
  return {
    __files: files,
    __dirs: dirs,
    cacheDirectory: 'file:///cache/',
    getInfoAsync: jest.fn(async (uri: string) => {
      if (dirs.has(uri)) return { exists: true, isDirectory: true };
      const f = files.get(uri);
      return f ? { exists: true, isDirectory: false, modificationTime: f.modificationTime, size: 1 } : { exists: false };
    }),
    makeDirectoryAsync: jest.fn(async (uri: string) => {
      dirs.add(uri);
    }),
    moveAsync: jest.fn(async ({ from, to }: { from: string; to: string }) => {
      const f = files.get(from) ?? { modificationTime: Date.now() / 1000 };
      files.delete(from);
      files.set(to, f);
    }),
    copyAsync: jest.fn(async ({ to }: { from: string; to: string }) => {
      files.set(to, { modificationTime: Date.now() / 1000 });
    }),
    deleteAsync: jest.fn(async (uri: string) => {
      files.delete(uri);
    }),
    readDirectoryAsync: jest.fn(async (dir: string) =>
      [...files.keys()].filter((k) => k.startsWith(dir)).map((k) => k.slice(dir.length)),
    ),
  };
});

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///picked.jpg', width: 4000, height: 3000 }] })),
  launchCameraAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///shot.jpg', width: 3000, height: 4000 }] })),
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
}));

jest.mock('expo-image-manipulator', () => {
  const calls: { uri: string; resize?: { width?: number; height?: number } }[] = [];
  const manipulate = (uri: string) => {
    const call: { uri: string; resize?: { width?: number; height?: number } } = { uri };
    calls.push(call);
    const ctx = {
      resize: (size: { width?: number; height?: number }) => {
        call.resize = size;
        return ctx;
      },
      renderAsync: async () => {
        const { width, height } = call.resize ?? {};
        const w = width ?? Math.round(((height ?? 3000) * 4) / 3);
        const h = height ?? Math.round(((width ?? 4000) * 3) / 4);
        return {
          width: w,
          height: h,
          saveAsync: async () => ({ uri: `file:///manip/${w}x${h}.jpg`, width: w, height: h }),
          release: () => {},
        };
      },
    };
    return ctx;
  };
  return { __calls: calls, ImageManipulator: { manipulate }, SaveFormat: { JPEG: 'jpeg', PNG: 'png' } };
});

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => {}),
  useIncomingShare: jest.fn(() => ({
    sharedPayloads: [],
    resolvedSharedPayloads: [],
    clearSharedPayloads: jest.fn(),
    isResolving: false,
    error: null,
    refreshSharePayloads: jest.fn(),
  })),
}));

jest.mock('expo-media-library/legacy', () => ({
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  saveToLibraryAsync: jest.fn(async () => {}),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(async () => {}),
  notificationAsync: jest.fn(async () => {}),
  selectionAsync: jest.fn(async () => {}),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));
