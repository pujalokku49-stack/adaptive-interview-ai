# AI Usage Log

## Project

**Project:** Adaptive AI Interviewer  
**Hackathon:** ABTalks Hackathon  
**Problem Statement:** The Interview Agent  
**Development Period:** Hackathon Day

---

## Purpose

This document records the AI-assisted development workflow used to
build the Adaptive AI Interviewer during the hackathon.

AI coding assistants were used for:

- Project architecture
- Backend implementation
- Frontend implementation
- AI/LLM integration
- Interview logic
- API development
- Debugging
- Testing
- Frontend/backend integration
- Repository preparation

AI-generated code was reviewed, tested, modified, and integrated into
the project during development.

---

# AI Tools Used

- Claude — backend architecture and implementation
- Cursor — coding, debugging, refactoring, and integration
- Antigravity — frontend/application development and integration
- ChatGPT — architecture guidance, debugging, API verification,
  prompt engineering, and development support
- Breeth Pro — AI development memory / MCP assistance when used

---

# Hackathon Day — Development Log

---

# 1. Project Understanding

### AI Tool

Claude / ChatGPT

### Objective

Understand the ABTalks Hackathon problem statement and design the
Adaptive AI Interviewer.

### Prompt

```text
Understand the ABTalks Hackathon problem statement for the Interview
Agent.

I want to build an AI-powered adaptive interview platform.

The system should be able to:

- Manage candidates
- Understand candidate profiles
- Use curriculum information
- Plan interviews
- Generate interview questions
- Adapt questions based on candidate performance
- Evaluate candidate answers
- Maintain interview state and memory
- Provide interview analytics
- Generate final feedback

Help me design a practical full-stack architecture that can be
implemented during the hackathon.

Use a clean and scalable architecture and avoid unnecessary
complexity.

You are my Principal AI Engineer and Backend Architect.

Build the project foundation using TypeScript and Express.

Include:

- Clean Architecture
- TypeScript
- Express
- Zod
- Swagger
- Pino logging
- Error handling
- Docker
- Jest

Separate the application into:

- Domain
- Application
- Infrastructure
- Interfaces
- Shared

Create the HTTP server and project configuration.

Do not implement business logic yet.

Implement the Candidate Profile Loader using the existing backend
architecture.

Include:

- Candidate entity/model
- Repository interface
- Repository implementation
- Service
- DTO
- Controller
- Route
- Validation
- Tests

Candidate information should include:

- Candidate ID
- Name
- Job role
- Experience
- Education
- Skills
- Interview status

Do not modify unrelated modules.
Follow the existing Clean Architecture.

Implement the Curriculum Loader using the existing architecture.

Load curriculum information containing:

- Days
- Topics
- Objectives
- Tools
- Learning outcomes

Create:

- Curriculum model
- Repository
- Service
- DTOs
- Validation
- Controller
- Routes
- Tests

The curriculum must be reusable by the Interview Planner and
Adaptive Question Generator.

Implement the Interview Planner.

Analyze:

- Completed missions
- Attempts
- Skipped topics
- Strengths
- Weaknesses
- Learning signals
- Curriculum

Generate an interview plan with:

- Minimum 8 questions
- At least 4 curriculum days
- Easy to Medium to Hard progression
- Topic prioritization
- Follow-up opportunities

The result must be structured and reusable by the interview session
and adaptive question generator.

Keep business logic inside the application layer.

Implement the Interview State Manager.

Track:

- Session ID
- Candidate ID
- Question number
- Current topic
- Difficulty
- Questions asked
- Topics covered
- Remaining topics
- Interview status
- Current score

Support:

- Starting an interview
- Updating state
- Recording questions
- Recording answers
- Recording evaluations
- Moving to the next question
- Completing the interview

Follow the existing architecture.
Do not regenerate completed modules.

Implement the Conversation Memory Manager.

Remember:

- Previous questions
- Candidate answers
- Evaluation results
- Knowledge gaps
- Strengths
- Weaknesses
- Follow-up history
- Difficulty progression

The memory must be reusable by:

- Interview State Manager
- Adaptive Question Generator
- Evaluation Engine
- Final Feedback Generator

Keep memory management separate from HTTP controllers.

Implement the Adaptive Question Generator.

Use:

- Candidate profile
- Curriculum
- Interview plan
- Interview state
- Conversation memory
- Previous evaluation

The generator must:

- Avoid repeated questions
- Adapt difficulty
- Adapt topic
- Generate follow-up questions
- Detect knowledge gaps
- Maintain interview context

If the candidate performs strongly, increase difficulty.

If the candidate struggles, reduce difficulty or ask a more
fundamental question.

Keep LLM-specific implementation behind the LLM provider abstraction.

Create an LLM provider abstraction.

Create:

- ILLMProvider
- Provider implementation
- Provider composition

The application layer must not directly depend on a specific
LLM provider.

The provider abstraction should support:

- Prompt execution
- Structured responses
- Error handling
- Provider replacement

Keep vendor-specific code inside infrastructure.

Implement retry handling around LLM requests.

Handle temporary failures using:

- Limited retries
- Retry delay
- Error logging
- Maximum retry count
- Controlled final failure

Do not retry indefinitely.

Add tests for:

- Successful request
- Temporary failure
- Multiple retries
- Permanent failure

Implement the Evaluation Engine.

Evaluate candidate answers using:

- Interview question
- Candidate answer
- Topic
- Difficulty
- Expected concepts
- Interview context

Evaluate:

- Technical correctness
- Communication
- Depth
- Examples
- Production thinking
- Reasoning
- Knowledge gaps
- Confidence

Return structured information including:

- Score
- Correctness
- Relevance
- Completeness
- Strengths
- Weaknesses
- Feedback

Validate the generated output before returning it.

Add a deterministic fallback evaluator.

If the LLM evaluator:

- Throws an API error
- Returns invalid JSON
- Returns an invalid structure
- Fails after retries

the interview must continue using deterministic evaluation.

Log the LLM failure but do not crash the interview.

Add tests for the fallback behavior.

Implement interview session management.

The session should support:

- Start session
- Retrieve session
- Track current question
- Store candidate answers
- Evaluate answers
- Generate next question
- Track progress
- Complete session
- Generate final feedback

Use a session repository abstraction.

Keep session state consistent across services.

Implement a Final Feedback Generator.

Analyze the complete interview session.

Use:

- Candidate profile
- Interview plan
- Questions asked
- Candidate answers
- Evaluation results
- Topics covered
- Difficulty progression
- Strengths
- Weaknesses
- Knowledge gaps

Generate:

- Overall performance
- Overall score
- Technical performance
- Communication
- Strengths
- Weaknesses
- Areas for improvement
- Topic-level performance
- Recommendations
- Final assessment

Return structured machine-readable output.

Create validation for the Final Feedback Report.

Validate:

- Required fields
- Score values
- Strengths
- Weaknesses
- Recommendations
- Topic-level performance
- Final assessment

The LLM response must not be trusted directly.

Parse and validate the response before returning it.

Add tests for both valid and invalid reports.

Create the final feedback HTTP controller and route.

The controller should:

1. Receive the request.
2. Retrieve the interview session.
3. Invoke FeedbackGeneratorService.
4. Validate the generated report.
5. Return the structured final feedback.

Keep business logic inside the application service.

Follow the existing route and controller conventions.

Build a professional React + TypeScript frontend for the
Adaptive AI Interviewer.

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Lucide React
- Recharts

Create a modern AI interview platform.

The application should be:

- Responsive
- Professional
- Component-based
- Easy to navigate
- Suitable for a hackathon demonstration

Create a professional dashboard for the Adaptive AI Interviewer.

Include:

- Candidate overview
- Interview statistics
- Active interviews
- Interview progress
- Performance analytics
- Recent activity
- AI insights

Use reusable cards and charts.

Make the dashboard responsive and visually polished.

Create the candidate management interface.

Display:

- Candidate name
- Role
- Experience
- Education
- Status
- Interview progress
- Performance

Use professional cards/table/list components.

The page should be ready to consume backend candidate data.

Create the main interview workspace.

Display:

- Current interview question
- Question number
- Topic
- Difficulty
- Interview progress
- Timer
- Candidate answer input
- Submit action
- AI processing state
- Next-question state

Make the experience feel like a real AI-powered interview.

Handle loading and error states.

Create a curriculum page.

Display:

- Curriculum days
- Topics
- Skills
- Difficulty
- Learning objectives
- Candidate progress

Keep the UI consistent with the main dashboard.

Prepare it to consume backend curriculum data.

Create an analytics dashboard.

Display:

- Overall score
- Topic scores
- Difficulty progression
- Interview progress
- Candidate performance
- Historical information

Use Recharts where appropriate.

Keep charts readable and responsive.

Create a professional interview debrief page.

Display:

- Overall score
- Technical performance
- Communication
- Strengths
- Weaknesses
- Topic performance
- Knowledge gaps
- Recommendations
- Final assessment

Connect it to the backend final feedback API.

Handle:

- Loading
- Empty data
- API errors

Create an AI assistant interface for the Adaptive AI Interviewer.

Include:

- Chat messages
- User input
- AI responses
- Loading state
- Error handling
- Conversation history

Connect the assistant to:

/api/assistant

Keep AI business logic in the backend.

Create a centralized frontend API layer.

The frontend should communicate with the backend through reusable
API services.

Create API functions for:

- Candidates
- Curriculum
- Sessions
- Questions
- Evaluation
- Analytics
- Final feedback
- Assistant

Do not duplicate fetch logic across components.

Add TypeScript types for API responses.

Configure the Vite development server.

Frontend:

http://localhost:5173

Backend:

http://localhost:4000

Proxy all:

/api/*

requests to:

http://localhost:4000

Use:

server: {
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
      secure: false
    }
  }
}

Do not hardcode localhost:4000 throughout the frontend.

The frontend is running on port 5173.

The backend should run on port 4000.

The frontend is showing:

ECONNREFUSED

for:

/api/v1/candidates
/api/v1/sessions
/api/v1/curriculum
/api/assistant

Investigate the frontend/backend connection.

Check:

- Backend process
- Backend port
- Vite proxy
- API route paths
- Frontend API calls
- Environment configuration

Do not rewrite working application functionality.

Verify that the backend API is running.

Test:

http://localhost:4000/api/v1/candidates

Use PowerShell.

Confirm:

- Server is reachable
- HTTP status is 200
- Response contains JSON
- Candidate data is returned

Verify the Vite frontend proxy.

Test:

http://localhost:5173/api/v1/candidates

Use PowerShell with:

Invoke-WebRequest -UseBasicParsing

Confirm that the response is HTTP 200.

If it succeeds, confirm that:

Frontend -> Vite Proxy -> Backend

is working.

Run:

npm run typecheck

inside the Backend directory.

Check for TypeScript errors.

Fix any genuine type errors without weakening the architecture.

Run the complete Jest test suite for the backend.

Check all:

- Application services
- Domain logic
- DTOs
- Validation
- Repositories
- LLM providers
- Routes
- Controllers
- Utilities

Do not skip failing tests.

Fix genuine implementation problems.

Review the complete project directory.

Identify:

- Duplicate frontend folders
- Duplicate backend folders
- Duplicate feedback-generator folders
- Root-level duplicate source folders
- Nested Git repositories
- node_modules
- dist
- build files
- environment files

The final application should contain:

Backend/
Frontend/

Remove only confirmed duplicate or generated content.

Do not remove actual working application code.

Search recursively for .git directories.

The final project should have only one Git repository at the project
root.

If a nested repository exists inside Frontend or another accidental
directory, identify it.

Remove the nested Git repository only if it is confirmed to be
accidental.

Create a root .gitignore for the final Adaptive AI Interviewer
repository.

Ignore:

node_modules/
dist/
build/
.env
.env.*
coverage/
*.log
.vscode/
.idea/
.DS_Store
Thumbs.db

Do not commit API keys or secrets.

Prepare the final Adaptive AI Interviewer project for a public
GitHub repository.

Verify:

- Backend exists
- Frontend exists
- PROMPTS.md exists
- README exists
- .gitignore exists
- No secrets are tracked
- No node_modules are tracked
- No dist/build output is tracked
- No accidental duplicate source exists
- No accidental nested Git repository exists

The final repository should represent the complete integrated
frontend and backend application.

Configure the final GitHub repository for the Adaptive AI Interviewer.

Repository:

https://github.com/Anuhya-Kurakula/Adaptive-Interview-AI.git

Set it as the origin remote.

Verify:

git remote -v

Then prepare the repository for the final push.

Before pushing the final project, check git status.

Verify that the staged files contain the intended:

- Backend
- Frontend
- PROMPTS.md
- README.md
- .gitignore

Make sure these are NOT staged:

- node_modules
- dist
- .env
- generated build files
- accidental duplicate repositories
- temporary files

Perform the final verification of the complete Adaptive AI
Interviewer.

Verify:

1. Backend starts successfully.
2. Frontend starts successfully.
3. Backend API returns HTTP 200.
4. Frontend proxy returns HTTP 200.
5. Frontend build succeeds.
6. Backend typecheck succeeds.
7. Backend tests pass.
8. Swagger works.
9. Final feedback functionality exists.
10. No secrets are committed.
11. No duplicate nested Git repository remains.
12. Backend and Frontend are present in the final project.

Report any remaining issue before GitHub submission.