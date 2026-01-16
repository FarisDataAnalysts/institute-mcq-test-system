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
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
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
  try {
    const { username, password, name } = req.body;
    
    // Validation
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    if (name.length < 3) {
      return res.status(400).json({ error: 'Name must be at least 3 characters' });
    }
    
    // Check if username already exists
    db.get('SELECT id FROM teachers WHERE username = ?', [username], async (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      
      if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new teacher
      db.run('INSERT INTO teachers (username, password, name) VALUES (?, ?, ?)',
        [username, hashedPassword, name],
        function(err) {
          if (err) {
            console.error('Registration error:', err);
            return res.status(500).json({ error: 'Registration failed: ' + err.message });
          }
          
          const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
          res.json({ success: true, token, name });
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
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
    [id, teacherId], (err, result) => {
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
    [id, teacherId], (err, result) => {
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

// Add Test
app.post('/api/teacher/tests', authenticateToken, (req, res) => {
  const { course_id, timing_id, month, unlock_start, unlock_end, duration_minutes } = req.body;
  const teacherId = req.user.id;
  
  db.run(`INSERT INTO tests (teacher_id, course_id, timing_id, month, unlock_start, unlock_end, duration_minutes) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [teacherId, course_id, timing_id, month, unlock_start, unlock_end, duration_minutes || 30],
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
  
  db.run('DELETE FROM tests WHERE id = ? AND teacher_id = ?', 
    [id, teacherId], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Get Test Questions
app.get('/api/teacher/tests/:id/questions', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM questions WHERE test_id = ?', [id], (err, questions) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(questions || []);
  });
});

// Add Question
app.post('/api/teacher/questions', authenticateToken, (req, res) => {
  const { test_id, question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
  
  db.run(`INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [test_id, question_text, option_a, option_b, option_c, option_d, correct_answer],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// AI Question Generator (Teacher Only)
app.post('/api/teacher/ai/generate-questions', authenticateToken, async (req, res) => {
  try {
    const { topic, difficulty, count, test_id } = req.body;
    
    if (!topic || !count) {
      return res.status(400).json({ error: 'Topic and count are required' });
    }
    
    // This is a placeholder - you'll need to integrate with OpenAI/Gemini API
    // For now, returning mock data
    const mockQuestions = [];
    for (let i = 1; i <= count; i++) {
      mockQuestions.push({
        question_text: `AI Generated Question ${i} about ${topic}`,
        option_a: 'Option A',
        option_b: 'Option B',
        option_c: 'Option C',
        option_d: 'Option D',
        correct_answer: 'A'
      });
    }
    
    // If test_id provided, save questions directly
    if (test_id) {
      const stmt = db.prepare(`INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer) 
                               VALUES (?, ?, ?, ?, ?, ?, ?)`);
      
      mockQuestions.forEach(q => {
        stmt.run(test_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer);
      });
      
      stmt.finalize();
    }
    
    res.json({ 
      success: true, 
      questions: mockQuestions,
      message: 'AI questions generated successfully. Note: This is a demo version. Integrate OpenAI/Gemini for real AI generation.'
    });
    
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate questions: ' + error.message });
  }
});

// Delete Question
app.delete('/api/teacher/questions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM questions WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Get Results
app.get('/api/teacher/results', authenticateToken, (req, res) => {
  const { month } = req.query;
  const teacherId = req.user.id;
  
  let query = `SELECT sa.*, c.name as course_name, t.timing 
               FROM student_attempts sa
               JOIN courses c ON sa.course_id = c.id
               JOIN timings t ON sa.timing_id = t.id
               JOIN tests ts ON sa.test_id = ts.id
               WHERE ts.teacher_id = ?`;
  
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

// Export Results to CSV
app.get('/api/teacher/results/export', authenticateToken, (req, res) => {
  const { month } = req.query;
  const teacherId = req.user.id;
  
  let query = `SELECT sa.*, c.name as course_name, t.timing 
               FROM student_attempts sa
               JOIN courses c ON sa.course_id = c.id
               JOIN timings t ON sa.timing_id = t.id
               JOIN tests ts ON sa.test_id = ts.id
               WHERE ts.teacher_id = ?`;
  
  const params = [teacherId];
  
  if (month) {
    query += ' AND sa.month = ?';
    params.push(month);
  }
  
  query += ' ORDER BY sa.completed_at DESC';
  
  db.all(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Create CSV
    let csv = 'Student ID,Student Name,Course,Timing,Month,Score,Total Questions,Percentage,Date\n';
    
    results.forEach(r => {
      const percentage = ((r.score / r.total_questions) * 100).toFixed(2);
      csv += `${r.student_id},${r.student_name},${r.course_name},${r.timing},${r.month},${r.score},${r.total_questions},${percentage}%,${new Date(r.completed_at).toLocaleString()}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=results_${month || 'all'}.csv`);
    res.send(csv);
  });
});

// Reset Dashboard (Clear Results Only)
app.post('/api/teacher/reset', authenticateToken, (req, res) => {
  const teacherId = req.user.id;
  
  // Only delete student attempts for this teacher's tests
  db.run(`DELETE FROM student_attempts 
          WHERE test_id IN (SELECT id FROM tests WHERE teacher_id = ?)`,
    [teacherId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, deleted_results: this.changes });
    }
  );
});

// ============ STUDENT ROUTES ============

// Get Student Options
app.get('/api/student/options', (req, res) => {
  db.all('SELECT DISTINCT id, name FROM courses', [], (err, courses) => {
    db.all('SELECT DISTINCT id, timing FROM timings', [], (err, timings) => {
      res.json({
        courses: courses || [],
        timings: timings || []
      });
    });
  });
});

// Check Test Availability
app.post('/api/student/tests', (req, res) => {
  const { course_id, timing_id, month } = req.body;
  
  db.get(`SELECT * FROM tests 
          WHERE course_id = ? AND timing_id = ? AND month = ? AND is_active = 1`,
    [course_id, timing_id, month],
    (err, test) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!test) return res.json({ available: false, message: 'No test available for this selection' });
      
      // Check unlock dates
      const now = new Date();
      if (test.unlock_start && new Date(test.unlock_start) > now) {
        return res.json({ available: false, message: 'Test not yet unlocked' });
      }
      if (test.unlock_end && new Date(test.unlock_end) < now) {
        return res.json({ available: false, message: 'Test period has ended' });
      }
      
      // Get questions - MINIMUM 1 QUESTION REQUIRED
      db.all('SELECT * FROM questions WHERE test_id = ?', [test.id], (err, questions) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (!questions || questions.length < 1) {
          return res.json({ 
            available: false, 
            message: 'Test has no questions yet. Please contact your teacher.' 
          });
        }
        
        res.json({ 
          available: true, 
          test: {
            id: test.id,
            duration_minutes: test.duration_minutes,
            total_questions: questions.length
          }
        });
      });
    }
  );
});

// Get Test Questions
app.post('/api/student/start-test', (req, res) => {
  const { test_id } = req.body;
  
  db.all('SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE test_id = ?', 
    [test_id], 
    (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(questions || []);
    }
  );
});

// Submit Test
app.post('/api/student/submit-test', (req, res) => {
  const { test_id, student_id, student_name, course_id, timing_id, month, answers } = req.body;
  
  // Get correct answers
  db.all('SELECT id, correct_answer FROM questions WHERE test_id = ?', [test_id], (err, questions) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Calculate score
    let score = 0;
    const questionMap = {};
    questions.forEach(q => {
      questionMap[q.id] = q.correct_answer;
    });
    
    Object.keys(answers).forEach(qId => {
      if (answers[qId] === questionMap[qId]) {
        score++;
      }
    });
    
    // Save attempt
    db.run(`INSERT INTO student_attempts 
            (test_id, student_id, student_name, course_id, timing_id, month, score, total_questions, answers) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [test_id, student_id, student_name, course_id, timing_id, month, score, questions.length, JSON.stringify(answers)],
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

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});