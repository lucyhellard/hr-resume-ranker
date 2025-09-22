import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Eye, EyeOff, BarChart3, Clock, Users, Target, Plus } from 'lucide-react';
import { Candidate } from '../types';
import { getScoreColorClass, formatScore } from '../utils/scoring';

const JobDashboard = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [biasFreeMode, setBiasFreeMode] = useState(false);

  // Mock data
  const jobTitle = "Senior Frontend Developer";
  const stats = {
    applicants: 45,
    shortlisted: 12,
    averageScore: 76,
    timeSaved: "18 hours"
  };

  const [candidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      jobId: '1',
      scores: {
        jobMatch: 92,
        experience: 88,
        skills: 95,
        culture: 85,
        education: 90,
        achievements: 87,
        overall: 89
      },
      strengths: ['React expertise', 'Leadership experience', 'Open source contributions'],
      gaps: ['Angular experience', 'Mobile development'],
      skills: {
        required: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
        actual: ['React', 'TypeScript', 'Vue.js', 'Python']
      },
      status: 'shortlisted',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      email: 'michael.r@email.com',
      phone: '+1 (555) 234-5678',
      location: 'Austin, TX',
      jobId: '1',
      scores: {
        jobMatch: 85,
        experience: 82,
        skills: 88,
        culture: 79,
        education: 85,
        achievements: 80,
        overall: 83
      },
      strengths: ['Full-stack development', 'Team leadership', 'Agile methodologies'],
      gaps: ['GraphQL experience', 'Large scale systems'],
      skills: {
        required: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
        actual: ['React', 'TypeScript', 'Node.js', 'MongoDB']
      },
      status: 'applied',
      createdAt: new Date('2024-01-16')
    },
    {
      id: '3',
      name: 'Sarah Kim',
      email: 'sarah.kim@email.com',
      phone: '+1 (555) 345-6789',
      location: 'Seattle, WA',
      jobId: '1',
      scores: {
        jobMatch: 78,
        experience: 75,
        skills: 82,
        culture: 88,
        education: 92,
        achievements: 74,
        overall: 82
      },
      strengths: ['Strong CS fundamentals', 'Cultural fit', 'Problem solving'],
      gaps: ['Senior level experience', 'Team leadership'],
      skills: {
        required: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
        actual: ['React', 'JavaScript', 'Python', 'PostgreSQL']
      },
      status: 'applied',
      createdAt: new Date('2024-01-17')
    }
  ]);

  const handleViewCandidate = (candidateId: string) => {
    navigate(`/jobs/${jobId}/applicants/${candidateId}`);
  };

  const handleViewResults = () => {
    navigate(`/jobs/${jobId}/results`);
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 85) return 'text-success-600';
    if (score >= 70) return 'text-warning-600';
    return 'text-danger-600';
  };

  const displayName = (candidate: Candidate) => {
    if (biasFreeMode) {
      return `Candidate ${candidate.id}`;
    }
    return candidate.name;
  };

  const displayEmail = (candidate: Candidate) => {
    if (biasFreeMode) {
      return '•••••@••••••.com';
    }
    return candidate.email;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Dashboard – {jobTitle}</h1>
          <p className="text-gray-600 mt-1">Review and manage candidates for this position</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleViewResults}
            className="btn btn-secondary btn-md"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Results
          </button>
          <button className="btn btn-secondary btn-md">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Applicants</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.applicants}</p>
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

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={biasFreeMode}
              onChange={(e) => setBiasFreeMode(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Bias-Free Mode</span>
            {biasFreeMode ? (
              <EyeOff className="w-4 h-4 ml-1 text-gray-400" />
            ) : (
              <Eye className="w-4 h-4 ml-1 text-gray-400" />
            )}
          </label>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Add Applicant</span>
            <button className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4 mr-1" />
              Upload Resume
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Add late applicants without rerunning the full batch.</p>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Candidates</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
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
                .sort((a, b) => b.scores.overall - a.scores.overall)
                .map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {displayName(candidate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {displayEmail(candidate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColorClass(candidate.scores.jobMatch)}`}>
                      {formatScore(candidate.scores.jobMatch)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColorClass(candidate.scores.experience)}`}>
                      {formatScore(candidate.scores.experience)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColorClass(candidate.scores.skills)}`}>
                      {formatScore(candidate.scores.skills)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColorClass(candidate.scores.culture)}`}>
                      {formatScore(candidate.scores.culture)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColorClass(candidate.scores.education)}`}>
                      {formatScore(candidate.scores.education)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`text-lg font-bold ${getOverallScoreColor(candidate.scores.overall)}`}>
                        {formatScore(candidate.scores.overall)}
                      </div>
                      <div className={`ml-2 w-2 h-2 rounded-full ${
                        candidate.scores.overall >= 85 ? 'bg-success-500' :
                        candidate.scores.overall >= 70 ? 'bg-warning-500' : 'bg-danger-500'
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