const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database Setup
const db = new sqlite3.Database('./data/database.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('✅ Connected to database');
});

// Create Tables
db.serialize(() => {
  // Teachers table
  db.run(`CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    is_active INTEGER DEFAULT 1,
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
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
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
    answers TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id)
  )`);
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ============ AUTH ROUTES ============

// Teacher Login
app.post('/api/teacher/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM teachers WHERE username = ?', [username], async (err, teacher) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!teacher) return res.status(401).json({ error: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, teacher.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: teacher.id, username: teacher.username }, JWT_SECRET);
    res.json({ success: true, token, name: teacher.name });
  });
});

// Teacher Registration
app.post('/api/teacher/register', async (req, res) => {
  const { username, password, name } = req.body;
  
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run('INSERT INTO teachers (username, password, name) VALUES (?, ?, ?)',
    [username, hashedPassword, name],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
      res.json({ success: true, token, name });
    }
  );
});

// ============ TEACHER ROUTES ============

// Get Dashboard Data
app.get('/api/teacher/dashboard', authenticateToken, (req, res) => {
  const teacherId = req.user.id;
  
  db.all('SELECT * FROM courses WHERE teacher_id = ?', [teacherId], (err, courses) => {
    db.all('SELECT * FROM timings WHERE teacher_id = ?', [teacherId], (err, timings) => {
      db.all(`SELECT t.*, c.name as course_name, tm.timing 
              FROM tests t 
              JOIN courses c ON t.course_id = c.id 
              JOIN timings tm ON t.timing_id = tm.id 
              WHERE t.teacher_id = ?`, [teacherId], (err, tests) => {
        res.json({
          courses: courses || [],
          timings: timings || [],
          tests: tests || []
        });
      });
    });
  });
});

// Add Course
app.post('/api/teacher/courses', authenticateToken, (req, res) => {
  const { name } = req.body;
  const teacherId = req.user.id;
  
  db.run('INSERT INTO courses (teacher_id, name) VALUES (?, ?)',
    [teacherId, name],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Delete Course
app.delete('/api/teacher/courses/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const teacherId = req.user.id;
  
  // Check if course has tests
  db.get('SELECT COUNT(*) as count FROM tests WHERE course_id = ? AND teacher_id = ?',
    [id, teacherId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (result.count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete course with existing tests. Delete tests first.' 
        });
      }
      
      db.run('DELETE FROM courses WHERE id = ? AND teacher_id = ?',
        [id, teacherId],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        }
      );
    }
  );
});

// Add Timing
app.post('/api/teacher/timings', authenticateToken, (req, res) => {
  const { timing } = req.body;
  const teacherId = req.user.id;
  
  db.run('INSERT INTO timings (teacher_id, timing) VALUES (?, ?)',
    [teacherId, timing],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Delete Timing
app.delete('/api/teacher/timings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const teacherId = req.user.id;
  
  // Check if timing has tests
  db.get('SELECT COUNT(*) as count FROM tests WHERE timing_id = ? AND teacher_id = ?',
    [id, teacherId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (result.count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete timing with existing tests. Delete tests first.' 
        });
      }
      
      db.run('DELETE FROM timings WHERE id = ? AND teacher_id = ?',
        [id, teacherId],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        }
      );
    }
  );
});

// Create Test
app.post('/api/teacher/tests', authenticateToken, (req, res) => {
  const { course_id, timing_id, month, unlock_start, unlock_end, duration_minutes } = req.body;
  const teacherId = req.user.id;
  
  db.run(`INSERT INTO tests (teacher_id, course_id, timing_id, month, unlock_start, unlock_end, duration_minutes)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [teacherId, course_id, timing_id, month, unlock_start, unlock_end, duration_minutes],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Delete Test
app.delete('/api/teacher/tests/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const teacherId = req.user.id;
  
  // First delete all questions for this test
  db.run('DELETE FROM questions WHERE test_id IN (SELECT id FROM tests WHERE id = ? AND teacher_id = ?)',
    [id, teacherId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Then delete the test
      db.run('DELETE FROM tests WHERE id = ? AND teacher_id = ?',
        [id, teacherId],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        }
      );
    }
  );
});

// Get Test Questions
app.get('/api/teacher/tests/:testId/questions', authenticateToken, (req, res) => {
  const { testId } = req.params;
  const teacherId = req.user.id;
  
  db.all(`SELECT q.* FROM questions q 
          JOIN tests t ON q.test_id = t.id 
          WHERE q.test_id = ? AND t.teacher_id = ?`,
    [testId, teacherId],
    (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(questions || []);
    }
  );
});

// Add Question
app.post('/api/teacher/questions', authenticateToken, (req, res) => {
  const { test_id, question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
  const teacherId = req.user.id;
  
  // Verify test belongs to teacher
  db.get('SELECT id FROM tests WHERE id = ? AND teacher_id = ?', [test_id, teacherId], (err, test) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!test) return res.status(403).json({ error: 'Unauthorized' });
    
    db.run(`INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [test_id, question_text, option_a, option_b, option_c, option_d, correct_answer],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      }
    );
  });
});

// Delete Question
app.delete('/api/teacher/questions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const teacherId = req.user.id;
  
  db.run(`DELETE FROM questions WHERE id = ? AND test_id IN 
          (SELECT id FROM tests WHERE teacher_id = ?)`,
    [id, teacherId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Get Results
app.get('/api/teacher/results', authenticateToken, (req, res) => {
  const teacherId = req.user.id;
  const { month } = req.query;
  
  let query = `SELECT sa.*, c.name as course_name, tm.timing 
               FROM student_attempts sa
               JOIN tests t ON sa.test_id = t.id
               JOIN courses c ON sa.course_id = c.id
               JOIN timings tm ON sa.timing_id = tm.id
               WHERE t.teacher_id = ?`;
  
  const params = [teacherId];
  
  if (month) {
    query += ' AND sa.month = ?';
    params.push(month);
  }
  
  query += ' ORDER BY sa.completed_at DESC';
  
  db.all(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results || []);
  });
});

// Export Results to Excel
app.get('/api/teacher/results/export', authenticateToken, (req, res) => {
  const teacherId = req.user.id;
  const { month } = req.query;
  
  let query = `SELECT sa.*, c.name as course_name, tm.timing 
               FROM student_attempts sa
               JOIN tests t ON sa.test_id = t.id
               JOIN courses c ON sa.course_id = c.id
               JOIN timings tm ON sa.timing_id = tm.id
               WHERE t.teacher_id = ?`;
  
  const params = [teacherId];
  
  if (month) {
    query += ' AND sa.month = ?';
    params.push(month);
  }
  
  query += ' ORDER BY sa.student_id, sa.course_id, sa.timing_id, sa.month';
  
  db.all(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Group by student, course, timing
    const grouped = {};
    
    results.forEach(r => {
      const key = `${r.student_id}_${r.course_name}_${r.timing}`;
      if (!grouped[key]) {
        grouped[key] = {
          student_id: r.student_id,
          student_name: r.student_name,
          course: r.course_name,
          timing: r.timing,
          months: {}
        };
      }
      
      const percentage = ((r.score / r.total_questions) * 100).toFixed(2);
      grouped[key].months[r.month] = `${r.score}/${r.total_questions} (${percentage}%)`;
    });
    
    // Convert to CSV
    let csv = 'ID,Name,Course,Timing,Month 1,Month 2,Month 3,Month 4\n';
    
    Object.values(grouped).forEach(student => {
      csv += `${student.student_id},${student.student_name},${student.course},${student.timing},`;
      csv += `${student.months[1] || '-'},`;
      csv += `${student.months[2] || '-'},`;
      csv += `${student.months[3] || '-'},`;
      csv += `${student.months[4] || '-'}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
    res.send(csv);
  });
});

// Reset Dashboard - Delete ONLY student results, keep everything else
app.post('/api/teacher/reset', authenticateToken, (req, res) => {
  const teacherId = req.user.id;
  
  // Only delete student attempts for this teacher's tests
  db.run(`DELETE FROM student_attempts WHERE test_id IN 
          (SELECT id FROM tests WHERE teacher_id = ?)`,
    [teacherId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        success: true, 
        message: 'Student results cleared. Courses, tests, and questions are preserved.',
        deleted_results: this.changes
      });
    }
  );
});

// ============ STUDENT ROUTES ============

// Get Available Tests (NO MINIMUM QUESTIONS CHECK)
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
      
      // Get question count (no minimum check)
      db.get('SELECT COUNT(*) as count FROM questions WHERE test_id = ?', [test.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (result.count === 0) {
          return res.json({ 
            available: false, 
            message: 'Test has no questions yet. Please contact your teacher.' 
          });
        }
        
        test.question_count = result.count;
        res.json({ available: true, test });
      });
    }
  );
});

// Get Test Questions (NO MINIMUM CHECK)
app.post('/api/student/test/:testId/start', (req, res) => {
  const { testId } = req.params;
  
  db.all('SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE test_id = ?',
    [testId],
    (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (questions.length === 0) {
        return res.status(400).json({ error: 'Test has no questions' });
      }
      
      // Shuffle questions
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
  console.log(`📝 Register your teacher account at /index.html\n`);
});