import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Mail, Phone, MapPin, Target, AlertCircle } from 'lucide-react';
import { Applicant } from '../services/applicantService';
import { getJobs } from '../services/jobService';
import { getScoreColorClass, formatScore } from '../utils/scoring';

interface CandidateWithJob extends Applicant {
  jobTitle?: string;
}

const Candidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<CandidateWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // First fetch all jobs
        const jobsData = await getJobs();

        // Get all applicants from all jobs
        const allCandidates: CandidateWithJob[] = [];

        for (const job of jobsData) {
          // Import applicant service function to get applicants by job
          const { getApplicantsByJobId } = await import('../services/applicantService');
          const jobApplicants = await getApplicantsByJobId(job.id);

          // Add job title to each applicant
          const candidatesWithJob = jobApplicants.map(applicant => ({
            ...applicant,
            jobTitle: job.title
          }));

          allCandidates.push(...candidatesWithJob);
        }

        setCandidates(allCandidates);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError('Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-success-100 text-success-700';
      case 'interview':
        return 'bg-blue-100 text-blue-700';
      case 'offer':
        return 'bg-purple-100 text-purple-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return <Target className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading candidates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading candidates</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Candidates</h1>
          <p className="text-gray-600 mt-1">View and manage all applicants across all job positions.</p>
        </div>
        <div className="text-sm text-gray-500">
          {candidates.length} total candidates
        </div>
      </div>

      {/* Candidates Table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Candidate Directory</h3>
        </div>
        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates yet</h3>
            <p className="mt-1 text-sm text-gray-500">Candidates will appear here once jobs receive applications.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Applied For
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pipeline Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
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
                            Applied {new Date(candidate.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{candidate.jobTitle}</div>
                      <div className="text-sm text-gray-500">Job ID: {candidate.job_id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {getStatusIcon(candidate.status)}
                        <span className={getStatusIcon(candidate.status) ? "ml-1" : ""}>
                          {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-sm font-medium rounded-full ${getScoreColorClass(parseFloat(candidate.overall || '0'))}`}>
                          {formatScore(parseFloat(candidate.overall || '0'))}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 mr-1" />
                          {candidate.email}
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 mr-1" />
                            {candidate.phone}
                          </div>
                        )}
                      </div>
                      {candidate.location && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {candidate.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/jobs/${candidate.job_id}/applicants/${candidate.id}`)}
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;