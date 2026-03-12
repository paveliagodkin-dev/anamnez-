/**
 * fail2ban — блокировка IP после N неудачных попыток входа.
 *
 * Настройки:
 *   MAX_ATTEMPTS    — кол-во попыток до блокировки (по умолчанию 5)
 *   BAN_DURATION_MS — длительность блокировки, мс (по умолчанию 30 мин)
 *   WINDOW_MS       — окно для подсчёта попыток, мс (по умолчанию 15 мин)
 */

const MAX_ATTEMPTS = parseInt(process.env.F2B_MAX_ATTEMPTS) || 5;
const BAN_DURATION_MS = parseInt(process.env.F2B_BAN_DURATION_MS) || 30 * 60 * 1000;
const WINDOW_MS = parseInt(process.env.F2B_WINDOW_MS) || 15 * 60 * 1000;

// ip -> { attempts: number, windowStart: number, bannedUntil: number }
const store = new Map();

function getEntry(ip) {
  const now = Date.now();
  let entry = store.get(ip);
  if (!entry) {
    entry = { attempts: 0, windowStart: now, bannedUntil: 0 };
    store.set(ip, entry);
  }
  // Сбрасываем счётчик, если окно истекло
  if (now - entry.windowStart > WINDOW_MS && entry.bannedUntil < now) {
    entry.attempts = 0;
    entry.windowStart = now;
  }
  return entry;
}

/** Зафиксировать неудачную попытку. Если превышен лимит — заблокировать IP. */
export function recordFailure(ip) {
  const entry = getEntry(ip);
  entry.attempts += 1;
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.bannedUntil = Date.now() + BAN_DURATION_MS;
  }
}

/** Сбросить счётчик при успешном входе. */
export function resetAttempts(ip) {
  store.delete(ip);
}

/** Middleware: отклоняет запросы от заблокированных IP. */
export function checkBanned(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress;
  const entry = store.get(ip);
  if (entry && entry.bannedUntil > Date.now()) {
    const retryAfterSec = Math.ceil((entry.bannedUntil - Date.now()) / 1000);
    res.set('Retry-After', retryAfterSec);
    return res.status(429).json({
      error: `Слишком много неудачных попыток. Попробуй через ${Math.ceil(retryAfterSec / 60)} мин.`
    });
  }
  next();
}

// Чистим старые записи раз в 10 минут
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store) {
    if (entry.bannedUntil < now && now - entry.windowStart > WINDOW_MS) {
      store.delete(ip);
    }
  }
}, 10 * 60 * 1000);
