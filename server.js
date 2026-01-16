const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Database Setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('✅ Connected to SQLite database');
});

// Create Tables
db.serialize(() => {
  // Organizations
  db.run(`CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Teachers
  db.run(`CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id)
  )`);

  // Courses
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
  )`);

  // Timings
  db.run(`CREATE TABLE IF NOT EXISTS timings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    timing TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
  )`);

  // Tests
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

  // Questions
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

  // Student Attempts
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
  
  db.get('SELECT * FROM teachers WHERE username = ?', [username], (err, teacher) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!teacher) return res.status(401).json({ error: 'Invalid credentials' });
    
    bcrypt.compare(password, teacher.password, (err, match) => {
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      
      const token = jwt.sign(
        { teacherId: teacher.id, orgId: teacher.org_id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ 
        success: true, 
        token,
        teacher: { id: teacher.id, name: teacher.name, username: teacher.username }
      });
    });
  });
});

// Teacher Registration
app.post('/api/teacher/register', (req, res) => {
  const { name, username, password } = req.body;
  
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  db.get('SELECT id FROM teachers WHERE username = ?', [username], (err, existing) => {
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    db.get('SELECT id FROM organizations LIMIT 1', (err, org) => {
      if (!org) {
        db.run('INSERT INTO organizations (name) VALUES (?)', ['Default Institute'], function() {
          createTeacher(this.lastID);
        });
      } else {
        createTeacher(org.id);
      }
    });
    
    function createTeacher(orgId) {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Error creating account' });
        
        db.run(
          'INSERT INTO teachers (org_id, username, password, name) VALUES (?, ?, ?, ?)',
          [orgId, username, hash, name],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ 
              success: true, 
              message: 'Registration successful',
              teacherId: this.lastID
            });
          }
        );
      });
    }
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

// Delete Course
app.delete('/api/teacher/courses/:courseId', authenticateTeacher, (req, res) => {
  const { courseId } = req.params;
  
  db.get('SELECT * FROM courses WHERE id = ? AND teacher_id = ?', 
    [courseId, req.teacherId], 
    (err, course) => {
      if (!course) return res.status(403).json({ error: 'Unauthorized' });
      
      db.get('SELECT COUNT(*) as count FROM tests WHERE course_id = ?', 
        [courseId], 
        (err, result) => {
          if (result.count > 0) {
            return res.status(400).json({ 
              error: 'Cannot delete course with existing tests. Delete tests first.' 
            });
          }
          
          db.run('DELETE FROM courses WHERE id = ?', [courseId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
          });
        }
      );
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

// Delete Timing
app.delete('/api/teacher/timings/:timingId', authenticateTeacher, (req, res) => {
  const { timingId } = req.params;
  
  db.get('SELECT * FROM timings WHERE id = ? AND teacher_id = ?', 
    [timingId, req.teacherId], 
    (err, timing) => {
      if (!timing) return res.status(403).json({ error: 'Unauthorized' });
      
      db.get('SELECT COUNT(*) as count FROM tests WHERE timing_id = ?', 
        [timingId], 
        (err, result) => {
          if (result.count > 0) {
            return res.status(400).json({ 
              error: 'Cannot delete timing with existing tests. Delete tests first.' 
            });
          }
          
          db.run('DELETE FROM timings WHERE id = ?', [timingId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
          });
        }
      );
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
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Delete Test
app.delete('/api/teacher/tests/:testId', authenticateTeacher, (req, res) => {
  const { testId } = req.params;
  
  db.get('SELECT * FROM tests WHERE id = ? AND teacher_id = ?', 
    [testId, req.teacherId], 
    (err, test) => {
      if (!test) return res.status(403).json({ error: 'Unauthorized' });
      
      db.run('DELETE FROM questions WHERE test_id = ?', [testId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run('DELETE FROM tests WHERE id = ?', [testId], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        });
      });
    }
  );
});

// Get Test Questions
app.get('/api/teacher/tests/:testId/questions', authenticateTeacher, (req, res) => {
  const { testId } = req.params;
  
  db.get('SELECT * FROM tests WHERE id = ? AND teacher_id = ?', 
    [testId, req.teacherId], 
    (err, test) => {
      if (!test) return res.status(403).json({ error: 'Unauthorized' });
      
      db.all('SELECT * FROM questions WHERE test_id = ?', [testId], (err, questions) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(questions || []);
      });
    }
  );
});

// Add Question
app.post('/api/teacher/questions', authenticateTeacher, (req, res) => {
  const { test_id, question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
  
  db.get('SELECT * FROM tests WHERE id = ? AND teacher_id = ?', 
    [test_id, req.teacherId], 
    (err, test) => {
      if (!test) return res.status(403).json({ error: 'Unauthorized' });
      
      db.run(`INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [test_id, question_text, option_a, option_b, option_c, option_d, correct_answer],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, id: this.lastID });
        }
      );
    }
  );
});

// Delete Question
app.delete('/api/teacher/questions/:questionId', authenticateTeacher, (req, res) => {
  const { questionId } = req.params;
  
  db.get(`SELECT q.*, t.teacher_id 
          FROM questions q 
          JOIN tests t ON q.test_id = t.id 
          WHERE q.id = ?`, 
    [questionId], 
    (err, question) => {
      if (!question || question.teacher_id !== req.teacherId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      db.run('DELETE FROM questions WHERE id = ?', [questionId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    }
  );
});

// Get Results
app.get('/api/teacher/results', authenticateTeacher, (req, res) => {
  const { month } = req.query;
  
  let query = `SELECT sa.*, c.name as course_name, tm.timing 
               FROM student_attempts sa
               JOIN tests t ON sa.test_id = t.id
               JOIN courses c ON sa.course_id = c.id
               JOIN timings tm ON sa.timing_id = tm.id
               WHERE t.teacher_id = ?`;
  
  const params = [req.teacherId];
  
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
app.get('/api/teacher/results/export', authenticateTeacher, (req, res) => {
  const { month } = req.query;
  
  let query = `SELECT sa.student_id, sa.student_name, c.name as course_name, tm.timing, sa.month, sa.score, sa.total_questions
               FROM student_attempts sa
               JOIN tests t ON sa.test_id = t.id
               JOIN courses c ON sa.course_id = c.id
               JOIN timings tm ON sa.timing_id = tm.id
               WHERE t.teacher_id = ?`;
  
  const params = [req.teacherId];
  
  if (month) {
    query += ' AND sa.month = ?';
    params.push(month);
  }
  
  query += ' ORDER BY sa.student_id, sa.month';
  
  db.all(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Group by student
    const studentMap = {};
    
    results.forEach(r => {
      const key = `${r.student_id}_${r.course_name}_${r.timing}`;
      
      if (!studentMap[key]) {
        studentMap[key] = {
          student_id: r.student_id,
          student_name: r.student_name,
          course: r.course_name,
          timing: r.timing,
          month1: '',
          month2: '',
          month3: '',
          month4: ''
        };
      }
      
      const percentage = ((r.score / r.total_questions) * 100).toFixed(2);
      studentMap[key][`month${r.month}`] = `${r.score}/${r.total_questions} (${percentage}%)`;
    });
    
    // Convert to CSV
    const students = Object.values(studentMap);
    
    let csv = 'ID,Name,Course,Timing,Month 1,Month 2,Month 3,Month 4\n';
    
    students.forEach(s => {
      csv += `${s.student_id},"${s.student_name}","${s.course}","${s.timing}",${s.month1},${s.month2},${s.month3},${s.month4}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
    res.send(csv);
  });
});

// Reset Dashboard (Clear all data for teacher)
app.post('/api/teacher/reset', authenticateTeacher, (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM student_attempts WHERE test_id IN (SELECT id FROM tests WHERE teacher_id = ?)', [req.teacherId]);
    db.run('DELETE FROM questions WHERE test_id IN (SELECT id FROM tests WHERE teacher_id = ?)', [req.teacherId]);
    db.run('DELETE FROM tests WHERE teacher_id = ?', [req.teacherId]);
    db.run('DELETE FROM courses WHERE teacher_id = ?', [req.teacherId]);
    db.run('DELETE FROM timings WHERE teacher_id = ?', [req.teacherId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Dashboard reset successfully' });
    });
  });
});

// ============ STUDENT ROUTES ============

// Get Available Tests
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
      
      // Check if test has minimum 10 questions
      db.get('SELECT COUNT(*) as count FROM questions WHERE test_id = ?', [test.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (result.count < 10) {
          return res.json({ 
            available: false, 
            message: 'Test is not ready yet. Please contact your teacher.' 
          });
        }
        
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
      
      if (questions.length < 10) {
        return res.status(400).json({ error: 'Test does not have enough questions' });
      }
      
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