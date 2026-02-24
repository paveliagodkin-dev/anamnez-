import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Необходима авторизация' });
  }
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Токен недействителен' });
  }
}

export function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    } catch {}
  }
  next();
}
