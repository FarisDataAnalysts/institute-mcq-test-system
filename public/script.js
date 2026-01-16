let currentLanguage = 'en';
let studentData = {};

// Language Translation
function changeLanguage(lang, event) {
    currentLanguage = lang;
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Fallback: find button by language
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.textContent.includes(lang === 'en' ? 'English' : 'اردو')) {
                btn.classList.add('active');
            }
        });
    }
}

// Load student options
function loadStudentOptions() {
    fetch('/api/student/options')
        .then(res => res.json())
        .then(data => {
            const courseSelect = document.getElementById('courseSelect');
            const timingSelect = document.getElementById('timingSelect');
            
            // Clear existing options except first
            courseSelect.innerHTML = '<option value="">Select Course</option>';
            timingSelect.innerHTML = '<option value="">Select Timing</option>';
            
            data.courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                courseSelect.appendChild(option);
            });
            
            data.timings.forEach(timing => {
                const option = document.createElement('option');
                option.value = timing.id;
                option.textContent = timing.timing;
                timingSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Error loading options:', err);
            alert('Error loading options. Please refresh the page.');
        });
}

// Show Modals
function showStudentLogin() {
    document.getElementById('studentModal').style.display = 'block';
    loadStudentOptions();
}

function showTeacherLogin() {
    document.getElementById('teacherModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Student Login
function studentLogin(event) {
    event.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const studentName = document.getElementById('studentName').value;
    const courseId = document.getElementById('courseSelect').value;
    const timingId = document.getElementById('timingSelect').value;
    const month = document.getElementById('monthSelect').value;
    
    if (!courseId || !timingId || !month) {
        alert('Please fill all fields');
        return;
    }
    
    studentData = {
        student_id: studentId,
        student_name: studentName,
        course_id: courseId,
        timing_id: timingId,
        month: month
    };
    
    // Check if test is available
    fetch('/api/student/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.available) {
            // Allow test with any number of questions (removed minimum 10 check)
            localStorage.setItem('studentData', JSON.stringify(studentData));
            localStorage.setItem('testData', JSON.stringify(data.test));
            window.location.href = 'test.html';
        } else {
            alert(data.message || 'Test is not available at this time. Please check unlock dates with your teacher.');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error: ' + err.message);
    });
}

// Teacher Login
function teacherLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('teacherUsername').value.trim();
    const password = document.getElementById('teacherPassword').value;
    
    // Basic validation
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    // Disable button to prevent double submission
    const loginBtn = event.target.querySelector('button[type="submit"]');
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    fetch('/api/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        // Check if response is ok
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Login failed');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success && data.token) {
            // Store token and name
            localStorage.setItem('teacherToken', data.token);
            localStorage.setItem('teacherName', data.name || 'Teacher');
            
            // Show success message
            alert('Login successful! Redirecting...');
            
            // Redirect to teacher dashboard
            window.location.href = 'teacher.html';
        } else {
            throw new Error(data.error || 'Invalid credentials');
        }
    })
    .catch(err => {
        console.error('Login error:', err);
        alert(err.message || 'Login failed. Please check your credentials and try again.');
        
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Initialize
changeLanguage('en');