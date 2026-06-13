import { dev } from '$app/environment';

export function log(message: unknown) {
  if (dev) {
    console.log(message);
  }
}
