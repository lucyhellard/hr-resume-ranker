-- HR Resume Ranker Supabase Schema
-- Create tables for Login (Users), Jobs, and Applicants

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for login/authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'recruiter' CHECK (role IN ('recruiter', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    experience_required VARCHAR(255),
    applicant_count INTEGER DEFAULT 0,
    shortlisted_count INTEGER DEFAULT 0,
    hiring_manager VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('open', 'closed', 'draft')),
    closing_date DATE,
    job_description_url VARCHAR(500), -- URL to uploaded job description file
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applicants table
CREATE TABLE applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    resume_url VARCHAR(500), -- URL to uploaded resume file

    -- Scoring data (stored as JSONB for flexibility)
    scores JSONB DEFAULT '{
        "jobMatch": 0,
        "experience": 0,
        "skills": 0,
        "culture": 0,
        "education": 0,
        "achievements": 0,
        "overall": 0
    }',

    -- Arrays for strengths and gaps
    strengths TEXT[],
    gaps TEXT[],

    -- Skills data (stored as JSONB)
    skills JSONB DEFAULT '{
        "required": [],
        "actual": []
    }',

    status VARCHAR(50) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interview', 'offer', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table (optional, for tracking generated reports)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('shortlist', 'interview-pack', 'bias-free-comparison')),
    url VARCHAR(500), -- URL to generated report file
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_applicants_job_id ON applicants(job_id);
CREATE INDEX idx_applicants_status ON applicants(status);
CREATE INDEX idx_applicants_email ON applicants(email);
CREATE INDEX idx_reports_job_id ON reports(job_id);
CREATE INDEX idx_reports_created_by ON reports(created_by);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicants_updated_at BEFORE UPDATE ON applicants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (customize based on your auth requirements)
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can view all jobs
CREATE POLICY "Users can view jobs" ON jobs
    FOR SELECT USING (true);

-- Users can create jobs
CREATE POLICY "Users can create jobs" ON jobs
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update jobs they created
CREATE POLICY "Users can update own jobs" ON jobs
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can view applicants for jobs
CREATE POLICY "Users can view applicants" ON applicants
    FOR SELECT USING (true);

-- Users can create applicants
CREATE POLICY "Users can create applicants" ON applicants
    FOR INSERT WITH CHECK (true);

-- Users can view reports
CREATE POLICY "Users can view reports" ON reports
    FOR SELECT USING (true);

-- Users can create reports
CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = created_by);