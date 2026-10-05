type LogFields = Record<string, string | number | boolean | undefined | null>;

export function logInfo(event: string, fields: LogFields = {}): void {
  console.log(JSON.stringify({ level: 'info', event, t: Date.now(), ...sanitize(fields) }));
}

export function logError(event: string, fields: LogFields = {}): void {
  console.error(JSON.stringify({ level: 'error', event, t: Date.now(), ...sanitize(fields) }));
}

function sanitize(fields: LogFields): LogFields {
  const out: LogFields = {};
  for (const [k, v] of Object.entries(fields)) {
    const key = k.toLowerCase();
    if (key.includes('key') || key.includes('secret') || key.includes('token') || key.includes('authorization')) {
      out[k] = '[redacted]';
      continue;
    }
    if (typeof v === 'string' && /[?&](token|sig|signature|expires)=/i.test(v)) {
      out[k] = '[redacted-url]';
      continue;
    }
    out[k] = v;
  }
  return out;
}
