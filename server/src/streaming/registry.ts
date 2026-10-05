import { config } from '../config/env.js';
import type { StreamingProvider } from './provider.js';
import { builtinProviders } from './providers/index.js';

const extra = new Map<string, StreamingProvider>();

export function registerProvider(provider: StreamingProvider): void {
  extra.set(provider.id, provider);
}

export function unregisterProvider(id: string): void {
  extra.delete(id);
}

export function listProviders(): StreamingProvider[] {
  const all = [...builtinProviders, ...extra.values()];
  const seen = new Set<string>();
  const out: StreamingProvider[] = [];
  for (const p of all) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    if (p.developmentOnly && !config.mockEnabled) continue;
    if (p.id === 'authorized') {
      if (!config.authorizedProviderEnabled) continue;
      out.push(p);
      continue;
    }
    if (p.enabled === false) continue;
    out.push(p);
  }
  return out;
}

export function getProvider(id: string): StreamingProvider | undefined {
  return listProviders().find((p) => p.id === id);
}

export function isProviderEnabled(id: string): boolean {
  return Boolean(getProvider(id));
}

export function listProviderSummaries() {
  return listProviders().map((p) => ({
    id: p.id,
    name: p.name,
    developmentOnly: Boolean(p.developmentOnly),
    enabled: true,
  }));
}

export function isAutoFallbackEnabled(): boolean {
  return config.autoFallback;
}
