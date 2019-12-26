import { Buffer } from 'buffer'

declare module '@consento/sync-randombytes' {
  const cmd: <T extends Uint8Array | Buffer>(input: T) => T;
  export default cmd
}

