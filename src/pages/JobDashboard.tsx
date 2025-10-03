import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart3, Clock, Users, Target, Plus, FileText, ExternalLink, Copy, Edit2, CheckCircle, Circle, Calendar, RefreshCw } from 'lucide-react';
import { getScoreColorClass, formatScore } from '../utils/scoring';
import { getJob, updateJob } from '../services/jobService';
import { getApplicantsByJobId, Applicant } from '../services/applicantService';
import { generateInterviewPack, sendShortlistEmail } from '../utils/webhookService';

const getTimeUntilInterview = (interviewTime: string): string => {
  // Get current time in UTC
  const now = new Date();
  const nowUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );

  const interview = new Date(interviewTime);
  const diffMs = interview.getTime() - nowUtc;

  if (diffMs < 0) {
    return 'Past';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes % 60}m`;
  } else {
    return `${diffMinutes}m`;
  }
};

const JobDashboard = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [jobData, setJobData] = useState<any>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingClosingDate, setEditingClosingDate] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string | null>(null);
  const [interviewPackGenerating, setInterviewPackGenerating] = useState(false);
  const [interviewPackUrl, setInterviewPackUrl] = useState<string | null>(null);
  const [sendingShortlistEmail, setSendingShortlistEmail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) return;

      try {
        const [job, applicantData] = await Promise.all([
          getJob(jobId),
          getApplicantsByJobId(jobId)
        ]);

        setJobData(job);
        setApplicants(applicantData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const jobTitle = jobData?.title || (loading ? "Loading..." : "Job Title Not Found");

  // Calculate real stats from candidate data
  const shortlistedCandidates = applicants.filter(app => app.status === 'shortlisted');
  const averageScore = applicants.length > 0
    ? Math.round(applicants.reduce((sum, app) => sum + parseFloat(app.overall || '0'), 0) / applicants.length)
    : 0;

  const stats = {
    candidates: applicants.length,
    shortlisted: shortlistedCandidates.length,
    averageScore,
    timeSaved: `${Math.round(applicants.length * 0.4)}h`
  };

  // Use applicants directly with individual database columns
  const candidates = applicants;

  const handleViewCandidate = (candidateId: string) => {
    navigate(`/jobs/${jobId}/applicants/${candidateId}`);
  };


  const handleCopySubmissionUrl = () => {
    const submissionUrl = `https://wotai-client.sandintheface.com/form/submit_resume?jobId=${jobId}`;
    navigator.clipboard.writeText(submissionUrl);
    // You could add a toast notification here
  };

  const handleViewJobDescription = () => {
    if (jobData?.job_description_url) {
      window.open(jobData.job_description_url, '_blank');
    }
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 85) return 'text-success-600';
    if (score >= 70) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Circle className="w-4 h-4 text-success-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'draft':
        return <Edit2 className="w-4 h-4 text-warning-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-success-100 text-success-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      case 'draft':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusUpdate = async (newStatus: 'open' | 'closed' | 'draft') => {
    if (!jobId || !jobData) {
      console.log('Missing jobId or jobData:', { jobId, jobData });
      return;
    }

    console.log('Updating job status:', { jobId, newStatus, currentStatus: jobData.status });

    try {
      setUpdateLoading(true);
      const updatedJob = await updateJob(jobId, { status: newStatus });
      console.log('Job updated successfully:', updatedJob);
      setJobData(updatedJob);
      setEditingStatus(false);
    } catch (error) {
      console.error('Error updating job status:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleClosingDateUpdate = async (newDate: string) => {
    if (!jobId || !jobData) return;

    try {
      setUpdateLoading(true);
      const updatedJob = await updateJob(jobId, { closing_date: newDate });
      setJobData(updatedJob);
      setEditingClosingDate(false);
    } catch (error) {
      console.error('Error updating closing date:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleRefreshData = async () => {
    if (!jobId) return;

    setRefreshing(true);
    try {
      console.log('=== REFRESHING DATA ===');
      console.log('Current job data before refresh:', jobData);
      console.log('Current candidates count before refresh:', applicants.length);

      const [job, applicantData] = await Promise.all([
        getJob(jobId),
        getApplicantsByJobId(jobId)
      ]);

      console.log('New job data from API:', job);
      console.log('New candidates count from API:', applicantData.length);
      console.log('New candidates data:', applicantData);

      setJobData(job);
      setApplicants(applicantData);
      setLastRefreshTime(new Date().toLocaleTimeString());

      console.log('State updated successfully');
      console.log('=== REFRESH COMPLETE ===');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGenerateInterviewPack = async () => {
    if (!jobId) return;

    // If pack is already generated, open it
    if (interviewPackUrl) {
      window.open(interviewPackUrl, '_blank');
      return;
    }

    setInterviewPackGenerating(true);
    try {
      console.log('Starting interview pack generation for jobId:', jobId);
      const response = await generateInterviewPack(jobId);
      console.log('Interview pack generated successfully:', response);

      // Webhook confirms creation, now fetch the updated job data to get the URL
      console.log('Fetching updated job data to get interview pack URL...');
      const updatedJob = await getJob(jobId);
      console.log('Updated job data:', updatedJob);

      if (updatedJob.interview_pack_url) {
        console.log('Interview pack URL found:', updatedJob.interview_pack_url);
        setInterviewPackUrl(updatedJob.interview_pack_url);
        setJobData(updatedJob); // Update job data in state
        window.open(updatedJob.interview_pack_url, '_blank');
      } else {
        console.warn('No interview pack URL found in job data');
        alert('Interview pack was created but URL not found. Try refreshing the page.');
      }
    } catch (error: any) {
      console.error('Error generating interview pack:', error);
      const errorMessage = error.message || 'Failed to generate interview pack';
      alert(`Error generating interview pack: ${errorMessage}`);
    } finally {
      setInterviewPackGenerating(false);
    }
  };

  const handleAdviseShortlist = async () => {
    if (!jobId) return;

    setSendingShortlistEmail(true);
    try {
      console.log('Sending shortlist email for jobId:', jobId);
      const response = await sendShortlistEmail(jobId);
      console.log('Shortlist email sent successfully:', response);
      alert('Shortlist notification emails sent successfully!');
    } catch (error: any) {
      console.error('Error sending shortlist emails:', error);
      const errorMessage = error.message || 'Failed to send shortlist emails';
      alert(`Error sending shortlist emails: ${errorMessage}`);
    } finally {
      setSendingShortlistEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading job data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Dashboard – {jobTitle}</h1>
          <p className="text-gray-600 mt-1">Review and manage candidates for this position</p>

          {/* Job Status and Closing Date */}
          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              {editingStatus ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={jobData?.status || 'draft'}
                    onChange={(e) => handleStatusUpdate(e.target.value as 'open' | 'closed' | 'draft')}
                    disabled={updateLoading}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    onClick={() => setEditingStatus(false)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(jobData?.status || 'draft')}`}>
                    {getStatusIcon(jobData?.status || 'draft')}
                    <span className="ml-1 capitalize">{jobData?.status || 'draft'}</span>
                  </span>
                  <button
                    onClick={() => setEditingStatus(true)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Edit status"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Closing Date:</span>
              {editingClosingDate ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={jobData?.closing_date || ''}
                    onChange={(e) => handleClosingDateUpdate(e.target.value)}
                    disabled={updateLoading}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={() => setEditingClosingDate(false)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {jobData?.closing_date ? new Date(jobData.closing_date).toLocaleDateString() : 'Not set'}
                  </div>
                  <button
                    onClick={() => setEditingClosingDate(true)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Edit closing date"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Job Links */}
          <div className="space-y-3 mt-6 mb-4">
            {jobData?.job_description_url && (
              <div>
                <button
                  onClick={handleViewJobDescription}
                  className="flex items-center text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  View Job Description
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open(`https://wotai-client.sandintheface.com/form/submit_resume?jobId=${jobId}`, '_blank')}
                className="flex items-center text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                <FileText className="w-4 h-4 mr-1" />
                Candidate Submission URL
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
              <button
                onClick={handleCopySubmissionUrl}
                className="text-gray-400 hover:text-gray-600"
                title="Copy URL"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-3">
          <button
            onClick={() => window.open(`https://wotai-client.sandintheface.com/form/submit_resume?jobId=${jobId}`, '_blank')}
            className="btn btn-primary btn-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Candidate
          </button>
          <div className="flex flex-col items-end">
            <button
              onClick={handleRefreshData}
              disabled={refreshing}
              className="btn btn-secondary btn-md"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Update Data'}
            </button>
            {lastRefreshTime && (
              <span className="text-xs text-gray-500 mt-1">
                Last updated: {lastRefreshTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Candidates</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.candidates}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-success-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Shortlisted</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.shortlisted}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-warning-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Time Saved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.timeSaved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Times Section */}
      {applicants.some(app => app.status === 'shortlisted') && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Shortlisted and Interviews</h3>
            <button
              onClick={handleGenerateInterviewPack}
              disabled={interviewPackGenerating}
              className="btn btn-secondary btn-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              {interviewPackGenerating
                ? 'Generating...'
                : interviewPackUrl
                  ? 'View Interview Pack'
                  : 'Generate Interview Pack'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shortlist Email Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interview Booked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interview Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interview Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applicants
                  .filter(app => app.status === 'shortlisted')
                  .sort((a, b) => {
                    // Sort by interview time if both have it, otherwise put those without time at the end
                    if (a.interview_time && b.interview_time) {
                      return new Date(a.interview_time).getTime() - new Date(b.interview_time).getTime();
                    }
                    if (a.interview_time) return -1;
                    if (b.interview_time) return 1;
                    return 0;
                  })
                  .map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                          <div className="text-sm text-gray-500">{applicant.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {applicant.shortlist_email_sent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <Circle className="w-3 h-3 mr-1" />
                            Not Sent
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {applicant.interview_booked || applicant.interview_time ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Booked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-700">
                            <Circle className="w-3 h-3 mr-1" />
                            Not Booked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {applicant.interview_link ? (
                          <a
                            href={applicant.interview_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm flex items-center w-fit"
                          >
                            Join Interview
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {applicant.interview_time ? (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {getTimeUntilInterview(applicant.interview_time)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {applicant.interview_time ? (
                          <div className="text-sm text-gray-700">
                            {(() => {
                              const date = new Date(applicant.interview_time);
                              const day = date.getUTCDate();
                              const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                              const year = date.getUTCFullYear();
                              const hours = date.getUTCHours();
                              const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                              const ampm = hours >= 12 ? 'pm' : 'am';
                              const displayHours = hours % 12 || 12;
                              return `${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}`;
                            })()}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidates Table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Candidates</h3>
          <button
            onClick={handleAdviseShortlist}
            disabled={sendingShortlistEmail}
            className="btn btn-secondary btn-sm"
          >
            {sendingShortlistEmail ? 'Sending...' : 'Advise Shortlisted Candidates'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Match
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Culture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Education
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates
                .sort((a, b) => parseFloat(b.overall || '0') - parseFloat(a.overall || '0'))
                .map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.name}
                          </div>
                          {candidate.status === 'shortlisted' && (
                            <Target className="ml-2 h-4 w-4 text-success-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {candidate.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColorClass(parseFloat(candidate.jobmatch || '0'))}`}>
                      {formatScore(parseFloat(candidate.jobmatch || '0'))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColorClass(parseFloat(candidate.experience || '0'))}`}>
                      {formatScore(parseFloat(candidate.experience || '0'))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColorClass(parseFloat(candidate.skills || '0'))}`}>
                      {formatScore(parseFloat(candidate.skills || '0'))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColorClass(parseFloat(candidate.culture || '0'))}`}>
                      {formatScore(parseFloat(candidate.culture || '0'))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColorClass(parseFloat(candidate.education || '0'))}`}>
                      {formatScore(parseFloat(candidate.education || '0'))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`text-lg font-bold ${getOverallScoreColor(parseFloat(candidate.overall || '0'))}`}>
                        {formatScore(parseFloat(candidate.overall || '0'))}
                      </div>
                      <div className={`ml-2 w-2 h-2 rounded-full ${
                        parseFloat(candidate.overall || '0') >= 85 ? 'bg-success-500' :
                        parseFloat(candidate.overall || '0') >= 70 ? 'bg-warning-500' : 'bg-danger-500'
                      }`}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewCandidate(candidate.id)}
                      className="text-primary-600 hover:text-primary-900 transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobDashboard;