import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, Users, CheckCircle, Circle, AlertCircle } from 'lucide-react';
// import { Job } from '../types';
import { getJobs, Job as DatabaseJob, deleteJob } from '../services/jobService';
import { getApplicantsByJobId } from '../services/applicantService';

interface JobWithCounts extends DatabaseJob {
  realApplicantCount: number;
  realShortlistedCount: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>(['open', 'draft']);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await getJobs();

        // Calculate real applicant counts for each job
        const jobsWithCounts: JobWithCounts[] = await Promise.all(
          jobsData.map(async (job) => {
            try {
              const applicants = await getApplicantsByJobId(job.id);
              const realApplicantCount = applicants.length;
              const realShortlistedCount = applicants.filter(applicant => applicant.status === 'shortlisted').length;

              return {
                ...job,
                realApplicantCount,
                realShortlistedCount
              };
            } catch (err) {
              console.error(`Error fetching applicants for job ${job.id}:`, err);
              return {
                ...job,
                realApplicantCount: 0,
                realShortlistedCount: 0
              };
            }
          })
        );

        setJobs(jobsWithCounts);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on status filter
  const filteredJobs = jobs.filter(job => statusFilter.includes(job.status));

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
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

  const handleDeleteJob = async (job: JobWithCounts) => {
    // Check if there are any applicants
    if (job.realApplicantCount > 0) {
      // Job has applicants - cannot delete
      alert('This job cannot be deleted because it has applicants. Please close the job instead.');
      return;
    }

    // No applicants - confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the job "${job.title}"? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    // Proceed with deletion
    try {
      await deleteJob(job.id);
      // Remove job from state
      setJobs(jobs.filter(j => j.id !== job.id));
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage all active and past roles in one place.</p>
        </div>
        <button
          onClick={() => navigate('/jobs/create')}
          className="btn btn-primary btn-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Jobs
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {filteredJobs.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Circle className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Jobs
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {filteredJobs.filter(job => job.status === 'open').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Applicants
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {filteredJobs.reduce((sum, job) => sum + job.realApplicantCount, 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Shortlisted
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {filteredJobs.reduce((sum, job) => sum + job.realShortlistedCount, 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex space-x-3">
            {['open', 'draft', 'closed'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={statusFilter.includes(status)}
                  onChange={() => handleStatusFilterChange(status)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Jobs</h3>
        </div>
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {jobs.length === 0 ? 'No jobs yet' : 'No jobs match the selected filters'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {jobs.length === 0
                ? 'Get started by creating your first job posting.'
                : 'Try adjusting your status filters to see more jobs.'
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/jobs/create')}
                className="btn btn-primary btn-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Job
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shortlisted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hiring Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Closing Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {job.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      Created {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.realApplicantCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.realShortlistedCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.hiring_manager}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1 capitalize">{job.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.closing_date ? new Date(job.closing_date).toLocaleDateString() : 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

export default Dashboard;