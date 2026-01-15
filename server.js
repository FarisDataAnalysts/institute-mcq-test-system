const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Database Setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Database error:', err);
  console.log('✅ Database connected');
});

// Create Tables
db.serialize(() => {
  // Organizations table
  db.run(`CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Teachers table
  db.run(`CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id)
  )`);

  // Courses table
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
  )`);

  // Timings table
  db.run(`CREATE TABLE IF NOT EXISTS timings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    timing TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
  )`);

  // Tests table
  db.run(`CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    timing_id INTEGER NOT NULL,
    month INTEGER NOT NULL,
    unlock_start DATE,
    unlock_end DATE,
    duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (timing_id) REFERENCES timings(id)
  )`);

  // Questions table
  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id)
  )`);

  // Student Attempts table
  db.run(`CREATE TABLE IF NOT EXISTS student_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    course_id INTEGER NOT NULL,
    timing_id INTEGER NOT NULL,
    month INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers TEXT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (test_id) REFERENCES tests(id)
  )`);

  // Create demo data
  db.get("SELECT COUNT(*) as count FROM organizations", (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO organizations (name) VALUES ('Demo Institute')`, function() {
        const orgId = this.lastID;
        bcrypt.hash('teacher123', 10, (err, hash) => {
          db.run(`INSERT INTO teachers (org_id, username, password, name) VALUES (?, ?, ?, ?)`,
            [orgId, 'teacher1', hash, 'Mr. Ahmed'], function() {
              const teacherId = this.lastID;
              db.run(`INSERT INTO courses (teacher_id, name) VALUES (?, 'Mathematics')`, [teacherId]);
              db.run(`INSERT INTO courses (teacher_id, name) VALUES (?, 'Physics')`, [teacherId]);
              db.run(`INSERT INTO timings (teacher_id, timing) VALUES (?, 'Morning (8AM-12PM)')`, [teacherId]);
              db.run(`INSERT INTO timings (teacher_id, timing) VALUES (?, 'Evening (2PM-6PM)')`, [teacherId]);
              console.log('✅ Demo data created');
              console.log('📝 Demo Login: teacher1 / teacher123');
            });
        });
      });
    }
  });
});

// Auth Middleware
const authenticateTeacher = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.teacherId = decoded.teacherId;
    req.orgId = decoded.orgId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ TEACHER ROUTES ============

// Teacher Login
app.post('/api/teacher/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM teachers WHERE username = ?', [username], async (err, teacher) => {
    if (err || !teacher) return res.status(401).json({ error: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, teacher.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign(
      { teacherId: teacher.id, orgId: teacher.org_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.cookie('token', token, { httpOnly: true });
    res.json({ success: true, token, teacher: { id: teacher.id, name: teacher.name } });
  });
});

// Get Teacher Dashboard Data
app.get('/api/teacher/dashboard', authenticateTeacher, (req, res) => {
  const data = {};
  
  db.all('SELECT * FROM courses WHERE teacher_id = ?', [req.teacherId], (err, courses) => {
    data.courses = courses || [];
    
    db.all('SELECT * FROM timings WHERE teacher_id = ?', [req.teacherId], (err, timings) => {
      data.timings = timings || [];
      
      db.all(`SELECT t.*, c.name as course_name, tm.timing 
              FROM tests t 
              JOIN courses c ON t.course_id = c.id 
              JOIN timings tm ON t.timing_id = tm.id 
              WHERE t.teacher_id = ?`, [req.teacherId], (err, tests) => {
        data.tests = tests || [];
        res.json(data);
      });
    });
  });
});

// Add Course
app.post('/api/teacher/courses', authenticateTeacher, (req, res) => {
  const { name } = req.body;
  db.run('INSERT INTO courses (teacher_id, name) VALUES (?, ?)',
    [req.teacherId, name],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Add Timing
app.post('/api/teacher/timings', authenticateTeacher, (req, res) => {
  const { timing } = req.body;
  db.run('INSERT INTO timings (teacher_id, timing) VALUES (?, ?)',
    [req.teacherId, timing],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Create Test
app.post('/api/teacher/tests', authenticateTeacher, (req, res) => {
  const { course_id, timing_id, month, unlock_start, unlock_end, duration_minutes } = req.body;
  
  db.run(`INSERT INTO tests (teacher_id, course_id, timing_id, month, unlock_start, unlock_end, duration_minutes)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.teacherId, course_id, timing_id, month, unlock_start, unlock_end, duration_minutes || 30],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, testId: this.lastID });
    }
  );
});

// Add Question
app.post('/api/teacher/questions', authenticateTeacher, (req, res) => {
  const { test_id, question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
  
  db.get('SELECT * FROM tests WHERE id = ? AND teacher_id = ?', [test_id, req.teacherId], (err, test) => {
    if (!test) return res.status(403).json({ error: 'Unauthorized' });
    
    db.run(`INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [test_id, question_text, option_a, option_b, option_c, option_d, correct_answer],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, questionId: this.lastID });
      }
    );
  });
});

// Get Questions for Test
app.get('/api/teacher/tests/:testId/questions', authenticateTeacher, (req, res) => {
  const { testId } = req.params;
  
  db.get('SELECT * FROM tests WHERE id = ? AND teacher_id = ?', [testId, req.teacherId], (err, test) => {
    if (!test) return res.status(403).json({ error: 'Unauthorized' });
    
    db.all('SELECT * FROM questions WHERE test_id = ?', [testId], (err, questions) => {
      res.json(questions || []);
    });
  });
});

// Delete Question
app.delete('/api/teacher/questions/:questionId', authenticateTeacher, (req, res) => {
  const { questionId } = req.params;
  
  db.run(`DELETE FROM questions 
          WHERE id = ? AND test_id IN (SELECT id FROM tests WHERE teacher_id = ?)`,
    [questionId, req.teacherId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Get Results
app.get('/api/teacher/results', authenticateTeacher, (req, res) => {
  const { month } = req.query;
  
  let query = `SELECT sa.*, c.name as course_name, t.timing 
               FROM student_attempts sa
               JOIN tests test ON sa.test_id = test.id
               JOIN courses c ON sa.course_id = c.id
               JOIN timings t ON sa.timing_id = t.id
               WHERE test.teacher_id = ?`;
  
  const params = [req.teacherId];
  
  if (month) {
    query += ' AND sa.month = ?';
    params.push(month);
  }
  
  query += ' ORDER BY sa.completed_at DESC';
  
  db.all(query, params, (err, results) => {
    res.json(results || []);
  });
});

// Export Results to CSV
app.get('/api/teacher/results/export', authenticateTeacher, (req, res) => {
  const { month } = req.query;
  
  let query = `SELECT sa.student_id, sa.student_name, c.name as course, t.timing, 
               sa.month, sa.score, sa.total_questions, 
               ROUND((sa.score * 100.0 / sa.total_questions), 2) as percentage,
               sa.completed_at
               FROM student_attempts sa
               JOIN tests test ON sa.test_id = test.id
               JOIN courses c ON sa.course_id = c.id
               JOIN timings t ON sa.timing_id = t.id
               WHERE test.teacher_id = ?`;
  
  const params = [req.teacherId];
  
  if (month) {
    query += ' AND sa.month = ?';
    params.push(month);
  }
  
  query += ' ORDER BY sa.month, sa.completed_at';
  
  db.all(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let csv = 'Student ID,Student Name,Course,Timing,Month,Score,Total Questions,Percentage,Completed At\n';
    results.forEach(row => {
      csv += `${row.student_id},${row.student_name},${row.course},${row.timing},${row.month},${row.score},${row.total_questions},${row.percentage}%,${row.completed_at}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=results_month_${month || 'all'}.csv`);
    res.send(csv);
  });
});

// ============ STUDENT ROUTES ============

// Get Available Tests for Student
app.post('/api/student/tests', (req, res) => {
  const { course_id, timing_id, month } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  db.get(`SELECT t.*, c.name as course_name, tm.timing 
          FROM tests t
          JOIN courses c ON t.course_id = c.id
          JOIN timings tm ON t.timing_id = tm.id
          WHERE t.course_id = ? AND t.timing_id = ? AND t.month = ?
          AND t.is_active = 1
          AND (t.unlock_start IS NULL OR t.unlock_start <= ?)
          AND (t.unlock_end IS NULL OR t.unlock_end >= ?)`,
    [course_id, timing_id, month, today, today],
    (err, test) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!test) return res.json({ available: false, message: 'Test is not available at this time' });
      
      db.get('SELECT COUNT(*) as count FROM questions WHERE test_id = ?', [test.id], (err, result) => {
        test.question_count = result.count;
        res.json({ available: true, test });
      });
    }
  );
});

// Get Test Questions
app.post('/api/student/test/:testId/start', (req, res) => {
  const { testId } = req.params;
  
  db.all('SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE test_id = ?',
    [testId],
    (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      questions.sort(() => Math.random() - 0.5);
      res.json({ questions });
    }
  );
});

// Submit Test
app.post('/api/student/test/:testId/submit', (req, res) => {
  const { testId } = req.params;
  const { student_id, student_name, course_id, timing_id, month, answers } = req.body;
  
  db.all('SELECT id, correct_answer FROM questions WHERE test_id = ?', [testId], (err, questions) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let score = 0;
    const answerMap = JSON.parse(answers);
    
    questions.forEach(q => {
      if (answerMap[q.id] === q.correct_answer) score++;
    });
    
    db.run(`INSERT INTO student_attempts 
            (test_id, student_id, student_name, course_id, timing_id, month, score, total_questions, answers, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [testId, student_id, student_name, course_id, timing_id, month, score, questions.length, answers],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({
          success: true,
          score,
          total: questions.length,
          percentage: ((score / questions.length) * 100).toFixed(2)
        });
      }
    );
  });
});

// Get Courses and Timings for Student
app.get('/api/student/options', (req, res) => {
  db.all('SELECT DISTINCT c.* FROM courses c JOIN tests t ON c.id = t.course_id WHERE t.is_active = 1',
    (err, courses) => {
      db.all('SELECT DISTINCT tm.* FROM timings tm JOIN tests t ON tm.id = t.timing_id WHERE t.is_active = 1',
        (err, timings) => {
          res.json({ courses: courses || [], timings: timings || [] });
        }
      );
    }
  );
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Demo Login: teacher1 / teacher123\n`);
});