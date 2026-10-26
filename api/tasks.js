/**
 * Vercel Serverless Function: /api/tasks
 */
const seed = require('../js/data.js');

let inMemoryTasks = [...seed.SEED_TASKS];

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      count: inMemoryTasks.length,
      tasks: inMemoryTasks
    });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    if (!body.title || !body.subject || !body.dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory fields: title, subject, or dueDate.'
      });
    }

    const newTask = {
      id: 'task-' + Date.now().toString(36),
      title: body.title,
      subject: body.subject,
      type: body.type || 'Assignment',
      dueDate: body.dueDate,
      dueTime: body.dueTime || '23:59',
      priority: body.priority || 'Medium',
      status: body.status || 'Not started',
      description: body.description || '',
      batch: body.batch || 'SY-C2',
      createdAt: new Date().toISOString()
    };

    inMemoryTasks.unshift(newTask);
    return res.status(201).json({ success: true, task: newTask });
  }

  if (req.method === 'PUT') {
    const id = req.query.id;
    const body = req.body || {};
    const idx = inMemoryTasks.findIndex(t => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    inMemoryTasks[idx] = { ...inMemoryTasks[idx], ...body };
    return res.status(200).json({ success: true, task: inMemoryTasks[idx] });
  }

  if (req.method === 'DELETE') {
    const id = req.query.id;
    inMemoryTasks = inMemoryTasks.filter(t => t.id !== id);
    return res.status(200).json({ success: true, message: 'Task deleted successfully' });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
