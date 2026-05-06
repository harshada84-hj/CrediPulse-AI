import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    pan_number TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS credit_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pan_number TEXT NOT NULL,
    score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    explanation TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const info = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
    res.json({ message: 'User registered', userId: info.lastInsertRowid });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, pan_number: user.pan_number } });
});

// --- CREDIT ROUTES ---

app.post('/api/credit/submit-pan', authenticateToken, (req: any, res) => {
  const { pan_number } = req.body;
  const userId = req.user.id;

  // PAN Validation: ABCDE1234F
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan_number)) {
    return res.status(400).json({ error: 'Invalid PAN format. Use ABCDE1234F' });
  }

  try {
    db.prepare('UPDATE users SET pan_number = ? WHERE id = ?').run(pan_number, userId);
    res.json({ message: 'PAN submitted successfully', pan_number });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update PAN' });
  }
});

app.get('/api/credit/score', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const user: any = db.prepare('SELECT pan_number FROM users WHERE id = ?').get(userId);

  if (!user || !user.pan_number) {
    return res.status(400).json({ error: 'PAN not submitted' });
  }

  // Check if score already exists for this PAN
  const existingScore: any = db.prepare('SELECT * FROM credit_scores WHERE pan_number = ? ORDER BY timestamp DESC LIMIT 1').get(user.pan_number);

  if (existingScore) {
    return res.json(existingScore);
  }

  // Generate simulated score if not exists
  // Logic: Deterministic based on PAN to keep it consistent
  let seed = 0;
  for (let i = 0; i < user.pan_number.length; i++) {
    seed += user.pan_number.charCodeAt(i);
  }

  // Basic deterministic randomization
  const score = 300 + (seed * 1337 % 601); // Range 300-900
  let riskLevel = 'Medium';
  let explanation = 'Your score is moderate based on simulated financial patterns.';

  if (score >= 750) {
    riskLevel = 'Low';
    explanation = 'Excellent score! Your financial behavior indicates high reliability.';
  } else if (score < 500) {
    riskLevel = 'High';
    explanation = 'Your score is low. Consider improving your repayment history and credit utilization.';
  }

  const info = db.prepare('INSERT INTO credit_scores (user_id, pan_number, score, risk_level, explanation) VALUES (?, ?, ?, ?, ?)').run(
    userId, user.pan_number, score, riskLevel, explanation
  );

  res.json({
    id: info.lastInsertRowid,
    user_id: userId,
    pan_number: user.pan_number,
    score,
    risk_level: riskLevel,
    explanation,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/credit/history', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const history = db.prepare('SELECT * FROM credit_scores WHERE user_id = ? ORDER BY timestamp DESC').all(userId);
  res.json(history);
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
