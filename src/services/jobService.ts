import { supabase } from '../lib/supabase';

export interface CreateJobData {
  id?: string; // Optional custom ID
  title: string;
  hiringManager: string;
  status: 'open' | 'closed' | 'draft';
  closingDate?: string;
  description?: string;
  location?: string;
  experienceRequired?: string;
  jobDescriptionUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  location?: string;
  experience_required?: string;
  applicant_count: number;
  shortlisted_count: number;
  hiring_manager: string;
  status: 'open' | 'closed' | 'draft';
  closing_date?: string;
  job_description_url?: string;
  interview_pack_url?: string;
  drive_folder_id?: string;
  job_description_file_id?: string;
  job_description_content?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const createJob = async (jobData: CreateJobData): Promise<{ id: string }> => {
  console.log('createJob called with:', jobData);

  // Check Supabase connection
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing');
  console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');

  const insertData = {
    title: jobData.title,
    hiring_manager: jobData.hiringManager,
    status: jobData.status,
    closing_date: jobData.closingDate || null,
    description: jobData.description || null,
    location: jobData.location || null,
    experience_required: jobData.experienceRequired || null,
    job_description_url: jobData.jobDescriptionUrl || null,
    // created_by will need to be set when you implement authentication
  };

  console.log('Inserting data:', insertData);

  const { data, error } = await supabase
    .from('jobs')
    .insert(insertData)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating job:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    console.error('Insert data was:', insertData);
    throw new Error(`Failed to create job: ${error.message}`);
  }

  return { id: data.id };
};

export const getJob = async (id: string): Promise<Job> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    throw new Error('Failed to fetch job');
  }

  return data;
};

export const getJobs = async (): Promise<Job[]> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    throw new Error('Failed to fetch jobs');
  }

  return data || [];
};

export const updateJob = async (id: string, updates: Partial<Job>): Promise<Job> => {
  console.log('updateJob called with:', { id, updates });

  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase error updating job:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to update job: ${error.message}`);
  }

  console.log('updateJob successful, returning:', data);
  return data;
};

export const deleteJob = async (id: string): Promise<void> => {
  console.log('deleteJob called with ID:', id);

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting job:', error);
    throw new Error(`Failed to delete job: ${error.message}`);
  }

  console.log('Job deleted successfully:', id);
};