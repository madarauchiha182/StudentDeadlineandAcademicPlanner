/**
 * Student Deadline & Academic Planner - Built-in Zero-Dependency HTTP & REST API Server
 * Department of Computer Engineering - JSPM's RSCOE Pune
 * CS2308L Design Thinking Lab (Experiments 7 to 10)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const PUBLIC_DIR = __dirname;

// In-Memory Data Store initialized from seed
const seed = require('./js/data.js');
let tasks = [...seed.SEED_TASKS];
let alerts = [...seed.SEED_ALERTS];
let users = [...seed.SEED_USERS];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // --- API Routes ---
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await parseBody(req);
    const user = users.find(u => 
      (u.rollNo.toLowerCase() === body.identifier?.toLowerCase() || u.email.toLowerCase() === body.identifier?.toLowerCase()) &&
      u.role === body.role
    );
    if (!user || user.password !== body.password) {
      return sendJson(res, 401, { success: false, message: 'Incorrect credentials (Exception X1).' });
    }
    return sendJson(res, 200, {
      success: true,
      token: 'jwt-rscoe-' + user.id + '-' + Date.now(),
      user: { id: user.id, name: user.name, rollNo: user.rollNo, role: user.role }
    });
  }

  if (pathname === '/api/tasks' && method === 'GET') {
    return sendJson(res, 200, { success: true, count: tasks.length, tasks });
  }

  if (pathname === '/api/tasks' && method === 'POST') {
    const body = await parseBody(req);
    const newTask = {
      id: 'task-' + Date.now().toString(36),
      title: body.title || 'Untitled Task',
      subject: body.subject || 'DBMS',
      type: body.type || 'Assignment',
      dueDate: body.dueDate,
      dueTime: body.dueTime || '23:59',
      priority: body.priority || 'Medium',
      status: body.status || 'Not started',
      description: body.description || '',
      batch: body.batch || 'SY-C2',
      createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    return sendJson(res, 201, { success: true, task: newTask });
  }

  if (pathname === '/api/alerts' && method === 'GET') {
    return sendJson(res, 200, { success: true, alerts });
  }

  if (pathname === '/api/reports/class' && method === 'GET') {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const overdue = tasks.filter(t => t.status === 'Overdue').length;
    return sendJson(res, 200, {
      success: true,
      batch: 'SY-C2',
      metrics: { total, completed, overdue, rate: Math.round((completed / total) * 100) },
      tasks
    });
  }

  // --- Static File Serving ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error: Could not read file.');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

function startServer(portToTry) {
  server.listen(portToTry, () => {
    console.log(`=======================================================`);
    console.log(`🎓 Student Deadline & Academic Planner (CS2308L Lab)`);
    console.log(`📡 Server running on http://localhost:${portToTry}`);
    console.log(`📚 Reference Date: 2026-10-26 (JSPM's RSCOE Pune)`);
    console.log(`=======================================================`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${err.port} is busy, trying ${err.port + 1}...`);
    startServer(err.port + 1);
  } else {
    console.error('Server error:', err);
  }
});

startServer(DEFAULT_PORT);
