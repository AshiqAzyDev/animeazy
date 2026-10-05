import type { StreamingProvider } from './provider';
import { builtinProviders } from './providers';

function envFlag(key: keyof ImportMetaEnv, defaultValue = false): boolean {
  const raw = (import.meta.env[key] as string | undefined)?.trim().toLowerCase();
  if (raw === undefined || raw === '') return defaultValue;
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

const extra = new Map<string, StreamingProvider>();

export function registerProvider(provider: StreamingProvider): void {
  extra.set(provider.id, provider);
}

export function unregisterProvider(id: string): void {
  extra.delete(id);
}

export function isMockEnabled(): boolean {
  // Default ON in development so the player pipeline is testable; OFF in production builds unless opted in.
  const defaultOn = Boolean(import.meta.env.DEV);
  return envFlag('VITE_STREAM_MOCK_ENABLED', defaultOn);
}

export function isAutoFallbackEnabled(): boolean {
  return envFlag('VITE_STREAM_AUTO_FALLBACK', false);
}

export function listProviders(): StreamingProvider[] {
  const all = [...builtinProviders, ...extra.values()];
  const seen = new Set<string>();
  const out: StreamingProvider[] = [];
  for (const p of all) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    if (p.developmentOnly && !isMockEnabled()) continue;
    out.push(p);
  }
  return out;
}

export function getProvider(id: string): StreamingProvider | undefined {
  return listProviders().find((p) => p.id === id);
}

export function listProviderSummaries(): { id: string; name: string; developmentOnly?: boolean }[] {
  return listProviders().map((p) => ({
    id: p.id,
    name: p.name,
    developmentOnly: p.developmentOnly,
  }));
}
