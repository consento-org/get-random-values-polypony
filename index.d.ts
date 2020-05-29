declare module '@consento/sync-randombytes' {
  interface SyncRandomBytes {
    <T extends Uint8Array | Uint8ClampedArray | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | DataView | Float32Array | Float64Array>(input: T): T
    lowEntropy: boolean
    highEntropyPromise: Promise<void>
    polyfill (): Promise<void>
  }
  const fn: SyncRandomBytes;
  export default fn;
}
