const jwt = require('jsonwebtoken');
const SECRET = 'supersecreto'; // Altere isto em produção

// Middleware de autenticação
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token obrigatório' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

module.exports = { authMiddleware, SECRET };
