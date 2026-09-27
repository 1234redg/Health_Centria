import { verifySession } from '../utils/tokens.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  try {
    const payload = verifySession(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired. Log in again.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not allowed for your role.' });
    }
    return next();
  };
}
