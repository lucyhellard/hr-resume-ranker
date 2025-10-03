-- Fix missing UPDATE policy for jobs table
-- This allows authenticated users to update job records

-- First, let's check if there are existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'jobs';

-- Add UPDATE policy for jobs table
CREATE POLICY "Enable update for authenticated users" ON "public"."jobs"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'jobs';