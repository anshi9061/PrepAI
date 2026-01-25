-- PrepAI Production Database Schema
-- PostgreSQL with proper indexing and relationships

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subscription_type VARCHAR(50) DEFAULT 'free', -- free, premium, institutional
    subscription_expires_at TIMESTAMP,
    target_exams TEXT[], -- Array of exam IDs user is preparing for
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Exam Categories and Hierarchies
CREATE TABLE exam_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE exams (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    category_id VARCHAR(50) REFERENCES exam_categories(id),
    level VARCHAR(20) NOT NULL, -- National, State, Board
    state VARCHAR(100), -- Only for state-level exams
    start_year INTEGER NOT NULL,
    has_subjects BOOLEAN DEFAULT false,
    subjects TEXT[], -- Array of subject names
    description TEXT,
    pattern_config JSONB, -- Exam pattern (duration, sections, etc.)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects and Topics Hierarchy
CREATE TABLE subjects (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    exam_id VARCHAR(100) REFERENCES exams(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE topics (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject_id VARCHAR(100) REFERENCES subjects(id),
    parent_topic_id VARCHAR(100) REFERENCES topics(id), -- For subtopics
    difficulty_level VARCHAR(20) DEFAULT 'Medium', -- Easy, Medium, Hard
    weightage DECIMAL(5,2) DEFAULT 0, -- Importance in exam (0-100)
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Question Bank (Core Content)
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'mcq', -- mcq, numerical, assertion
    options JSONB, -- Array of options for MCQ
    correct_answer JSONB NOT NULL, -- Answer(s) - flexible for different types
    explanation TEXT,
    difficulty VARCHAR(20) NOT NULL, -- Easy, Medium, Hard
    topic_id VARCHAR(100) REFERENCES topics(id),
    subject_id VARCHAR(100) REFERENCES subjects(id),
    exam_id VARCHAR(100) REFERENCES exams(id),
    
    -- Content metadata
    source VARCHAR(255), -- Previous year, mock, generated
    year_appeared INTEGER,
    frequency_count INTEGER DEFAULT 0, -- How many times appeared in past
    is_high_yield BOOLEAN DEFAULT false,
    
    -- AI and quality metrics
    ai_generated BOOLEAN DEFAULT false,
    quality_score DECIMAL(3,2) DEFAULT 0, -- 0-10 quality rating
    review_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    
    -- Tracking
    created_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Question Tags (for better categorization)
CREATE TABLE question_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Past Papers Management
CREATE TABLE past_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id VARCHAR(100) REFERENCES exams(id),
    year INTEGER NOT NULL,
    subject_id VARCHAR(100) REFERENCES subjects(id),
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_mb DECIMAL(8,2),
    file_type VARCHAR(10) DEFAULT 'pdf',
    download_count INTEGER DEFAULT 0,
    upload_date TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- User Activity and Analytics
CREATE TABLE user_quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_type VARCHAR(20) NOT NULL, -- practice, mock, daily_challenge
    exam_id VARCHAR(100) REFERENCES exams(id),
    subject_id VARCHAR(100) REFERENCES subjects(id),
    topic_id VARCHAR(100) REFERENCES topics(id),
    
    -- Session details
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_taken_seconds INTEGER,
    score_percentage DECIMAL(5,2),
    
    -- Session metadata
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    is_completed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    question_id UUID REFERENCES questions(id),
    session_id UUID REFERENCES user_quiz_sessions(id),
    
    selected_answer JSONB,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER,
    attempt_number INTEGER DEFAULT 1, -- For retry tracking
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Performance Analytics (Aggregated Data)
CREATE TABLE user_topic_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    topic_id VARCHAR(100) REFERENCES topics(id),
    
    -- Performance metrics
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) DEFAULT 0,
    avg_time_per_question DECIMAL(8,2) DEFAULT 0,
    
    -- Difficulty breakdown
    easy_accuracy DECIMAL(5,2) DEFAULT 0,
    medium_accuracy DECIMAL(5,2) DEFAULT 0,
    hard_accuracy DECIMAL(5,2) DEFAULT 0,
    
    -- Tracking
    last_attempted_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, topic_id)
);

-- Content Management and Admin
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    role VARCHAR(50) NOT NULL, -- super_admin, content_manager, reviewer
    permissions JSONB, -- Specific permissions
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE content_review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL, -- question, paper, topic
    content_id UUID NOT NULL,
    submitted_by UUID REFERENCES users(id),
    review_status VARCHAR(20) DEFAULT 'pending',
    reviewer_id UUID REFERENCES admin_users(id),
    review_notes TEXT,
    priority INTEGER DEFAULT 1, -- 1=low, 5=high
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_exam ON questions(exam_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_user_attempts_user_question ON user_question_attempts(user_id, question_id);
CREATE INDEX idx_user_sessions_user_date ON user_quiz_sessions(user_id, created_at);
CREATE INDEX idx_user_performance_user ON user_topic_performance(user_id);

-- Views for Common Queries
CREATE VIEW question_stats AS
SELECT 
    q.id,
    q.question_text,
    q.difficulty,
    t.name as topic_name,
    s.name as subject_name,
    e.name as exam_name,
    COUNT(uqa.id) as total_attempts,
    COUNT(CASE WHEN uqa.is_correct THEN 1 END) as correct_attempts,
    ROUND(
        COUNT(CASE WHEN uqa.is_correct THEN 1 END) * 100.0 / NULLIF(COUNT(uqa.id), 0), 
        2
    ) as success_rate
FROM questions q
LEFT JOIN topics t ON q.topic_id = t.id
LEFT JOIN subjects s ON q.subject_id = s.id
LEFT JOIN exams e ON q.exam_id = e.id
LEFT JOIN user_question_attempts uqa ON q.id = uqa.question_id
WHERE q.is_active = true
GROUP BY q.id, q.question_text, q.difficulty, t.name, s.name, e.name;

CREATE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    u.full_name,
    COUNT(DISTINCT uqs.id) as total_sessions,
    COUNT(DISTINCT uqa.id) as total_questions_attempted,
    COUNT(CASE WHEN uqa.is_correct THEN 1 END) as total_correct,
    ROUND(
        COUNT(CASE WHEN uqa.is_correct THEN 1 END) * 100.0 / NULLIF(COUNT(uqa.id), 0), 
        2
    ) as overall_accuracy,
    MAX(uqs.created_at) as last_activity
FROM users u
LEFT JOIN user_quiz_sessions uqs ON u.id = uqs.user_id
LEFT JOIN user_question_attempts uqa ON u.id = uqa.user_id
WHERE u.is_active = true
GROUP BY u.id, u.full_name;