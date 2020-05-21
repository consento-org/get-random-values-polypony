declare module '@consento/sync-randombytes' {
  export default function <T extends Uint8Array | Uint8ClampedArray | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array>(input: T): T;
}
