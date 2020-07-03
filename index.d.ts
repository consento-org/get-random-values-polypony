export = getRandomValues;

declare function getRandomValues <T extends ArrayBufferView> (input: T): T 

declare namespace getRandomValues {
  export function polyfill(): void;
}
