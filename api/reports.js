/**
 * Vercel Serverless Function: /api/reports
 */
const seed = require('../js/data.js');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const tasks = seed.SEED_TASKS;
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const overdue = tasks.filter(t => t.status === 'Overdue').length;
  const inProgress = tasks.filter(t => t.status === 'In progress').length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  res.status(200).json({
    success: true,
    batch: 'SY-C2',
    department: 'Computer Engineering',
    metrics: { total, completed, overdue, inProgress, completionRate: rate },
    tasks
  });
};
