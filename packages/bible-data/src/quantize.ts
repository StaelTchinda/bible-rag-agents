/** int8 scale. L2-normalized components live in [-1, 1]; scaling by 127 fits int8. */
export const INT8_SCALE = 127;

/** Quantize a float vector to int8 (symmetric, clamped to [-127, 127]). */
export function quantizeInt8(vec: Float32Array): Int8Array {
  const out = new Int8Array(vec.length);
  for (let i = 0; i < vec.length; i++) {
    const q = Math.round((vec[i] as number) * INT8_SCALE);
    out[i] = q < -127 ? -127 : q > 127 ? 127 : q;
  }
  return out;
}
