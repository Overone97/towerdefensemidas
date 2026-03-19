type LogLevel = 'info' | 'warn' | 'error';

function log(level: LogLevel, event: string, details?: unknown) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    details,
  };

  if (level === 'error') {
    console.error('[obs]', payload);
  } else if (level === 'warn') {
    console.warn('[obs]', payload);
  } else {
    console.log('[obs]', payload);
  }
}

function getReleaseVersion(): string {
  return import.meta.env.VITE_APP_VERSION || 'dev';
}

export function initObservability() {
  log('info', 'app_boot', {
    version: getReleaseVersion(),
    userAgent: navigator.userAgent,
  });

  window.addEventListener('error', (event) => {
    log('error', 'window_error', {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    log('error', 'unhandled_rejection', {
      reason: String(event.reason),
    });
  });
}
