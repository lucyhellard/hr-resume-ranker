import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Save, Zap, X } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [resumes, setResumes] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const jobDescriptionRef = useRef<HTMLInputElement>(null);
  const resumesRef = useRef<HTMLInputElement>(null);

  const handleJobDescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJobDescription(e.target.files[0]);
    }
  };

  const handleResumesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumes(Array.from(e.target.files));
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

  const handleResumesDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setResumes(Array.from(e.dataTransfer.files));
    }
  };

  const removeResume = (index: number) => {
    setResumes(resumes.filter((_, i) => i !== index));
  };

  const handleRunRanking = async () => {
    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/jobs/1'); // Navigate to mock job dashboard
    }, 3000);
  };

  const handleSaveDraft = () => {
    // Save as draft logic
    navigate('/dashboard');
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
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                className="input"
                placeholder="e.g., San Francisco, CA / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience Required
              </label>
              <select
                id="experience"
                className="input"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
              >
                <option value="">Select experience level</option>
                <option value="0-1">0-1 years (Entry Level)</option>
                <option value="2-3">2-3 years (Junior)</option>
                <option value="4-6">4-6 years (Mid Level)</option>
                <option value="7-10">7-10 years (Senior)</option>
                <option value="10+">10+ years (Lead/Principal)</option>
              </select>
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
        </div>

        {/* Resumes Upload */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidate Resumes</h2>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleResumesDrop}
          >
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {resumes.length > 0 ? (
                  <span className="text-primary-600 font-medium">
                    {resumes.length} resume{resumes.length !== 1 ? 's' : ''} selected
                  </span>
                ) : (
                  <>
                    Drag and drop resumes here, or{' '}
                    <button
                      type="button"
                      className="text-primary-600 hover:text-primary-500"
                      onClick={() => resumesRef.current?.click()}
                    >
                      browse
                    </button>
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Multiple PDF, DOC, DOCX files up to 10MB each
              </p>
            </div>
            <input
              ref={resumesRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={handleResumesUpload}
            />
          </div>

          {/* Resume List */}
          {resumes.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Uploaded Resumes:</h3>
              <div className="space-y-2">
                {resumes.map((resume, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{resume.name}</span>
                    </div>
                    <button
                      onClick={() => removeResume(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleSaveDraft}
            className="btn btn-secondary btn-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Draft
          </button>

          <button
            onClick={handleRunRanking}
            disabled={!jobDescription || resumes.length === 0 || isProcessing}
            className="btn btn-primary btn-lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Run Resume Ranking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;