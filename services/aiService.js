const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

class AIService {
    constructor() {
        this.model = null;
        this.initialized = false;
    }

    // Initialize AI model
    async initialize() {
        try {
            if (!process.env.GEMINI_API_KEY) {
                console.warn('⚠️  GEMINI_API_KEY not set. AI features disabled.');
                return false;
            }
            
            this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            this.initialized = true;
            console.log('✅ AI Service initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ AI Service initialization failed:', error.message);
            return false;
        }
    }

    // Check if AI is available
    isAvailable() {
        return this.initialized && this.model !== null;
    }

    // Analyze student performance
    async analyzeStudentPerformance(studentData) {
        if (!this.isAvailable()) {
            return { error: 'AI service not available' };
        }

        try {
            const prompt = `
You are an educational AI assistant analyzing student performance data.

Student Data:
- Student ID: ${studentData.student_id}
- Student Name: ${studentData.student_name}
- Total Tests Taken: ${studentData.total_tests}
- Average Score: ${studentData.average_score}%
- Best Score: ${studentData.best_score}%
- Worst Score: ${studentData.worst_score}%
- Subject: ${studentData.subject}
- Recent Trend: ${studentData.trend}

Provide a detailed analysis in the following format:

**Performance Summary:**
[Brief overview of student's performance]

**Strengths:**
[List 2-3 key strengths]

**Areas for Improvement:**
[List 2-3 areas needing work]

**Recommendations:**
[Provide 3-4 specific, actionable recommendations]

**Predicted Outcome:**
[Predict likely performance if current trend continues]

Keep the response professional, encouraging, and actionable.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                analysis: response.text()
            };
        } catch (error) {
            console.error('AI Analysis Error:', error);
            return { error: 'Failed to analyze performance' };
        }
    }

    // Analyze test difficulty
    async analyzeTestDifficulty(testData) {
        if (!this.isAvailable()) {
            return { error: 'AI service not available' };
        }

        try {
            const prompt = `
You are an educational AI assistant analyzing test difficulty and quality.

Test Data:
- Test Name: ${testData.test_name}
- Total Questions: ${testData.total_questions}
- Average Score: ${testData.average_score}%
- Pass Rate: ${testData.pass_rate}%
- Highest Score: ${testData.highest_score}%
- Lowest Score: ${testData.lowest_score}%
- Time Limit: ${testData.time_limit} minutes
- Average Time Taken: ${testData.avg_time_taken} minutes

Question Difficulty Breakdown:
${testData.questions.map((q, i) => `
Question ${i + 1}: ${q.correct_percentage}% students answered correctly
`).join('')}

Provide analysis in this format:

**Overall Difficulty Assessment:**
[Rate as Easy/Medium/Hard and explain why]

**Question Quality:**
[Analyze distribution and balance]

**Hardest Questions:**
[List top 3 hardest questions with suggestions]

**Recommendations:**
[Provide 3-4 specific improvements for next test]

**Student Performance Insights:**
[What does this data tell us about student learning]

Be specific and actionable.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                analysis: response.text()
            };
        } catch (error) {
            console.error('AI Analysis Error:', error);
            return { error: 'Failed to analyze test difficulty' };
        }
    }

    // Provide teaching recommendations
    async getTeachingRecommendations(classData) {
        if (!this.isAvailable()) {
            return { error: 'AI service not available' };
        }

        try {
            const prompt = `
You are an educational AI assistant providing teaching recommendations.

Class Data:
- Total Students: ${classData.total_students}
- Average Score: ${classData.average_score}%
- Pass Rate: ${classData.pass_rate}%
- Subject: ${classData.subject}
- Weak Topics: ${classData.weak_topics.join(', ')}
- Strong Topics: ${classData.strong_topics.join(', ')}
- Struggling Students: ${classData.struggling_students}
- Top Performers: ${classData.top_performers}

Provide recommendations in this format:

**Focus Areas:**
[List 3-4 topics that need immediate attention]

**Teaching Strategies:**
[Suggest 4-5 specific teaching methods for weak topics]

**Student Engagement:**
[Provide 3-4 ways to improve engagement]

**Assessment Strategy:**
[Recommend how to improve testing approach]

**Time Management:**
[Suggest how to allocate time effectively]

**Support for Weak Students:**
[Specific strategies for struggling students]

Be practical and implementable.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                recommendations: response.text()
            };
        } catch (error) {
            console.error('AI Recommendations Error:', error);
            return { error: 'Failed to generate recommendations' };
        }
    }

    // AI Chatbot for teachers
    async chatWithTeacher(question, context) {
        if (!this.isAvailable()) {
            return { error: 'AI service not available' };
        }

        try {
            const prompt = `
You are an AI teaching assistant helping a teacher with their MCQ test system.

Teacher's Question: ${question}

Context (if available):
${context ? JSON.stringify(context, null, 2) : 'No specific context provided'}

Provide a helpful, professional, and actionable response. If the question is about:
- Student performance: Analyze data and provide insights
- Teaching methods: Suggest evidence-based strategies
- Test creation: Provide best practices
- Motivation: Suggest engagement techniques
- System usage: Explain features clearly
- Data analysis: Interpret statistics meaningfully

Keep responses concise but comprehensive. Use bullet points and formatting for clarity.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                response: response.text()
            };
        } catch (error) {
            console.error('AI Chat Error:', error);
            return { error: 'Failed to process question' };
        }
    }

    // Explain wrong answers to students
    async explainAnswer(questionData, studentAnswer) {
        if (!this.isAvailable()) {
            return { error: 'AI service not available' };
        }

        try {
            const prompt = `
You are an AI tutor explaining why a student's answer was incorrect.

Question: ${questionData.question_text}
Options:
A) ${questionData.option_a}
B) ${questionData.option_b}
C) ${questionData.option_c}
D) ${questionData.option_d}

Correct Answer: ${questionData.correct_answer}
Student's Answer: ${studentAnswer}

Provide an explanation in this format:

**Why Your Answer is Incorrect:**
[Explain specifically why the student's choice is wrong]

**Correct Answer Explanation:**
[Explain why the correct answer is right]

**Key Concept:**
[Explain the underlying concept]

**Remember:**
[Provide a memorable tip or trick]

Be encouraging and educational. Help the student learn from their mistake.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                explanation: response.text()
            };
        } catch (error) {
            console.error('AI Explanation Error:', error);
            return { error: 'Failed to generate explanation' };
        }
    }

    // Compare batch performance
    async compareBatches(batch1Data, batch2Data) {
        if (!this.isAvailable()) {
            return { error: 'AI service not available' };
        }

        try {
            const prompt = `
You are an AI assistant comparing performance between two batches.

Batch 1 (${batch1Data.name}):
- Total Students: ${batch1Data.total_students}
- Average Score: ${batch1Data.average_score}%
- Pass Rate: ${batch1Data.pass_rate}%
- Attendance: ${batch1Data.attendance}%

Batch 2 (${batch2Data.name}):
- Total Students: ${batch2Data.total_students}
- Average Score: ${batch2Data.average_score}%
- Pass Rate: ${batch2Data.pass_rate}%
- Attendance: ${batch2Data.attendance}%

Provide comparison in this format:

**Performance Comparison:**
[Compare key metrics]

**Strengths of Each Batch:**
[List what each batch does well]

**Possible Reasons for Differences:**
[Analyze why performance differs]

**Recommendations:**
[Suggest how to improve the weaker batch]

**Action Items:**
[Specific steps to take]

Be objective and constructive.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                comparison: response.text()
            };
        } catch (error) {
            console.error('AI Comparison Error:', error);
            return { error: 'Failed to compare batches' };
        }
    }

    // Analyze trends over time
    async analyzeTrends(trendData) {
        if (!this.isAvailable()) {
            return { error: 'AI service not available' };
        }

        try {
            const prompt = `
You are an AI assistant analyzing performance trends over time.

Trend Data:
${trendData.map(month => `
Month ${month.month}:
- Average Score: ${month.average_score}%
- Pass Rate: ${month.pass_rate}%
- Tests Conducted: ${month.tests_count}
- Student Participation: ${month.participation}%
`).join('')}

Provide analysis in this format:

**Overall Trend:**
[Describe if improving, declining, or stable]

**Key Observations:**
[List 3-4 important patterns]

**Positive Developments:**
[What's improving]

**Areas of Concern:**
[What needs attention]

**Predictions:**
[Predict next month's performance]

**Recommendations:**
[Suggest actions to maintain/improve trend]

Be data-driven and forward-looking.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                analysis: response.text()
            };
        } catch (error) {
            console.error('AI Trend Analysis Error:', error);
            return { error: 'Failed to analyze trends' };
        }
    }

    // Personalized study plan for student
    async createStudyPlan(studentData) {
        if (!this.isAvailable()) {
            return { error: 'AI service not available' };
        }

        try {
            const prompt = `
You are an AI tutor creating a personalized study plan.

Student Profile:
- Name: ${studentData.name}
- Current Average: ${studentData.average_score}%
- Strong Topics: ${studentData.strong_topics.join(', ')}
- Weak Topics: ${studentData.weak_topics.join(', ')}
- Study Time Available: ${studentData.study_time} hours/day
- Target Score: ${studentData.target_score}%

Create a study plan in this format:

**Priority Topics:**
[List topics in order of priority]

**Week 1-2 Plan:**
[Detailed daily plan for first 2 weeks]

**Study Techniques:**
[Recommend specific study methods]

**Practice Schedule:**
[How many problems per day per topic]

**Progress Milestones:**
[Set weekly goals]

**Expected Improvement:**
[Realistic timeline to reach target]

Be specific, realistic, and motivating.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                study_plan: response.text()
            };
        } catch (error) {
            console.error('AI Study Plan Error:', error);
            return { error: 'Failed to create study plan' };
        }
    }
}

// Export singleton instance
module.exports = new AIService();