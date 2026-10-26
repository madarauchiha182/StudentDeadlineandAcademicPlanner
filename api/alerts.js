/**
 * Vercel Serverless Function: /api/alerts
 */
const seed = require('../js/data.js');

let inMemoryAlerts = [...seed.SEED_ALERTS];

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      count: inMemoryAlerts.length,
      alerts: inMemoryAlerts
    });
  }

  if (req.method === 'POST') {
    // Snooze action
    const { alertId, hours } = req.body || {};
    const alert = inMemoryAlerts.find(a => a.id === alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    alert.isSnoozed = true;
    alert.snoozedUntil = new Date(Date.now() + (hours || 1) * 3600 * 1000).toISOString();
    return res.status(200).json({ success: true, alert });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
