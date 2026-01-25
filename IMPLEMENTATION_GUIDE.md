# PrepAI: Immediate Implementation Guide

## 🚀 STEP 1: Backend Setup (Week 1)

### 1.1 Initialize Backend Project
```bash
# Create backend directory
mkdir prepai-backend
cd prepai-backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express typescript @types/node @types/express
npm install prisma @prisma/client bcryptjs jsonwebtoken
npm install joi helmet cors rate-limiter-flexible
npm install redis @types/redis multer @types/multer
npm install dotenv winston

# Install dev dependencies
npm install -D nodemon ts-node @types/bcryptjs @types/jsonwebtoken
npm install -D @types/joi @types/multer
```

### 1.2 Project Structure
```
prepai-backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── content.controller.ts
│   │   ├── admin.controller.ts
│   │   └── user.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── content.service.ts
│   │   ├── ai.service.ts
│   │   └── analytics.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rateLimit.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── content.routes.ts
│   │   ├── admin.routes.ts
│   │   └── user.routes.ts
│   ├── utils/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── logger.ts
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── uploads/
├── .env
├── .env.example
└── package.json
```

### 1.3 Environment Configuration
```bash
# .env.example
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/prepai_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_BUCKET_NAME="prepai-files"
AWS_REGION="us-east-1"

# External Services
SENTRY_DSN="your-sentry-dsn"
```

## 🗄️ STEP 2: Database Setup

### 2.1 Prisma Schema (Key Models)
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  passwordHash      String    @map("password_hash")
  fullName          String    @map("full_name")
  phone             String?
  subscriptionType  String    @default("free") @map("subscription_type")
  targetExams       String[]  @map("target_exams")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  isActive          Boolean   @default(true) @map("is_active")

  quizSessions      UserQuizSession[]
  questionAttempts  UserQuestionAttempt[]
  createdQuestions  Question[] @relation("QuestionCreator")

  @@map("users")
}

model Question {
  id              String    @id @default(uuid())
  questionText    String    @map("question_text")
  options         Json?
  correctAnswer   Json      @map("correct_answer")
  explanation     String?
  difficulty      String
  topicId         String    @map("topic_id")
  subjectId       String    @map("subject_id")
  examId          String    @map("exam_id")
  isHighYield     Boolean   @default(false) @map("is_high_yield")
  aiGenerated     Boolean   @default(false) @map("ai_generated")
  reviewStatus    String    @default("pending") @map("review_status")
  createdBy       String?   @map("created_by")
  createdAt       DateTime  @default(now()) @map("created_at")
  isActive        Boolean   @default(true) @map("is_active")

  creator         User?     @relation("QuestionCreator", fields: [createdBy], references: [id])
  attempts        UserQuestionAttempt[]

  @@map("questions")
}

model UserQuizSession {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  sessionType     String    @map("session_type")
  examId          String    @map("exam_id")
  totalQuestions  Int       @map("total_questions")
  correctAnswers  Int       @map("correct_answers")
  timeTaken       Int       @map("time_taken_seconds")
  startedAt       DateTime  @map("started_at")
  completedAt     DateTime? @map("completed_at")
  isCompleted     Boolean   @default(false) @map("is_completed")

  user            User      @relation(fields: [userId], references: [id])
  attempts        UserQuestionAttempt[]

  @@map("user_quiz_sessions")
}

model UserQuestionAttempt {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  questionId      String    @map("question_id")
  sessionId       String    @map("session_id")
  selectedAnswer  Json      @map("selected_answer")
  isCorrect       Boolean   @map("is_correct")
  timeTaken       Int       @map("time_taken_seconds")
  createdAt       DateTime  @default(now()) @map("created_at")

  user            User      @relation(fields: [userId], references: [id])
  question        Question  @relation(fields: [questionId], references: [id])
  session         UserQuizSession @relation(fields: [sessionId], references: [id])

  @@map("user_question_attempts")
}
```

### 2.2 Database Migration Commands
```bash
# Initialize Prisma
npx prisma init

# Generate and run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

## 🔧 STEP 3: Core Services Implementation

### 3.1 Authentication Service
```typescript
// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(email: string, password: string, fullName: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName
      }
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        subscriptionType: user.subscriptionType
      },
      ...tokens
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        subscriptionType: user.subscriptionType
      },
      ...tokens
    };
  }

  private generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }
}
```

### 3.2 Content Service (Enhanced)
```typescript
// src/services/content.service.ts
import { PrismaClient } from '@prisma/client';
import { Redis } from 'redis';

export class ContentService {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis
  ) {}

  async getQuizQuestions(
    examId: string,
    subjectId: string,
    topicId: string,
    userId: string,
    count: number = 10
  ) {
    // Check cache first
    const cacheKey = `quiz:${examId}:${subjectId}:${topicId}:${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Get user's recent attempts to avoid repetition
    const recentAttempts = await this.prisma.userQuestionAttempt.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: { questionId: true }
    });

    const excludeIds = recentAttempts.map(a => a.questionId);

    // Get user's performance for difficulty adaptation
    const userPerformance = await this.getUserTopicPerformance(userId, topicId);
    const targetDifficulty = this.calculateTargetDifficulty(userPerformance);

    // Fetch questions with intelligent selection
    const questions = await this.prisma.question.findMany({
      where: {
        examId,
        subjectId,
        topicId,
        isActive: true,
        reviewStatus: 'approved',
        id: {
          notIn: excludeIds
        }
      },
      orderBy: [
        { isHighYield: 'desc' },
        { difficulty: targetDifficulty === 'adaptive' ? undefined : 'asc' }
      ],
      take: count * 2 // Get more for randomization
    });

    // Smart selection algorithm
    const selectedQuestions = this.selectQuestionsIntelligently(
      questions,
      count,
      targetDifficulty
    );

    // Cache for 15 minutes
    await this.redis.setex(cacheKey, 900, JSON.stringify(selectedQuestions));

    return selectedQuestions;
  }

  private async getUserTopicPerformance(userId: string, topicId: string) {
    const attempts = await this.prisma.userQuestionAttempt.findMany({
      where: {
        userId,
        question: { topicId }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Last 20 attempts
    });

    if (attempts.length === 0) return null;

    const correctCount = attempts.filter(a => a.isCorrect).length;
    const accuracy = (correctCount / attempts.length) * 100;

    return {
      totalAttempts: attempts.length,
      accuracy,
      recentTrend: this.calculateTrend(attempts.slice(0, 10))
    };
  }

  private calculateTargetDifficulty(performance: any) {
    if (!performance) return 'Easy'; // New users start easy

    if (performance.accuracy > 80) return 'Hard';
    if (performance.accuracy > 60) return 'Medium';
    return 'Easy';
  }

  private selectQuestionsIntelligently(
    questions: any[],
    count: number,
    targetDifficulty: string
  ) {
    // Separate by difficulty
    const easy = questions.filter(q => q.difficulty === 'Easy');
    const medium = questions.filter(q => q.difficulty === 'Medium');
    const hard = questions.filter(q => q.difficulty === 'Hard');

    let selected = [];

    // Adaptive selection based on target difficulty
    if (targetDifficulty === 'Easy') {
      selected = [
        ...this.shuffleArray(easy).slice(0, Math.ceil(count * 0.6)),
        ...this.shuffleArray(medium).slice(0, Math.ceil(count * 0.3)),
        ...this.shuffleArray(hard).slice(0, Math.ceil(count * 0.1))
      ];
    } else if (targetDifficulty === 'Medium') {
      selected = [
        ...this.shuffleArray(easy).slice(0, Math.ceil(count * 0.3)),
        ...this.shuffleArray(medium).slice(0, Math.ceil(count * 0.5)),
        ...this.shuffleArray(hard).slice(0, Math.ceil(count * 0.2))
      ];
    } else {
      selected = [
        ...this.shuffleArray(easy).slice(0, Math.ceil(count * 0.2)),
        ...this.shuffleArray(medium).slice(0, Math.ceil(count * 0.4)),
        ...this.shuffleArray(hard).slice(0, Math.ceil(count * 0.4))
      ];
    }

    return this.shuffleArray(selected).slice(0, count);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private calculateTrend(recentAttempts: any[]) {
    if (recentAttempts.length < 5) return 'stable';
    
    const firstHalf = recentAttempts.slice(0, Math.floor(recentAttempts.length / 2));
    const secondHalf = recentAttempts.slice(Math.floor(recentAttempts.length / 2));
    
    const firstAccuracy = firstHalf.filter(a => a.isCorrect).length / firstHalf.length;
    const secondAccuracy = secondHalf.filter(a => a.isCorrect).length / secondHalf.length;
    
    if (secondAccuracy > firstAccuracy + 0.1) return 'improving';
    if (secondAccuracy < firstAccuracy - 0.1) return 'declining';
    return 'stable';
  }
}
```

## 📊 STEP 4: Admin Dashboard API

### 4.1 Question Management Controller
```typescript
// src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import { ContentService } from '../services/content.service';
import { AIService } from '../services/ai.service';

export class AdminController {
  constructor(
    private contentService: ContentService,
    private aiService: AIService
  ) {}

  async createQuestion(req: Request, res: Response) {
    try {
      const questionData = req.body;
      const createdBy = req.user.id;

      const question = await this.contentService.createQuestion(
        questionData,
        createdBy
      );

      res.status(201).json({
        success: true,
        data: question,
        message: 'Question created and sent for review'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async bulkImportQuestions(req: Request, res: Response) {
    try {
      const { questions } = req.body;
      const createdBy = req.user.id;

      const results = await this.contentService.bulkImportQuestions(
        questions,
        createdBy
      );

      res.json({
        success: true,
        data: results,
        message: `Imported ${results.success} questions, ${results.failed} failed`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async generateQuestionsWithAI(req: Request, res: Response) {
    try {
      const { examId, subjectId, topicId, count, difficulty } = req.body;
      const createdBy = req.user.id;

      const questions = await this.aiService.generateQuestions({
        examId,
        subjectId,
        topicId,
        count,
        difficulty,
        createdBy
      });

      res.json({
        success: true,
        data: questions,
        message: `Generated ${questions.length} questions with AI`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getQuestionAnalytics(req: Request, res: Response) {
    try {
      const analytics = await this.contentService.getQuestionAnalytics();
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
```

This implementation provides:

1. **Scalable Database Schema** - Proper relationships and indexing
2. **Intelligent Content Delivery** - Adaptive difficulty and personalization
3. **Comprehensive Admin Tools** - Question management and AI generation
4. **Performance Optimization** - Redis caching and query optimization
5. **Security** - JWT authentication and input validation

The next steps would be to implement the frontend admin dashboard and integrate with the existing React application.