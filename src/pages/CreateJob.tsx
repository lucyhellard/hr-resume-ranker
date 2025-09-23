import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { sendJobToN8N } from '../utils/webhookService';

const CreateJob = () => {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState('');
  const [hiringManager, setHiringManager] = useState('');
  const [status, setStatus] = useState<'open' | 'closed' | 'draft'>('draft');
  const [closingDate, setClosingDate] = useState('');
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const jobDescriptionRef = useRef<HTMLInputElement>(null);

  const handleJobDescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJobDescription(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleJobDescriptionDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setJobDescription(e.dataTransfer.files[0]);
    }
  };

  const handleCreateJob = async () => {
    if (!jobDescription) return;

    setIsCreating(true);
    setError('');

    try {
      const jobData = {
        jobTitle,
        hiringManager,
        status,
        closingDate,
      };

      // Send data to n8n webhook
      await sendJobToN8N(jobData, jobDescription);

      // Generate job ID and navigate
      const newJobId = Math.random().toString(36).substr(2, 9);
      navigate(`/jobs/${newJobId}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      setError('Failed to create job. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
        <p className="text-gray-600 mt-1">
          Upload the JD and resumes — we'll generate ranked candidates in minutes.
        </p>
      </div>

      <div className="space-y-8">
        {/* Job Details Section */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Role Title
              </label>
              <input
                type="text"
                id="jobTitle"
                className="input"
                placeholder="e.g., Senior Frontend Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="hiringManager" className="block text-sm font-medium text-gray-700 mb-2">
                Hiring Manager
              </label>
              <input
                type="text"
                id="hiringManager"
                className="input"
                placeholder="e.g., Sarah Chen"
                value={hiringManager}
                onChange={(e) => setHiringManager(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'open' | 'closed' | 'draft')}
              >
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700 mb-2">
                Closing Date
              </label>
              <input
                type="date"
                id="closingDate"
                className="input"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Job Description Upload */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleJobDescriptionDrop}
          >
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {jobDescription ? (
                  <span className="text-primary-600 font-medium">
                    {jobDescription.name}
                  </span>
                ) : (
                  <>
                    Drag and drop your job description here, or{' '}
                    <button
                      type="button"
                      className="text-primary-600 hover:text-primary-500"
                      onClick={() => jobDescriptionRef.current?.click()}
                    >
                      browse
                    </button>
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX up to 10MB
              </p>
            </div>
            <input
              ref={jobDescriptionRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleJobDescriptionUpload}
            />
          </div>

          {/* Create Job Button */}
          <div className="mt-6 flex flex-col items-center">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <button
              onClick={handleCreateJob}
              disabled={!jobTitle.trim() || !hiringManager.trim() || !jobDescription || isCreating}
              className="btn btn-primary btn-lg"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Job...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Job
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateJob;