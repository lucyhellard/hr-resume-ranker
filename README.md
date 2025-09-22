# HR Resume Ranker

A modern, intuitive web application designed as a recruiter's cockpit for faster, fairer hiring. The app provides end-to-end recruitment management from job creation to candidate analysis and reporting.

## Features

### 🔐 Secure Authentication
- Clean login interface with email/password authentication
- Professional branding and messaging

### 📊 Comprehensive Dashboard
- Central hub for all recruitment activities
- Job management with status tracking (Open/Closed/Draft)
- Key metrics: applicant counts, shortlisted candidates, time saved

### 📝 Job Creation & Management
- Intuitive job creation with drag-drop file uploads
- Job description and resume batch processing
- Real-time progress tracking

### 🎯 Intelligent Candidate Ranking
- AI-powered candidate scoring across multiple dimensions:
  - Job Match Score
  - Experience Relevance
  - Skills Coverage
  - Culture Alignment
  - Education Score
- Traffic light scoring system (🟢🟠🔴)
- Bias-free mode for anonymous review

### 👤 Detailed Candidate Profiles
- Comprehensive applicant analysis
- Strengths vs gaps breakdown
- Skills heatmap (required vs actual)
- Performance radar charts
- AI-generated interview questions with suggested answers
- Pipeline stage management

### 📈 Results & Comparison
- High-level candidate comparison view
- Adjustable scoring weights
- Top 3 candidates side-by-side analysis
- Advanced filtering and search

### 📋 Report Generation
- Multiple report types:
  - Shortlist Reports (ranked candidates)
  - Interview Packs (tailored questions)
  - Bias-Free Analysis (anonymous comparison)
- Secure report storage and sharing
- Export functionality

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router Dom
- **Build Tool**: Vite
- **UI Components**: Custom components with Radix UI primitives

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd hr-resume-ranker
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open your browser and navigate to \`http://localhost:5173\`

### Demo Login
Use any email and password to access the demo application.

## Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main app layout with navigation
├── pages/              # Page components
│   ├── Login.tsx       # Authentication page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── CreateJob.tsx   # Job creation form
│   ├── JobDashboard.tsx        # Job-specific candidate view
│   ├── ApplicantDashboard.tsx  # Detailed candidate profile
│   ├── ResultsDashboard.tsx    # Comparison and results
│   └── Reports.tsx     # Report management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── cn.ts          # Class name utilities
│   └── scoring.ts     # Scoring helper functions
└── App.tsx            # Main app component with routing
\`\`\`

## Design Principles

- **Clean & Modern**: Minimal design with strategic use of whitespace
- **Professional**: Appropriate for enterprise recruiting workflows
- **Intuitive**: Clear navigation and action flows
- **Accessible**: Proper color contrast and semantic markup
- **Responsive**: Works seamlessly across desktop and mobile devices

## Key User Flows

1. **Login** → **Dashboard** → **Create Job** → **Upload JD & Resumes** → **Run Ranking**
2. **Job Dashboard** → **Review Candidates** → **Applicant Deep Dive** → **Export Interview Pack**
3. **Results Dashboard** → **Compare Top Candidates** → **Generate Reports**
4. **Reports Hub** → **Download/Share Reports** → **Create New Analysis**

## Features Implemented

✅ Login Page with authentication flow
✅ Dashboard with job management table
✅ Create Job page with file upload functionality
✅ Job Dashboard with candidate ranking table
✅ Applicant Dashboard with detailed candidate view
✅ Results Dashboard with comparison features
✅ Reports page with export functionality
✅ Responsive design and micro-animations
✅ Traffic light scoring system
✅ Bias-free mode toggle
✅ Interview question generation

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is for demonstration purposes.