// Gera assets/images/sample-photo.png (900×1200): gradiente + círculo + faixas. Foto-exemplo própria,
// sem direitos de terceiros, usada nos cards quando o usuário ainda não escolheu foto.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const W = 900;
const H = 1200;

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0; // filtro 0
  for (let x = 0; x < W; x++) {
    const t = y / H;
    let r = Math.round(255 * (0.98 - 0.55 * t)); // amarelo → laranja escuro
    let g = Math.round(214 * (1 - 0.7 * t));
    let b = Math.round(10 + 90 * t);
    const dx = x - 450;
    const dy = y - 520;
    if (dx * dx + dy * dy < 260 * 260) {
      r = 15;
      g = 15;
      b = 20;
    }
    if (((x + y) >> 6) % 7 === 0 && y > 900) {
      r = Math.round(r * 0.85);
      g = Math.round(g * 0.85);
      b = Math.round(b * 0.85);
    }
    const i = y * (W * 3 + 1) + 1 + x * 3;
    raw[i] = r;
    raw[i + 1] = g;
    raw[i + 2] = b;
  }
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 2;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
const out = path.join(__dirname, '../assets/images/sample-photo.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, png);
console.log(`ok ${out} (${png.length} bytes)`);
