const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Google Gemini AI Setup
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDGVJriOXSD-Zy-bLPKe-Zy8xQZ9Z9Z9Z9');

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

// Teacher Login
app.post('/api/teacher/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM teachers WHERE username = ?', [username], async (err, teacher) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!teacher) return res.status(401).json({ error: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, teacher.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: teacher.id, username: teacher.username }, JWT_SECRET);
    res.json({ token, name: teacher.name });
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
  
  db.run('DELETE FROM tests WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
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

// ========== AI QUESTION GENERATOR (FREE GEMINI) ==========

app.post('/api/teacher/ai/generate-questions', authenticateToken, async (req, res) => {
  try {
    const { topic, difficulty, count, test_id } = req.body;
    
    if (!topic || !count) {
      return res.status(400).json({ error: 'Topic and count are required' });
    }
    
    if (count < 1 || count > 20) {
      return res.status(400).json({ error: 'Count must be between 1 and 20' });
    }
    
    console.log(`🤖 Generating ${count} ${difficulty} questions about: ${topic}`);
    
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt for AI
    const prompt = `Generate ${count} multiple choice questions (MCQs) about "${topic}" with ${difficulty} difficulty level.

IMPORTANT RULES:
1. Each question must have exactly 4 options (A, B, C, D)
2. Only ONE option should be correct
3. Questions should be clear and educational
4. Options should be plausible but only one correct
5. Return ONLY valid JSON, no markdown, no explanations

Return in this EXACT JSON format:
{
  "questions": [
    {
      "question_text": "What is...",
      "option_a": "First option",
      "option_b": "Second option",
      "option_c": "Third option",
      "option_d": "Fourth option",
      "correct_answer": "A"
    }
  ]
}

Generate ${count} questions now:`;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response (remove markdown code blocks if present)
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON
    let aiData;
    try {
      aiData = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw AI Response:', text);
      return res.status(500).json({ 
        error: 'AI generated invalid format. Please try again.',
        details: 'Failed to parse AI response'
      });
    }
    
    if (!aiData.questions || !Array.isArray(aiData.questions)) {
      return res.status(500).json({ 
        error: 'AI generated invalid format. Please try again.',
        details: 'Missing questions array'
      });
    }
    
    // Validate and save questions
    const validQuestions = [];
    for (const q of aiData.questions) {
      if (q.question_text && q.option_a && q.option_b && q.option_c && q.option_d && q.correct_answer) {
        validQuestions.push(q);
      }
    }
    
    if (validQuestions.length === 0) {
      return res.status(500).json({ 
        error: 'AI generated invalid questions. Please try again.',
        details: 'No valid questions found'
      });
    }
    
    // Save to database if test_id provided
    if (test_id) {
      const stmt = db.prepare(`INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer) 
                               VALUES (?, ?, ?, ?, ?, ?, ?)`);
      
      for (const q of validQuestions) {
        stmt.run(
          test_id, 
          q.question_text, 
          q.option_a, 
          q.option_b, 
          q.option_c, 
          q.option_d, 
          q.correct_answer.toUpperCase()
        );
      }
      
      stmt.finalize();
    }
    
    console.log(`✅ Generated ${validQuestions.length} questions successfully!`);
    
    res.json({ 
      success: true, 
      questions: validQuestions,
      count: validQuestions.length,
      message: `Successfully generated ${validQuestions.length} AI-powered questions!`
    });
    
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions. Please check your API key and try again.',
      details: error.message 
    });
  }
});

// Get Questions for Test
app.get('/api/teacher/tests/:id/questions', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM questions WHERE test_id = ?', [id], (err, questions) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(questions || []);
  });
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
    let csv = 'Student ID,Name,Course,Timing,Month,Score,Total,Percentage,Date\n';
    results.forEach(r => {
      const percentage = ((r.score / r.total_questions) * 100).toFixed(2);
      csv += `${r.student_id},${r.student_name},${r.course_name},${r.timing},${r.month},${r.score},${r.total_questions},${percentage}%,${r.completed_at}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=results_${month || 'all'}.csv`);
    res.send(csv);
  });
});

// Reset Dashboard (Clear student results only)
app.post('/api/teacher/reset', authenticateToken, (req, res) => {
  const teacherId = req.user.id;
  
  // Delete only student attempts for this teacher's tests
  db.run(`DELETE FROM student_attempts 
          WHERE test_id IN (SELECT id FROM tests WHERE teacher_id = ?)`,
    [teacherId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        success: true, 
        deleted_results: this.changes,
        message: 'Student results cleared successfully. Your courses, tests, and questions are preserved.'
      });
    }
  );
});

// ========== STUDENT ENDPOINTS ==========

// Get Available Tests
app.post('/api/student/tests', (req, res) => {
  const { student_id, course_id, timing_id, month } = req.body;
  
  db.all(`SELECT t.*, c.name as course_name, tm.timing 
          FROM tests t 
          JOIN courses c ON t.course_id = c.id 
          JOIN timings tm ON t.timing_id = tm.id 
          WHERE t.course_id = ? AND t.timing_id = ? AND t.month = ?`,
    [course_id, timing_id, month],
    (err, tests) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Filter tests based on unlock dates
      const now = new Date().toISOString().split('T')[0];
      const availableTests = tests.filter(test => {
        if (!test.unlock_start && !test.unlock_end) return true;
        if (test.unlock_start && now < test.unlock_start) return false;
        if (test.unlock_end && now > test.unlock_end) return false;
        return true;
      });
      
      // Check if student already attempted
      const testPromises = availableTests.map(test => {
        return new Promise((resolve) => {
          db.get('SELECT id FROM student_attempts WHERE test_id = ? AND student_id = ?',
            [test.id, student_id],
            (err, attempt) => {
              test.attempted = !!attempt;
              
              // Check if test has questions
              db.get('SELECT COUNT(*) as count FROM questions WHERE test_id = ?',
                [test.id],
                (err, result) => {
                  test.has_questions = result && result.count >= 1;
                  resolve(test);
                }
              );
            }
          );
        });
      });
      
      Promise.all(testPromises).then(testsWithStatus => {
        res.json(testsWithStatus);
      });
    }
  );
});

// Get Test Questions
app.get('/api/student/test/:id/questions', (req, res) => {
  const { id } = req.params;
  
  db.all(
    'SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE test_id = ?',
    [id],
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
  console.log(`🤖 AI Features: ${process.env.GEMINI_API_KEY ? 'ENABLED ✅' : 'DISABLED (Add GEMINI_API_KEY to .env)'}`);
});