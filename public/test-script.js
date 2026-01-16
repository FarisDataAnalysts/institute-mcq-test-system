let testData = JSON.parse(localStorage.getItem('testData'));
let studentData = JSON.parse(localStorage.getItem('studentData'));
let questions = [];
let answers = {};
let currentQuestionIndex = 0;
let timeLeft = 0;
let timerInterval;
let warningCount = 0;
let currentLanguage = 'en';

// Anti-cheat: Prevent copy, paste, right-click
document.addEventListener('copy', e => {
    e.preventDefault();
    showWarning('Copy not allowed!');
});

document.addEventListener('paste', e => {
    e.preventDefault();
    showWarning('Paste not allowed!');
});

document.addEventListener('contextmenu', e => {
    e.preventDefault();
    showWarning('Right-click not allowed!');
});

document.addEventListener('cut', e => {
    e.preventDefault();
    showWarning('Cut not allowed!');
});

// Prevent keyboard shortcuts
document.addEventListener('keydown', e => {
    // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, F12, Ctrl+Shift+I
    if ((e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) || 
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        showWarning('Keyboard shortcut not allowed!');
    }
});

// Detect tab switch
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        warningCount++;
        if (warningCount >= 2) {
            alert('Test auto-submitted due to tab switching!');
            submitTest(true);
        } else {
            alert(`Warning ${warningCount}/2: Do not switch tabs! Next time test will be auto-submitted.`);
        }
    }
});

// Request fullscreen
function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            console.log('Fullscreen error:', err);
        });
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

// Detect fullscreen exit
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        warningCount++;
        if (warningCount >= 2) {
            alert('Test auto-submitted due to exiting fullscreen!');
            submitTest(true);
        } else {
            alert(`Warning ${warningCount}/2: Stay in fullscreen mode!`);
            enterFullscreen();
        }
    }
}

function showWarning(message) {
    const banner = document.querySelector('.warning-banner');
    const originalText = banner.textContent;
    banner.textContent = '⚠️ ' + message;
    banner.style.background = '#c0392b';
    setTimeout(() => {
        banner.textContent = originalText;
        banner.style.background = '#e74c3c';
    }, 2000);
}

// Load test
function loadTest() {
    if (!testData || !studentData) {
        alert('Invalid test data. Redirecting to home...');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('studentInfo').textContent = 
        `${studentData.student_name} (${studentData.student_id}) - ${testData.course_name} - ${testData.timing}`;
    
    document.getElementById('testTitle').textContent = `Month ${studentData.month} Test`;
    
    timeLeft = (testData.duration_minutes || 30) * 60;

    fetch(`/api/student/test/${testData.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
    })
    .then(res => res.json())
    .then(data => {
        questions = data.questions;
        if (questions.length === 0) {
            alert('No questions available. Please contact your teacher.');
            window.location.href = 'index.html';
            return;
        }
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('testContent').style.display = 'block';
        
        renderCurrentQuestion();
        updateAnsweredCount();
        startTimer();
        enterFullscreen();
    })
    .catch(err => {
        alert('Error loading test: ' + err.message);
        window.location.href = 'index.html';
    });
}

// Render current question
function renderCurrentQuestion() {
    const container = document.getElementById('questionsContainer');
    const q = questions[currentQuestionIndex];
    
    container.innerHTML = `
        <div class="question">
            <div class="question-header">
                <span class="question-number">Question ${currentQuestionIndex + 1} of ${questions.length}</span>
                <button class="translate-btn" onclick="translateQuestion()">🌐 Translate</button>
            </div>
            <h3 id="questionText">${q.question_text}</h3>
            <div class="options">
                <label class="option ${answers[q.id] === 'A' ? 'selected' : ''}" onclick="selectOption(${q.id}, 'A')">
                    <input type="radio" name="q${q.id}" value="A" ${answers[q.id] === 'A' ? 'checked' : ''}>
                    <span id="optionA">${q.option_a}</span>
                </label>
                <label class="option ${answers[q.id] === 'B' ? 'selected' : ''}" onclick="selectOption(${q.id}, 'B')">
                    <input type="radio" name="q${q.id}" value="B" ${answers[q.id] === 'B' ? 'checked' : ''}>
                    <span id="optionB">${q.option_b}</span>
                </label>
                <label class="option ${answers[q.id] === 'C' ? 'selected' : ''}" onclick="selectOption(${q.id}, 'C')">
                    <input type="radio" name="q${q.id}" value="C" ${answers[q.id] === 'C' ? 'checked' : ''}>
                    <span id="optionC">${q.option_c}</span>
                </label>
                <label class="option ${answers[q.id] === 'D' ? 'selected' : ''}" onclick="selectOption(${q.id}, 'D')">
                    <input type="radio" name="q${q.id}" value="D" ${answers[q.id] === 'D' ? 'checked' : ''}>
                    <span id="optionD">${q.option_d}</span>
                </label>
            </div>
        </div>
    `;
    
    updateNavigation();
    updateProgress();
}

// Select option
function selectOption(questionId, answer) {
    answers[questionId] = answer;
    
    // Update UI
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    // Enable next button
    document.getElementById('nextBtn').disabled = false;
    
    updateAnsweredCount();
    updateProgress();
}

// Navigation
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderCurrentQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderCurrentQuestion();
    }
}

function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Show/hide previous button
    prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    
    // Enable/disable next button based on answer
    const currentQ = questions[currentQuestionIndex];
    nextBtn.disabled = !answers[currentQ.id];
    
    // Show submit button on last question
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

// Update answered count
function updateAnsweredCount() {
    const answeredCount = Object.keys(answers).length;
    document.getElementById('answeredCount').textContent = 
        `Answered: ${answeredCount}/${questions.length}`;
}

// Update progress bar
function updateProgress() {
    const answeredCount = Object.keys(answers).length;
    const percentage = (answeredCount / questions.length) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
}

// Timer
function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        // Warning at 5 minutes
        if (timeLeft === 300) {
            alert('⏰ 5 minutes remaining!');
        }
        
        // Warning at 1 minute
        if (timeLeft === 60) {
            alert('⏰ 1 minute remaining!');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('⏰ Time is up! Submitting test...');
            submitTest(true);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerEl = document.getElementById('timer');
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Add warning class when less than 5 minutes
    if (timeLeft < 300) {
        timerEl.classList.add('warning');
    }
}

// Translate question (mock - integrate Google Translate API for real translation)
function translateQuestion() {
    alert('Translation feature: Integrate Google Translate API for real-time translation.\n\nFor now, this is a demo feature.');
}

// Submit test
function submitTest(autoSubmit = false) {
    clearInterval(timerInterval);
    
    // Check if all answered
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0 && !autoSubmit) {
        const confirmSubmit = confirm(
            `${unanswered.length} question(s) are unanswered.\n\n` +
            `Answered: ${Object.keys(answers).length}/${questions.length}\n\n` +
            `Do you want to submit anyway?`
        );
        if (!confirmSubmit) {
            startTimer(); // Resume timer
            return;
        }
    }
    
    const submitData = {
        ...studentData,
        answers: JSON.stringify(answers)
    };
    
    // Disable submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }
    
    fetch(`/api/student/test/${testData.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Clear localStorage
            localStorage.removeItem('studentData');
            localStorage.removeItem('testData');
            
            // Show results
            alert(
                `✅ Test Submitted Successfully!\n\n` +
                `Score: ${data.score}/${data.total}\n` +
                `Percentage: ${data.percentage}%\n\n` +
                `Thank you for taking the test!`
            );
            
            // Redirect to home
            window.location.href = 'index.html';
        } else {
            alert('Error submitting test. Please try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Test';
            }
            startTimer(); // Resume timer
        }
    })
    .catch(err => {
        alert('Error submitting test: ' + err.message);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Test';
        }
        startTimer(); // Resume timer
    });
}

// Prevent back button
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
    alert('Back button is disabled during test!');
};

// Prevent page refresh
window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
    return 'Are you sure you want to leave? Your test progress will be lost.';
});

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTest);
} else {
    loadTest();
}