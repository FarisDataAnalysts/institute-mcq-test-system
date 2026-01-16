const token = localStorage.getItem('teacherToken');
const teacherName = localStorage.getItem('teacherName');

if (!token) {
    window.location.href = 'index.html';
}

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let dashboardData = {};
let allQuestions = [];

// Set teacher name
if (teacherName) {
    document.getElementById('teacherName').textContent = `Welcome, ${teacherName}`;
}

// Load dashboard
function loadDashboard() {
    fetch('/api/teacher/dashboard', { headers })
        .then(res => {
            if (res.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            return res.json();
        })
        .then(data => {
            if (!data) return;
            dashboardData = data;
            updateStats();
            renderCourses();
            renderTimings();
            renderTests();
            populateSelects();
        })
        .catch(err => {
            console.error('Error loading dashboard:', err);
            alert('Error loading dashboard. Please refresh the page.');
        });
}

// Update statistics
function updateStats() {
    document.getElementById('totalCourses').textContent = dashboardData.courses?.length || 0;
    document.getElementById('totalTests').textContent = dashboardData.tests?.length || 0;
    
    // Count total questions
    let totalQuestions = 0;
    if (dashboardData.tests) {
        dashboardData.tests.forEach(test => {
            fetch(`/api/teacher/tests/${test.id}/questions`, { headers })
                .then(res => res.json())
                .then(questions => {
                    totalQuestions += questions.length;
                    document.getElementById('totalQuestions').textContent = totalQuestions;
                });
        });
    }
    
    // Load results count
    fetch('/api/teacher/results', { headers })
        .then(res => res.json())
        .then(results => {
            const uniqueStudents = new Set(results.map(r => r.student_id));
            document.getElementById('totalStudents').textContent = uniqueStudents.size;
        });
}

// Tab switching
function showTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'results') {
        loadResults();
    } else if (tabName === 'overview') {
        updateStats();
    }
}

// ========== COURSES ==========

function addCourse() {
    const name = document.getElementById('courseName').value.trim();
    if (!name) {
        alert('Please enter course name');
        return;
    }
    
    fetch('/api/teacher/courses', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Course added successfully!');
            document.getElementById('courseName').value = '';
            loadDashboard();
        } else {
            alert('Error adding course');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error adding course');
    });
}

function renderCourses() {
    const list = document.getElementById('coursesList');
    
    if (!dashboardData.courses || dashboardData.courses.length === 0) {
        list.innerHTML = '<div class=\"empty-state\"><h3>No courses yet</h3><p>Add your first course to get started</p></div>';
        return;
    }
    
    let html = '<table><tr><th>Course Name</th><th>Actions</th></tr>';
    dashboardData.courses.forEach(course => {
        html += `
            <tr>
                <td>${course.name}</td>
                <td><button onclick="deleteCourse(${course.id})" class="delete-btn">Delete</button></td>
            </tr>
        `;
    });
    html += '</table>';
    list.innerHTML = html;
}

function deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course? This will fail if there are tests using this course.')) return;
    
    fetch(`/api/teacher/courses/${id}`, {
        method: 'DELETE',
        headers
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Course deleted successfully!');
            loadDashboard();
        } else {
            alert(data.error || 'Error deleting course');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error deleting course');
    });
}

// ========== TIMINGS ==========

function addTiming() {
    const timing = document.getElementById('timingName').value.trim();
    if (!timing) {
        alert('Please enter timing');
        return;
    }
    
    fetch('/api/teacher/timings', {
        method: 'POST',
        headers,
        body: JSON.stringify({ timing })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Timing added successfully!');
            document.getElementById('timingName').value = '';
            loadDashboard();
        } else {
            alert('Error adding timing');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error adding timing');
    });
}

function renderTimings() {
    const list = document.getElementById('timingsList');
    
    if (!dashboardData.timings || dashboardData.timings.length === 0) {
        list.innerHTML = '<div class=\"empty-state\"><h3>No timings yet</h3><p>Add your first timing to get started</p></div>';
        return;
    }
    
    let html = '<table><tr><th>Timing</th><th>Actions</th></tr>';
    dashboardData.timings.forEach(timing => {
        html += `
            <tr>
                <td>${timing.timing}</td>
                <td><button onclick="deleteTiming(${timing.id})" class="delete-btn">Delete</button></td>
            </tr>
        `;
    });
    html += '</table>';
    list.innerHTML = html;
}

function deleteTiming(id) {
    if (!confirm('Are you sure you want to delete this timing? This will fail if there are tests using this timing.')) return;
    
    fetch(`/api/teacher/timings/${id}`, {
        method: 'DELETE',
        headers
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Timing deleted successfully!');
            loadDashboard();
        } else {
            alert(data.error || 'Error deleting timing');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error deleting timing');
    });
}

// ========== TESTS ==========

function addTest() {
    const course_id = document.getElementById('testCourse').value;
    const timing_id = document.getElementById('testTiming').value;
    const month = document.getElementById('testMonth').value;
    const unlock_start = document.getElementById('unlockStart').value;
    const unlock_end = document.getElementById('unlockEnd').value;
    const duration_minutes = document.getElementById('testDuration').value || 30;
    
    if (!course_id || !timing_id || !month) {
        alert('Please fill all required fields');
        return;
    }
    
    const data = {
        course_id,
        timing_id,
        month,
        unlock_start: unlock_start || null,
        unlock_end: unlock_end || null,
        duration_minutes
    };
    
    fetch('/api/teacher/tests', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Test created successfully!');
            // Clear form
            document.getElementById('testCourse').value = '';
            document.getElementById('testTiming').value = '';
            document.getElementById('testMonth').value = '';
            document.getElementById('unlockStart').value = '';
            document.getElementById('unlockEnd').value = '';
            document.getElementById('testDuration').value = '30';
            loadDashboard();
        } else {
            alert('Error creating test');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error creating test');
    });
}

function renderTests() {
    const list = document.getElementById('testsList');
    
    if (!dashboardData.tests || dashboardData.tests.length === 0) {
        list.innerHTML = '<div class=\"empty-state\"><h3>No tests yet</h3><p>Create your first test to get started</p></div>';
        return;
    }
    
    let html = '<table><tr><th>Course</th><th>Timing</th><th>Month</th><th>Duration</th><th>Unlock Period</th><th>Actions</th></tr>';
    dashboardData.tests.forEach(test => {
        const unlockPeriod = test.unlock_start && test.unlock_end 
            ? `${test.unlock_start} to ${test.unlock_end}`
            : 'Always Available';
        
        html += `
            <tr>
                <td>${test.course_name}</td>
                <td>${test.timing}</td>
                <td>${test.month}</td>
                <td>${test.duration_minutes} min</td>
                <td>${unlockPeriod}</td>
                <td><button onclick="deleteTest(${test.id})" class="delete-btn">Delete</button></td>
            </tr>
        `;
    });
    html += '</table>';
    list.innerHTML = html;
}

function deleteTest(id) {
    if (!confirm('Are you sure you want to delete this test? This will also delete all questions for this test.')) return;
    
    fetch(`/api/teacher/tests/${id}`, {
        method: 'DELETE',
        headers
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Test deleted successfully!');
            loadDashboard();
        } else {
            alert('Error deleting test');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error deleting test');
    });
}

// ========== QUESTIONS ==========

function loadQuestions() {
    const testId = document.getElementById('questionTestSelect').value;
    
    if (!testId) {
        document.getElementById('questionsList').innerHTML = '<div class=\"empty-state\"><h3>Select a test</h3><p>Choose a test to view and manage questions</p></div>';
        return;
    }
    
    fetch(`/api/teacher/tests/${testId}/questions`, { headers })
        .then(res => res.json())
        .then(questions => {
            allQuestions = questions;
            renderQuestions();
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Error loading questions');
        });
}

function renderQuestions() {
    const list = document.getElementById('questionsList');
    
    if (allQuestions.length === 0) {
        list.innerHTML = '<div class=\"empty-state\"><h3>No questions yet</h3><p>Add questions to this test</p></div>';
        return;
    }
    
    let html = '<table><tr><th>#</th><th>Question</th><th>Options</th><th>Correct</th><th>Actions</th></tr>';
    allQuestions.forEach((q, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${q.question_text}</td>
                <td>
                    A: ${q.option_a}<br>
                    B: ${q.option_b}<br>
                    C: ${q.option_c}<br>
                    D: ${q.option_d}
                </td>
                <td>${q.correct_answer}</td>
                <td><button onclick="deleteQuestion(${q.id})" class="delete-btn">Delete</button></td>
            </tr>
        `;
    });
    html += '</table>';
    list.innerHTML = html;
}

function addQuestion() {
    const testId = document.getElementById('questionTestSelect').value;
    const question_text = document.getElementById('questionText').value.trim();
    const option_a = document.getElementById('optionA').value.trim();
    const option_b = document.getElementById('optionB').value.trim();
    const option_c = document.getElementById('optionC').value.trim();
    const option_d = document.getElementById('optionD').value.trim();
    const correct_answer = document.getElementById('correctAnswer').value;
    
    if (!question_text || !option_a || !option_b || !option_c || !option_d) {
        alert('Please fill all fields');
        return;
    }
    
    const data = {
        test_id: testId,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer
    };
    
    fetch('/api/teacher/questions', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Question added successfully!');
            // Clear form
            document.getElementById('questionText').value = '';
            document.getElementById('optionA').value = '';
            document.getElementById('optionB').value = '';
            document.getElementById('optionC').value = '';
            document.getElementById('optionD').value = '';
            document.getElementById('correctAnswer').value = 'A';
            loadQuestions();
        } else {
            alert('Error adding question');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error adding question');
    });
}

function deleteQuestion(id) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    fetch(`/api/teacher/questions/${id}`, {
        method: 'DELETE',
        headers
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Question deleted successfully!');
            loadQuestions();
        } else {
            alert('Error deleting question');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error deleting question');
    });
}

// ========== RESULTS ==========

function loadResults() {
    const month = document.getElementById('resultMonth').value;
    const url = month ? `/api/teacher/results?month=${month}` : '/api/teacher/results';
    
    fetch(url, { headers })
        .then(res => res.json())
        .then(results => {
            renderResults(results);
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Error loading results');
        });
}

function renderResults(results) {
    const list = document.getElementById('resultsList');
    
    if (results.length === 0) {
        list.innerHTML = '<div class=\"empty-state\"><h3>No results yet</h3><p>Results will appear here after students take tests</p></div>';
        return;
    }
    
    let html = '<table><tr><th>Student ID</th><th>Name</th><th>Course</th><th>Timing</th><th>Month</th><th>Score</th><th>Percentage</th><th>Date</th></tr>';
    
    results.forEach(r => {
        const percentage = ((r.score / r.total_questions) * 100).toFixed(2);
        const passStatus = percentage >= 50 ? '✅' : '❌';
        html += `
            <tr>
                <td>${r.student_id}</td>
                <td>${r.student_name}</td>
                <td>${r.course_name}</td>
                <td>${r.timing}</td>
                <td>${r.month}</td>
                <td>${r.score}/${r.total_questions}</td>
                <td>${passStatus} ${percentage}%</td>
                <td>${new Date(r.completed_at).toLocaleString()}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    list.innerHTML = html;
}

function exportResults() {
    const month = document.getElementById('resultMonth').value;
    const url = month ? `/api/teacher/results/export?month=${month}` : '/api/teacher/results/export';
    
    // Create a temporary link with authentication
    fetch(url, { 
        headers,
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Export failed - Access Denied. Please login again.');
        }
        return response.blob();
    })
    .then(blob => {
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `results_${month || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        alert('✅ Results exported successfully!');
    })
    .catch(err => {
        console.error('Export error:', err);
        alert(err.message || 'Error exporting results. Please try again.');
    });
}

// ========== RESET DASHBOARD ==========

function resetDashboard() {
    const confirmation = confirm('⚠️ WARNING: This will DELETE ALL STUDENT RESULTS!\n\n' +
        'This will KEEP:\n' +
        '✅ All Courses\n' +
        '✅ All Timings\n' +
        '✅ All Tests\n' +
        '✅ All Questions\n\n' +
        'This will DELETE:\n' +
        '❌ All Student Test Results\n\n' +
        'Use this to start a new session with the same tests.\n\n' +
        'Are you sure you want to continue?');
    
    if (!confirmation) return;
    
    const doubleCheck = prompt('Type "RESET" to confirm (all caps):');
    
    if (doubleCheck !== 'RESET') {
        alert('Reset cancelled. Your data is safe.');
        return;
    }
    
    fetch('/api/teacher/reset', {
        method: 'POST',
        headers
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(`✅ Student results cleared successfully!\n\n${data.deleted_results} result(s) deleted.\n\nYour courses, tests, and questions are preserved.`);
            loadDashboard();
        } else {
            alert('Error resetting dashboard');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error resetting dashboard');
    });
}

// ========== POPULATE SELECTS ==========

function populateSelects() {
    // Populate course selects
    const courseSelects = [document.getElementById('testCourse')];
    courseSelects.forEach(select => {
        select.innerHTML = '<option value="">-- Select Course --</option>';
        if (dashboardData.courses) {
            dashboardData.courses.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });
        }
    });
    
    // Populate timing selects
    const timingSelects = [document.getElementById('testTiming')];
    timingSelects.forEach(select => {
        select.innerHTML = '<option value="">-- Select Timing --</option>';
        if (dashboardData.timings) {
            dashboardData.timings.forEach(t => {
                select.innerHTML += `<option value="${t.id}">${t.timing}</option>`;
            });
        }
    });
    
    // Populate test selects
    const testSelects = [document.getElementById('questionTestSelect')];
    testSelects.forEach(select => {
        select.innerHTML = '<option value="">-- Select Test --</option>';
        if (dashboardData.tests) {
            dashboardData.tests.forEach(t => {
                select.innerHTML += `<option value="${t.id}">${t.course_name} - ${t.timing} - Month ${t.month}</option>`;
            });
        }
    });
}

// ========== LOGOUT ==========

function logout() {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherName');
    window.location.href = 'index.html';
}

// ========== INITIALIZE ==========

loadDashboard();