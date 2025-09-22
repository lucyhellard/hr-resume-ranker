import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, Search, Download, Clock, EyeOff, Eye } from 'lucide-react';
import { Candidate } from '../types';
import { getScoreColorClass, formatScore } from '../utils/scoring';

const ResultsDashboard = () => {
  const { jobId } = useParams();
  console.log('Viewing results for job:', jobId);
  const [biasFreeMode, setBiasFreeMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    experienceWeight: 20,
    skillsWeight: 30,
    cultureWeight: 20,
    educationWeight: 15,
    achievementsWeight: 15
  });

  // Mock candidates data
  const candidates: Candidate[] = [
    {
      id: '1',
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      location: 'San Francisco, CA',
      jobId: '1',
      scores: { jobMatch: 92, experience: 88, skills: 95, culture: 85, education: 90, achievements: 87, overall: 89 },
      strengths: ['React expertise', 'Leadership experience'],
      gaps: ['Angular experience'],
      skills: { required: ['React', 'TypeScript'], actual: ['React', 'TypeScript'] },
      status: 'shortlisted',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      email: 'michael.r@email.com',
      location: 'Austin, TX',
      jobId: '1',
      scores: { jobMatch: 85, experience: 82, skills: 88, culture: 79, education: 85, achievements: 80, overall: 83 },
      strengths: ['Full-stack development', 'Team leadership'],
      gaps: ['GraphQL experience'],
      skills: { required: ['React', 'TypeScript'], actual: ['React', 'TypeScript'] },
      status: 'applied',
      createdAt: new Date('2024-01-16')
    },
    {
      id: '3',
      name: 'Sarah Kim',
      email: 'sarah.kim@email.com',
      location: 'Seattle, WA',
      jobId: '1',
      scores: { jobMatch: 78, experience: 75, skills: 82, culture: 88, education: 92, achievements: 74, overall: 82 },
      strengths: ['Strong CS fundamentals', 'Cultural fit'],
      gaps: ['Senior level experience'],
      skills: { required: ['React', 'TypeScript'], actual: ['React', 'JavaScript'] },
      status: 'applied',
      createdAt: new Date('2024-01-17')
    }
  ];

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const topCandidates = candidates
    .sort((a, b) => b.scores.overall - a.scores.overall)
    .slice(0, 3);

  const displayName = (candidate: Candidate) => {
    if (biasFreeMode) {
      return `Candidate ${candidate.id}`;
    }
    return candidate.name;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results Dashboard</h1>
          <p className="text-gray-600 mt-1">High-level comparison across all candidates</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-secondary btn-md">
            <Clock className="w-4 h-4 mr-2" />
            Time Saved: 18h
          </button>
          <button className="btn btn-primary btn-md">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="input pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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

          <button className="btn btn-secondary btn-sm">
            <Filter className="w-4 h-4 mr-2" />
            Adjust Weights
          </button>
        </div>

        {/* Weight Sliders */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(filters).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key.replace('Weight', '')} ({value}%)
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={value}
                onChange={(e) => setFilters(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Light Grid */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedCandidates.includes(candidate.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleCandidateSelection(candidate.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{displayName(candidate)}</h4>
                <div className={`w-4 h-4 rounded-full ${
                  candidate.scores.overall >= 85 ? 'bg-success-500' :
                  candidate.scores.overall >= 70 ? 'bg-warning-500' : 'bg-danger-500'
                }`}></div>
              </div>

              <div className="text-2xl font-bold text-center mb-2">
                {formatScore(candidate.scores.overall)}
              </div>

              <div className={`text-center text-xs font-medium px-2 py-1 rounded-full ${
                candidate.status === 'shortlisted'
                  ? 'bg-success-100 text-success-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className={`font-medium ${getScoreColorClass(candidate.scores.skills).includes('green') ? 'text-success-600' :
                    getScoreColorClass(candidate.scores.skills).includes('yellow') ? 'text-warning-600' : 'text-danger-600'}`}>
                    {formatScore(candidate.scores.skills)}
                  </div>
                  <div className="text-gray-500">Skills</div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${getScoreColorClass(candidate.scores.experience).includes('green') ? 'text-success-600' :
                    getScoreColorClass(candidate.scores.experience).includes('yellow') ? 'text-warning-600' : 'text-danger-600'}`}>
                    {formatScore(candidate.scores.experience)}
                  </div>
                  <div className="text-gray-500">Exp</div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${getScoreColorClass(candidate.scores.culture).includes('green') ? 'text-success-600' :
                    getScoreColorClass(candidate.scores.culture).includes('yellow') ? 'text-warning-600' : 'text-danger-600'}`}>
                    {formatScore(candidate.scores.culture)}
                  </div>
                  <div className="text-gray-500">Culture</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 Comparison */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 3 Candidates Comparison</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {topCandidates.map((candidate, index) => (
            <div key={candidate.id} className="relative">
              {index === 0 && (
                <div className="absolute -top-2 -right-2 bg-warning-500 text-white text-xs px-2 py-1 rounded-full">
                  #1
                </div>
              )}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{displayName(candidate)}</h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Score</span>
                      <span className="font-bold">{formatScore(candidate.scores.overall)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          candidate.scores.overall >= 85 ? 'bg-success-500' :
                          candidate.scores.overall >= 70 ? 'bg-warning-500' : 'bg-danger-500'
                        }`}
                        style={{ width: `${candidate.scores.overall}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Skills:</span>
                      <span className="ml-1 font-medium">{formatScore(candidate.scores.skills)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <span className="ml-1 font-medium">{formatScore(candidate.scores.experience)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Culture:</span>
                      <span className="ml-1 font-medium">{formatScore(candidate.scores.culture)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Education:</span>
                      <span className="ml-1 font-medium">{formatScore(candidate.scores.education)}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Top Strength:</p>
                    <p className="text-xs text-gray-900">{candidate.strengths[0]}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Key Gap:</p>
                    <p className="text-xs text-gray-900">{candidate.gaps[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;