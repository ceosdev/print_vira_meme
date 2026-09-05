import { Image } from 'react-native';

const source = Image.resolveAssetSource(require('../../assets/images/sample-photo.png'));

/** Foto-exemplo própria para cards sem foto e QA. */
export const SAMPLE_IMAGE = { uri: source?.uri ?? '', width: 900, height: 1200 } as const;
