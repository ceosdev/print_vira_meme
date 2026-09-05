/**
 * @jest-environment node
 */
import fs from 'node:fs';
import path from 'node:path';

describe('foto-exemplo', () => {
  it('existe e é um PNG de 900×1200', () => {
    const file = path.join(__dirname, '../../../assets/images/sample-photo.png');
    const buf = fs.readFileSync(file);
    expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(buf.readUInt32BE(16)).toBe(900);
    expect(buf.readUInt32BE(20)).toBe(1200);
  });
});
