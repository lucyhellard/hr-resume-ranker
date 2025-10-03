-- Fix missing INSERT policy for jobs table
-- This allows users to create new job records

-- First, let's check existing policies on jobs table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'jobs';

-- Add INSERT policy for jobs table
-- Note: Since you don't have authentication implemented yet, we'll allow all users
-- In production, you should change this to 'authenticated' once auth is implemented
CREATE POLICY "Enable insert for all users" ON "public"."jobs"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

-- Also add SELECT policy so users can read job data
CREATE POLICY "Enable select for all users" ON "public"."jobs"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Add DELETE policy so we can clean up duplicates
CREATE POLICY "Enable delete for all users" ON "public"."jobs"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'jobs'
ORDER BY cmd, policyname;