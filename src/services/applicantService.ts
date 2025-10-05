import { supabase } from '../lib/supabase';

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  job_id: string;
  resume_url?: string;
  resume_file_id?: string;
  cover_letter_url?: string;
  cover_letter_id?: string;
  resume_content?: string;
  cover_letter_content?: string;
  scores: {
    jobMatch: number;
    experience: number;
    skills: number;
    culture: number;
    education: number;
    achievements: number;
    overall: number;
  };
  strengths?: string[] | null;
  gaps?: string[] | null;
  skills_breakdown: {
    required: string[];
    actual: string[];
  };
  status: 'applied' | 'shortlisted' | 'interview' | 'offer' | 'rejected';
  created_at: string;
  updated_at: string;
  // Individual score fields from database
  interviewquestions?: any;
  jobmatch?: string | null;
  experience?: string | null;
  skills_detail?: string | null;
  skills?: string | null;
  culture?: string | null;
  education?: string | null;
  achievements?: string | null;
  overall?: string | null;
  interview_time?: string | null;
  interview_link?: string | null;
  shortlist_email_sent?: boolean | null;
}

export const getApplicantsByJobId = async (jobId: string): Promise<Applicant[]> => {
  const { data, error } = await supabase
    .from('applicants')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applicants:', error);
    throw new Error('Failed to fetch applicants');
  }

  // Process the data to handle score fallbacks and null values
  const processedData = (data || []).map(applicant => {
    // If JSONB scores are all 0, try to use individual score fields
    const hasJsonbScores = applicant.scores?.overall > 0;

    let scores = applicant.scores;
    if (!hasJsonbScores && (applicant.overall || applicant.jobmatch)) {
      scores = {
        jobMatch: parseInt(applicant.jobmatch) || 0,
        experience: parseInt(applicant.experience) || 0,
        skills: parseInt(applicant.skills) || 0,
        culture: parseInt(applicant.culture) || 0,
        education: parseInt(applicant.education) || 0,
        achievements: parseInt(applicant.achievements) || 0,
        overall: parseInt(applicant.overall) || 0,
      };
    }

    return {
      ...applicant,
      scores,
      strengths: applicant.strengths || [],
      gaps: applicant.gaps || [],
      skills_breakdown: applicant.skills || { required: [], actual: [] }
    };
  });

  return processedData;
};

export const getApplicant = async (id: string): Promise<Applicant> => {
  const { data, error } = await supabase
    .from('applicants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching applicant:', error);
    throw new Error('Failed to fetch applicant');
  }

  // Apply same processing as in getApplicantsByJobId
  const hasJsonbScores = data.scores?.overall > 0;

  let scores = data.scores;
  if (!hasJsonbScores && (data.overall || data.jobmatch)) {
    scores = {
      jobMatch: parseInt(data.jobmatch) || 0,
      experience: parseInt(data.experience) || 0,
      skills: parseInt(data.skills) || 0,
      culture: parseInt(data.culture) || 0,
      education: parseInt(data.education) || 0,
      achievements: parseInt(data.achievements) || 0,
      overall: parseInt(data.overall) || 0,
    };
  }

  return {
    ...data,
    scores,
    strengths: data.strengths || [],
    gaps: data.gaps || [],
    skills_breakdown: data.skills || { required: [], actual: [] }
  };
};

export const updateApplicantStatus = async (id: string, status: Applicant['status']) => {
  console.log('Updating applicant status:', { id, status });

  const { data, error } = await supabase
    .from('applicants')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Detailed error updating applicant status:', {
      error,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });

    // More specific error messages
    if (error.code === 'PGRST116') {
      throw new Error('Applicant not found');
    } else if (error.code === '42501' || error.message?.includes('RLS')) {
      throw new Error('Database permissions issue: Missing UPDATE policy for applicants table');
    } else {
      throw new Error(`Update failed: ${error.message || 'Unknown database error'}`);
    }
  }

  if (!data) {
    throw new Error('No data returned from update operation');
  }

  console.log('Successfully updated applicant status:', data);
  return data;
};