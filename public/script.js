let currentLanguage = 'en';
let studentData = {};

// Language Translation
function changeLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
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
            if (data.test.question_count < 10) {
                alert('Test is not ready yet. Please contact your teacher.');
                return;
            }
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
    
    const username = document.getElementById('teacherUsername').value;
    const password = document.getElementById('teacherPassword').value;
    
    fetch('/api/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('teacherToken', data.token);
            localStorage.setItem('teacherName', data.teacher.name);
            window.location.href = 'teacher.html';
        } else {
            alert('Invalid credentials');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error: ' + err.message);
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