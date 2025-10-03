import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, Star, AlertTriangle, CheckCircle, UserPlus, AlertCircle, UserCheck, Loader2, ArrowLeft, ExternalLink, FileText } from 'lucide-react';
// import { Candidate } from '../types';
import { getScoreColorClass, formatScore } from '../utils/scoring';
import { getApplicant, updateApplicantStatus, Applicant } from '../services/applicantService';

const ApplicantDashboard = () => {
  const { applicantId, jobId } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pipelineStage, setPipelineStage] = useState<string>('applied');
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [shortlistError, setShortlistError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicant = async () => {
      if (!applicantId) return;

      try {
        setLoading(true);
        const applicantData = await getApplicant(applicantId);
        setApplicant(applicantData);
        setPipelineStage(applicantData.status);
      } catch (err) {
        console.error('Error fetching applicant:', err);
        setError('Failed to load applicant data');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [applicantId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!applicant) return;

    try {
      await updateApplicantStatus(applicant.id, newStatus as Applicant['status']);
      setPipelineStage(newStatus);
      setApplicant({ ...applicant, status: newStatus as Applicant['status'] });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleShortlist = async () => {
    if (!applicant) return;

    try {
      setShortlistLoading(true);
      setShortlistError(null);
      const newStatus = applicant.status === 'shortlisted' ? 'applied' : 'shortlisted';

      await updateApplicantStatus(applicant.id, newStatus);
      setPipelineStage(newStatus);
      setApplicant({ ...applicant, status: newStatus });
    } catch (err) {
      console.error('Error updating shortlist status:', err);
      setShortlistError('Failed to update shortlist status. Please try again.');
      // Clear error after 5 seconds
      setTimeout(() => setShortlistError(null), 5000);
    } finally {
      setShortlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading applicant data...</span>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading applicant</h3>
        <p className="mt-1 text-sm text-gray-500">{error || 'Applicant not found'}</p>
      </div>
    );
  }

  // Generate interview questions based on applicant data
  const interviewQuestions = applicant.interviewquestions || [
    {
      question: "Tell me about your experience with the key technologies mentioned in your resume.",
      rationale: "Look for specific examples and depth of knowledge in their claimed skills."
    },
    {
      question: "How do you stay current with technology trends in your field?",
      rationale: "Assess their commitment to continuous learning and professional development."
    },
    {
      question: "Describe a challenging project you've worked on and how you overcame obstacles.",
      rationale: "Evaluate problem-solving skills, resilience, and project management abilities."
    }
  ];

  const handleViewResume = () => {
    if (applicant.resume_url) {
      window.open(applicant.resume_url, '_blank');
    }
  };

  const handleViewCoverLetter = () => {
    if (applicant.cover_letter_url) {
      window.open(applicant.cover_letter_url, '_blank');
    }
  };

  // Get skills detail from applicant and parse JSON if available
  const skillsDetail = applicant.skills_detail || null;

  // Debug logging
  console.log('Skills detail raw data:', skillsDetail);
  console.log('Skills detail type:', typeof skillsDetail);

  // Process skills data (already parsed from JSONB)
  const skillsData = (() => {
    if (!skillsDetail) {
      console.log('No skills detail available');
      return null;
    }

    console.log('Skills detail data:', skillsDetail);
    console.log('Skills detail type:', typeof skillsDetail);

    // If it's already an object (from JSONB), use it directly
    if (typeof skillsDetail === 'object' && skillsDetail !== null) {
      const processedData = Object.entries(skillsDetail).map(([skill, level]) => ({
        skill,
        level: level === "Not found" ? null : Number(level),
        found: level !== "Not found"
      }));
      console.log('Processed skills data:', processedData);
      return processedData;
    }

    // If it's a string, try to parse it
    if (typeof skillsDetail === 'string') {
      try {
        const parsed = JSON.parse(skillsDetail);
        console.log('Parsed skills data:', parsed);

        if (typeof parsed === 'object' && parsed !== null) {
          const processedData = Object.entries(parsed).map(([skill, level]) => ({
            skill,
            level: level === "Not found" ? null : Number(level),
            found: level !== "Not found"
          }));
          console.log('Processed skills data:', processedData);
          return processedData;
        }
      } catch (e) {
        console.warn('Failed to parse skills detail JSON:', e);
        console.log('Raw data that failed to parse:', skillsDetail);
      }
    }

    return null;
  })();

  // Get overall score from individual column
  const overallScore = parseFloat(applicant.overall || '0');

  const radarData = [
    { category: 'Job Match', score: parseFloat(applicant.jobmatch || '0') },
    { category: 'Experience', score: parseFloat(applicant.experience || '0') },
    { category: 'Skills', score: parseFloat(applicant.skills || '0') },
    { category: 'Culture', score: parseFloat(applicant.culture || '0') },
    { category: 'Education', score: parseFloat(applicant.education || '0') },
    { category: 'Achievements', score: parseFloat(applicant.achievements || '0') }
  ];

  // Helper function to check for missing data
  const isMissingData = (value: any) => {
    return value === null || value === undefined || value === '' ||
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  };

  // Check for data gaps
  const dataGaps = {
    phone: isMissingData(applicant.phone),
    strengths: isMissingData(applicant.strengths),
    gaps: isMissingData(applicant.gaps),
    resumeContent: isMissingData(applicant.resume_content),
    coverLetter: isMissingData(applicant.cover_letter_content),
    hasZeroScores: overallScore === 0
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(`/jobs/${jobId || applicant?.job_id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Job Dashboard
        </button>
      </div>

      {/* Data Gaps Alert */}
      {Object.values(dataGaps).some(gap => gap) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Missing Data Detected
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {dataGaps.phone && <li>Phone number not provided</li>}
                  {dataGaps.strengths && <li>No strengths analysis available</li>}
                  {dataGaps.gaps && <li>No skill gaps identified</li>}
                  {dataGaps.resumeContent && <li>Resume content not processed</li>}
                  {dataGaps.coverLetter && <li>Cover letter not available</li>}
                  {dataGaps.hasZeroScores && <li>Candidate scoring not completed</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicant Profile – {applicant.name}</h1>
          <p className="text-gray-600 mt-1">Detailed candidate analysis and interview preparation</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {shortlistError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
              {shortlistError}
            </div>
          )}
          <div className="flex space-x-3">
          <button
            onClick={handleShortlist}
            disabled={shortlistLoading}
            className={`btn btn-md ${
              applicant.status === 'shortlisted'
                ? 'bg-success-600 hover:bg-success-700 text-white border-success-600'
                : 'btn-secondary'
            }`}
          >
            {shortlistLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : applicant.status === 'shortlisted' ? (
              <UserCheck className="w-4 h-4 mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            {shortlistLoading ? 'Updating...' :
             applicant.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
          </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{applicant.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className={`w-5 h-5 mr-3 ${dataGaps.phone ? 'text-yellow-400' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className={`text-sm font-medium ${dataGaps.phone ? 'text-yellow-600 italic' : 'text-gray-900'}`}>
                    {applicant.phone || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
            {dataGaps.hasZeroScores && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">⚠️ Scoring analysis not yet completed for this candidate</p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(applicant.scores).map(([key, score]) => (
                <div key={key} className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${
                    score >= 85 ? 'text-success-600' :
                    score >= 70 ? 'text-warning-600' : 'text-danger-600'
                  }`}>
                    {formatScore(score)}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {key === 'jobMatch' ? 'Job Match' : key}
                  </div>
                  <div className={`mt-2 h-2 rounded-full ${getScoreColorClass(score)}`}>
                    <div
                      className="h-full rounded-full bg-current opacity-30"
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-success-500 mr-2" />
                Top Strengths
              </h3>
              {dataGaps.strengths ? (
                <div className="text-center py-4">
                  <AlertCircle className="mx-auto h-8 w-8 text-yellow-400 mb-2" />
                  <p className="text-sm text-yellow-600">No strengths analysis available</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {applicant.strengths?.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <Star className="w-4 h-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-warning-500 mr-2" />
                Key Gaps
              </h3>
              {dataGaps.gaps ? (
                <div className="text-center py-4">
                  <AlertCircle className="mx-auto h-8 w-8 text-yellow-400 mb-2" />
                  <p className="text-sm text-yellow-600">No skill gaps analysis available</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {applicant.gaps?.map((gap, index) => (
                    <li key={index} className="flex items-start">
                      <AlertTriangle className="w-4 h-4 text-warning-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{gap}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Analysis</h3>
            {!skillsData ? (
              <div className="text-center py-4">
                <AlertCircle className="mx-auto h-8 w-8 text-yellow-400 mb-2" />
                <p className="text-sm text-yellow-600">No skills analysis available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skillsData.map((skill, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                      <div className="flex items-center space-x-1">
                        {skill.found ? (
                          <div className="w-2 h-2 bg-success-500 rounded-full" title="Skill found"></div>
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full" title="Not found"></div>
                        )}
                      </div>
                    </div>
                    {skill.found && skill.level !== null ? (
                      <>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-full rounded-full ${
                              skill.level >= 80 ? 'bg-success-500' :
                              skill.level >= 60 ? 'bg-warning-500' :
                              skill.level > 0 ? 'bg-orange-500' : ''
                            }`}
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {skill.level}%
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 mt-1">
                        Not found
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resume Content */}
          {applicant.resume_content && (
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Resume Content</h3>
                {applicant.resume_url && (
                  <button
                    onClick={handleViewResume}
                    className="flex items-center text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View Resume
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {applicant.resume_content}
                </pre>
              </div>
            </div>
          )}

          {/* Cover Letter Content */}
          {applicant.cover_letter_content && (
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cover Letter Content</h3>
                {applicant.cover_letter_url && (
                  <button
                    onClick={handleViewCoverLetter}
                    className="flex items-center text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View Cover Letter
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {applicant.cover_letter_content}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="card p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Score</h3>
            <div className={`text-4xl font-bold mb-2 ${
              overallScore >= 85 ? 'text-success-600' :
              overallScore >= 70 ? 'text-warning-600' : 'text-danger-600'
            }`}>
              {formatScore(overallScore)}
            </div>
            <div className={`text-sm font-medium ${getScoreColorClass(overallScore)}`}>
              {overallScore >= 85 ? 'Excellent Match' :
               overallScore >= 70 ? 'Good Match' :
               overallScore > 0 ? 'Fair Match' : 'Not Scored'}
            </div>
          </div>

          {/* Pipeline Stage */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stage</h3>
            {applicant.status === 'shortlisted' && (
              <div className="mb-3 p-2 bg-success-50 border border-success-200 rounded-md">
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 text-success-600 mr-2" />
                  <span className="text-sm text-success-800 font-medium">Shortlisted Candidate</span>
                </div>
              </div>
            )}
            <select
              value={pipelineStage}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="input w-full"
            >
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Gap Radar */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Radar</h3>
            <div className="space-y-3">
              {radarData.map((item: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.category}</span>
                    <span className="font-medium">{formatScore(item.score)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        item.score >= 85 ? 'bg-success-500' :
                        item.score >= 70 ? 'bg-warning-500' : 'bg-danger-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Intelligence */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Questions</h3>
            <div className="space-y-4">
              {interviewQuestions.map((item: any, index: number) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Q{index + 1}: {item.question}
                  </p>
                  <p className="text-xs text-gray-600">
                    💡 {item.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;