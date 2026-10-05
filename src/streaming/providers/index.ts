import type { StreamingProvider } from '../provider';
import { mockStreamingProvider } from './mock';

/** Built-in providers. Add authorized partner implementations here later. */
export const builtinProviders: StreamingProvider[] = [mockStreamingProvider];

export { mockStreamingProvider };
