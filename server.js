const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Google Gemini AI Setup
const { GoogleGenerativeAI } = require('@google/generative-ai');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
    answers TEXT NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (timing_id) REFERENCES timings(id)
  )`);
});

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// ========== AUTHENTICATION ==========

// Teacher Registration
app.post('/api/teacher/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    
    // Validation
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Check if username exists
    db.get('SELECT id FROM teachers WHERE username = ?', [username], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert teacher
      db.run('INSERT INTO teachers (username, password, name) VALUES (?, ?, ?)',
        [username, hashedPassword, name],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Registration failed' });
          }
          
          res.json({ 
            success: true, 
            message: 'Registration successful! You can now login.',
            id: this.lastID 
          });
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Teacher Login - FIXED
app.post('/api/teacher/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', username); // Debug log
  
  db.get('SELECT * FROM teachers WHERE username = ?', [username], async (err, teacher) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (!teacher) {
      console.log('Teacher not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    try {
      const validPassword = await bcrypt.compare(password, teacher.password);
      
      if (!validPassword) {
        console.log('Invalid password for:', username);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: teacher.id, username: teacher.username }, JWT_SECRET);
      
      console.log('Login successful:', username);
      
      // FIXED: Added success: true
      res.json({ 
        success: true,
        token: token, 
        name: teacher.name 
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Login failed' });
    }
  });
});

// ========== TEACHER DASHBOARD ==========

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

// Create Test
app.post('/api/teacher/tests', authenticateToken, (req, res) => {
  const { course_id, timing_id, month, unlock_start, unlock_end, duration_minutes } = req.body;
  const teacherId = req.user.id;
  
  db.run(`INSERT INTO tests (teacher_id, course_id, timing_id, month, unlock_start, unlock_end, duration_minutes) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [teacherId, course_id, timing_id, month, unlock_start || null, unlock_end || null, duration_minutes || 30],
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

// Get Questions for a Test
app.get('/api/teacher/tests/:testId/questions', authenticateToken, (req, res) => {
  const { testId } = req.params;
  const teacherId = req.user.id;
  
  // Verify test belongs to teacher
  db.get('SELECT id FROM tests WHERE id = ? AND teacher_id = ?', [testId, teacherId], (err, test) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!test) return res.status(404).json({ error: 'Test not found' });
    
    db.all('SELECT * FROM questions WHERE test_id = ?', [testId], (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(questions || []);
    });
  });
});

// Add Question
app.post('/api/teacher/questions', authenticateToken, (req, res) => {
  const { test_id, question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
  const teacherId = req.user.id;
  
  // Verify test belongs to teacher
  db.get('SELECT id FROM tests WHERE id = ? AND teacher_id = ?', [test_id, teacherId], (err, test) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!test) return res.status(404).json({ error: 'Test not found' });
    
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
  
  // Verify question belongs to teacher's test
  db.get(`SELECT q.id FROM questions q 
          JOIN tests t ON q.test_id = t.id 
          WHERE q.id = ? AND t.teacher_id = ?`, [id, teacherId], (err, question) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    db.run('DELETE FROM questions WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// Get Results
app.get('/api/teacher/results', authenticateToken, (req, res) => {
  const teacherId = req.user.id;
  const { month } = req.query;
  
  let query = `SELECT sa.*, c.name as course_name, tm.timing, t.month
               FROM student_attempts sa
               JOIN tests t ON sa.test_id = t.id
               JOIN courses c ON sa.course_id = c.id
               JOIN timings tm ON sa.timing_id = tm.id
               WHERE t.teacher_id = ?`;
  
  const params = [teacherId];
  
  if (month) {
    query += ' AND t.month = ?';
    params.push(month);
  }
  
  query += ' ORDER BY sa.completed_at DESC';
  
  db.all(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results || []);
  });
});

// Export Results as CSV
app.get('/api/teacher/results/export', authenticateToken, (req, res) => {
  const teacherId = req.user.id;
  const { month } = req.query;
  
  let query = `SELECT sa.student_id, sa.student_name, c.name as course, tm.timing, 
               t.month, sa.score, sa.total_questions, 
               ROUND((sa.score * 100.0 / sa.total_questions), 2) as percentage,
               sa.completed_at
               FROM student_attempts sa
               JOIN tests t ON sa.test_id = t.id
               JOIN courses c ON sa.course_id = c.id
               JOIN timings tm ON sa.timing_id = tm.id
               WHERE t.teacher_id = ?`;
  
  const params = [teacherId];
  
  if (month) {
    query += ' AND t.month = ?';
    params.push(month);
  }
  
  query += ' ORDER BY sa.completed_at DESC';
  
  db.all(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Create CSV
    let csv = 'Student ID,Student Name,Course,Timing,Month,Score,Total Questions,Percentage,Completed At\n';
    results.forEach(r => {
      csv += `${r.student_id},${r.student_name},${r.course},${r.timing},${r.month},${r.score},${r.total_questions},${r.percentage}%,${r.completed_at}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
    res.send(csv);
  });
});

// Reset Dashboard (Delete all student results only)
app.post('/api/teacher/reset', authenticateToken, (req, res) => {
  const teacherId = req.user.id;
  
  // Only delete student attempts for this teacher's tests
  db.run(`DELETE FROM student_attempts 
          WHERE test_id IN (SELECT id FROM tests WHERE teacher_id = ?)`,
    [teacherId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        success: true, 
        message: 'All student results have been deleted',
        deleted: this.changes 
      });
    }
  );
});

// ========== AI QUESTION GENERATOR ==========

app.post('/api/teacher/generate-questions', authenticateToken, async (req, res) => {
  try {
    const { test_id, topic, difficulty, count } = req.body;
    const teacherId = req.user.id;
    
    // Check if AI is enabled
    if (!genAI) {
      return res.status(503).json({ 
        error: 'AI features are not enabled. Please add GEMINI_API_KEY to .env file.' 
      });
    }
    
    // Validate inputs
    if (!test_id || !topic || !difficulty || !count) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (count < 1 || count > 20) {
      return res.status(400).json({ error: 'Count must be between 1 and 20' });
    }
    
    // Verify test belongs to teacher
    const test = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM tests WHERE id = ? AND teacher_id = ?', 
        [test_id, teacherId], 
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    // Generate questions using Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Generate ${count} multiple choice questions about "${topic}" with ${difficulty} difficulty level.

For each question, provide:
1. Question text
2. Four options (A, B, C, D)
3. Correct answer (A, B, C, or D)

Format the response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_answer": "A"
  }
]

Make sure:
- Questions are clear and educational
- Options are plausible and well-distributed
- Only one correct answer per question
- Difficulty matches the ${difficulty} level
- Questions are relevant to "${topic}"

Return ONLY the JSON array, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    let questions;
    try {
      // Extract JSON from response (remove markdown code blocks if present)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      questions = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return res.status(500).json({ 
        error: 'Failed to parse AI response. Please try again.' 
      });
    }
    
    // Validate and insert questions
    const insertedQuestions = [];
    for (const q of questions) {
      if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer) {
        continue; // Skip invalid questions
      }
      
      const result = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [test_id, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer.toUpperCase()],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });
      
      insertedQuestions.push({
        id: result.id,
        ...q
      });
    }
    
    res.json({ 
      success: true, 
      count: insertedQuestions.length,
      questions: insertedQuestions
    });
    
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions. Please try again.' 
    });
  }
});

// ========== STUDENT PORTAL ==========

// Get available options for students
app.get('/api/student/options', (req, res) => {
  db.all('SELECT DISTINCT id, name FROM courses', (err, courses) => {
    db.all('SELECT DISTINCT id, timing FROM timings', (err, timings) => {
      res.json({
        courses: courses || [],
        timings: timings || []
      });
    });
  });
});

// Check if test is available
app.post('/api/student/tests', (req, res) => {
  const { course_id, timing_id, month } = req.body;
  
  db.get(`SELECT t.*, c.name as course_name, tm.timing 
          FROM tests t 
          JOIN courses c ON t.course_id = c.id 
          JOIN timings tm ON t.timing_id = tm.id 
          WHERE t.course_id = ? AND t.timing_id = ? AND t.month = ?`,
    [course_id, timing_id, month],
    (err, test) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!test) return res.json({ available: false, message: 'No test found for this selection' });
      
      // Check unlock dates
      const now = new Date();
      if (test.unlock_start && new Date(test.unlock_start) > now) {
        return res.json({ 
          available: false, 
          message: `Test will be available from ${test.unlock_start}` 
        });
      }
      if (test.unlock_end && new Date(test.unlock_end) < now) {
        return res.json({ 
          available: false, 
          message: `Test was available until ${test.unlock_end}` 
        });
      }
      
      // Get questions
      db.all('SELECT * FROM questions WHERE test_id = ?', [test.id], (err, questions) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Allow test with any number of questions (removed minimum check)
        res.json({ 
          available: true, 
          test: {
            ...test,
            questions: questions
          }
        });
      });
    }
  );
});

// Submit test
app.post('/api/student/submit', (req, res) => {
  const { test_id, student_id, student_name, course_id, timing_id, month, answers } = req.body;
  
  // Get questions to calculate score
  db.all('SELECT * FROM questions WHERE test_id = ?', [test_id], (err, questions) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
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
          score: score,
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
  
  // Check AI status
  if (genAI && GEMINI_API_KEY) {
    console.log('🤖 AI Features: ENABLED ✅');
  } else {
    console.log('🤖 AI Features: DISABLED ⚠️');
    console.log('   To enable AI: Add GEMINI_API_KEY to .env file');
    console.log('   Get free key: https://makersuite.google.com/app/apikey');
  }
});
