import type { StreamingProvider } from '../provider.js';
import { mockStreamingProvider } from './mock.js';
import { authorizedStreamingStub } from './authorizedStub.js';

export const builtinProviders: StreamingProvider[] = [
  mockStreamingProvider,
  authorizedStreamingStub,
];

export { mockStreamingProvider, authorizedStreamingStub };
