# 🗑️ Delete Functionality - Update Instructions

## ✅ **Kya Add Karna Hai:**

Delete buttons for:
- Courses
- Timings  
- Tests

---

## 📝 **Step-by-Step Update:**

### **File 1: `server.js` mein Add Karo**

**Location:** Line 200 ke baad (teacher routes section mein)

```javascript
// Delete Course
app.delete('/api/teacher/courses/:courseId', authenticateTeacher, (req, res) => {
  const { courseId } = req.params;
  
  // Check if course belongs to teacher
  db.get('SELECT * FROM courses WHERE id = ? AND teacher_id = ?', 
    [courseId, req.teacherId], 
    (err, course) => {
      if (!course) return res.status(403).json({ error: 'Unauthorized' });
      
      // Check if course has tests
      db.get('SELECT COUNT(*) as count FROM tests WHERE course_id = ?', 
        [courseId], 
        (err, result) => {
          if (result.count > 0) {
            return res.status(400).json({ 
              error: 'Cannot delete course with existing tests. Delete tests first.' 
            });
          }
          
          // Delete course
          db.run('DELETE FROM courses WHERE id = ?', [courseId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
          });
        }
      );
    }
  );
});

// Delete Timing
app.delete('/api/teacher/timings/:timingId', authenticateTeacher, (req, res) => {
  const { timingId } = req.params;
  
  // Check if timing belongs to teacher
  db.get('SELECT * FROM timings WHERE id = ? AND teacher_id = ?', 
    [timingId, req.teacherId], 
    (err, timing) => {
      if (!timing) return res.status(403).json({ error: 'Unauthorized' });
      
      // Check if timing has tests
      db.get('SELECT COUNT(*) as count FROM tests WHERE timing_id = ?', 
        [timingId], 
        (err, result) => {
          if (result.count > 0) {
            return res.status(400).json({ 
              error: 'Cannot delete timing with existing tests. Delete tests first.' 
            });
          }
          
          // Delete timing
          db.run('DELETE FROM timings WHERE id = ?', [timingId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
          });
        }
      );
    }
  );
});

// Delete Test
app.delete('/api/teacher/tests/:testId', authenticateTeacher, (req, res) => {
  const { testId } = req.params;
  
  // Check if test belongs to teacher
  db.get('SELECT * FROM tests WHERE id = ? AND teacher_id = ?', 
    [testId, req.teacherId], 
    (err, test) => {
      if (!test) return res.status(403).json({ error: 'Unauthorized' });
      
      // Delete questions first
      db.run('DELETE FROM questions WHERE test_id = ?', [testId], (err) => {
        // Delete test
        db.run('DELETE FROM tests WHERE id = ?', [testId], function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        });
      });
    }
  );
});
```

---

### **File 2: `public/teacher-script.js` mein Update Karo**

**Replace `renderCourses()` function:**

```javascript
function renderCourses() {
    const list = document.getElementById('coursesList');
    
    if (!dashboardData.courses || dashboardData.courses.length === 0) {
        list.innerHTML = '<div class="empty-state"><h3>No courses yet</h3><p>Add your first course above</p></div>';
        return;
    }
    
    list.innerHTML = '';
    dashboardData.courses.forEach(course => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.innerHTML = `
            <strong>📚 ${course.name}</strong>
            <button class="btn btn-danger" onclick="deleteCourse(${course.id})">Delete</button>
        `;
        list.appendChild(item);
    });
}

function deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    fetch(\`/api/teacher/courses/\${id}\`, {
        method: 'DELETE',
        headers
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Course deleted successfully!');
            loadDashboard();
        } else {
            alert('Error: ' + (data.error || 'Cannot delete course'));
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error deleting course');
    });
}
```

**Replace `renderTimings()` function:**

```javascript
function renderTimings() {
    const list = document.getElementById('timingsList');
    
    if (!dashboardData.timings || dashboardData.timings.length === 0) {
        list.innerHTML = '<div class="empty-state"><h3>No timings yet</h3><p>Add your first timing above</p></div>';
        return;
    }
    
    list.innerHTML = '';
    dashboardData.timings.forEach(timing => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.innerHTML = `
            <strong>🕐 ${timing.timing}</strong>
            <button class="btn btn-danger" onclick="deleteTiming(${timing.id})">Delete</button>
        `;
        list.appendChild(item);
    });
}

function deleteTiming(id) {
    if (!confirm('Are you sure you want to delete this timing?')) return;
    
    fetch(\`/api/teacher/timings/\${id}\`, {
        method: 'DELETE',
        headers
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Timing deleted successfully!');
            loadDashboard();
        } else {
            alert('Error: ' + (data.error || 'Cannot delete timing'));
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error deleting timing');
    });
}
```

**Update `renderTests()` function - Add delete button in table:**

```javascript
function renderTests() {
    const list = document.getElementById('testsList');
    
    if (!dashboardData.tests || dashboardData.tests.length === 0) {
        list.innerHTML = '<div class="empty-state"><h3>No tests yet</h3><p>Create your first test above</p></div>';
        return;
    }
    
    let html = '<table><tr><th>Course</th><th>Timing</th><th>Month</th><th>Unlock Period</th><th>Duration</th><th>Actions</th></tr>';
    
    dashboardData.tests.forEach(test => {
        html += \`
            <tr>
                <td>\${test.course_name}</td>
                <td>\${test.timing}</td>
                <td>Month \${test.month}</td>
                <td>\${test.unlock_start || 'Not set'} to \${test.unlock_end || 'Not set'}</td>
                <td>\${test.duration_minutes || 30} min</td>
                <td>
                    <button class="btn" onclick="viewTestQuestions(\${test.id})">Questions</button>
                    <button class="btn btn-danger" onclick="deleteTest(\${test.id})">Delete</button>
                </td>
            </tr>
        \`;
    });
    
    html += '</table>';
    list.innerHTML = html;
}

function deleteTest(id) {
    if (!confirm('Are you sure? This will delete the test and all its questions!')) return;
    
    fetch(\`/api/teacher/tests/\${id}\`, {
        method: 'DELETE',
        headers
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Test deleted successfully!');
            loadDashboard();
        } else {
            alert('Error: ' + (data.error || 'Cannot delete test'));
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error deleting test');
    });
}
```

---

## 🚀 **Kaise Apply Karein:**

### **Option 1: Manual Copy-Paste**

1. **Server stop karo** (Ctrl+C)

2. **`server.js` open karo** (Notepad++ ya VS Code mein)

3. **Line 200 ke baad** upar wale 3 delete routes paste karo

4. **`public/teacher-script.js` open karo**

5. **Functions replace karo** (upar diye gaye)

6. **Save karo** dono files

7. **Server restart karo:**
   ```bash
   npm start
   ```

---

### **Option 2: Fresh Download (Easiest)**

Main updated files GitHub pe push kar deta hoon. Aap **fresh download** karo:

```
https://github.com/FarisDataAnalysts/institute-mcq-test-system/archive/refs/heads/main.zip
```

---

## ✅ **Testing:**

1. **Login** karo teacher dashboard
2. **Courses tab** → Delete button dikhega
3. **Timings tab** → Delete button dikhega
4. **Tests tab** → Delete button dikhega

---

## ⚠️ **Important Notes:**

- **Course delete** nahi hoga agar uske tests hain
- **Timing delete** nahi hoga agar uske tests hain
- **Test delete** hoga aur saare questions bhi delete ho jayenge
- **Confirmation** popup aayega before delete

---

**Kya main yeh changes GitHub pe push kar doon?** Phir aap fresh download kar loge! 🚀