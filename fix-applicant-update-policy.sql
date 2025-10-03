-- Fix for applicant status update - Add missing UPDATE policy
-- Run this in your Supabase SQL editor

-- Add UPDATE policy for applicants table
CREATE POLICY "Users can update applicants" ON applicants
    FOR UPDATE USING (true);

-- Optional: Create RPC function for updating applicant status (more secure alternative)
CREATE OR REPLACE FUNCTION update_applicant_status(applicant_id UUID, new_status TEXT)
RETURNS applicants AS $$
DECLARE
    updated_applicant applicants%ROWTYPE;
BEGIN
    UPDATE applicants
    SET status = new_status, updated_at = NOW()
    WHERE id = applicant_id
    RETURNING * INTO updated_applicant;

    RETURN updated_applicant;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;