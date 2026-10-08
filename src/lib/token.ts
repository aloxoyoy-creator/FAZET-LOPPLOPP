export function getAdminToken() {
  const interval = Math.floor(Date.now() / 300000);
  return `FAZET-SECURE-${interval.toString(36).toUpperCase()}`;
}

export function validateAdminToken(input: string) {
  const now = Date.now();
  const currentInterval = Math.floor(now / 300000);
  const prevInterval = currentInterval - 1;
  const currentToken = `FAZET-SECURE-${currentInterval.toString(36).toUpperCase()}`;
  const prevToken = `FAZET-SECURE-${prevInterval.toString(36).toUpperCase()}`;
  return input === currentToken || input === prevToken;
}

export function getTokenTimeRemaining() {
  const now = Date.now();
  const nextInterval = (Math.floor(now / 300000) + 1) * 300000;
  return nextInterval - now;
}
