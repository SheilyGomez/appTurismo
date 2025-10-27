//middlewares/authMiddleware.js
const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
  const headerToken = req.headers.authorization;
  if (!headerToken) {
    return res.status(401).send({ message: 'No se proporcionó token' });
  }

  if (headerToken && headerToken.startsWith('Bearer ')) {
    const idToken = headerToken.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      res.status(403).send({ message: 'No autorizado' });
    }
  } else {
    res.status(401).send({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware;