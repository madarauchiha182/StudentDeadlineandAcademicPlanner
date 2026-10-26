/**
 * Vercel Serverless Function: /api/auth
 */
const seed = require('../js/data.js');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identifier, password, role } = req.body || {};
  const user = seed.SEED_USERS.find(u =>
    (u.rollNo.toLowerCase() === identifier?.toLowerCase() || u.email.toLowerCase() === identifier?.toLowerCase()) &&
    u.role === role
  );

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials or role mismatch (Exception X1).'
    });
  }

  return res.status(200).json({
    success: true,
    token: 'jwt-token-rscoe-' + user.id + '-' + Date.now(),
    user: {
      id: user.id,
      name: user.name,
      rollNo: user.rollNo,
      role: user.role,
      batch: user.batch
    }
  });
};
