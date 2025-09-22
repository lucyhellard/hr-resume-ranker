import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Star, AlertTriangle, CheckCircle, Download, GitCompare, UserPlus } from 'lucide-react';
import { Candidate } from '../types';
import { getScoreColorClass, formatScore } from '../utils/scoring';

const ApplicantDashboard = () => {
  const { applicantId } = useParams();
  console.log('Viewing applicant:', applicantId);
  const [pipelineStage, setPipelineStage] = useState<string>('shortlisted');

  // Mock candidate data
  const candidate: Candidate = {
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
    strengths: [
      'React expertise with 5+ years experience',
      'Strong leadership experience managing teams of 8+',
      'Active open source contributor to major projects'
    ],
    gaps: [
      'Limited Angular experience',
      'No mobile development background',
      'Missing GraphQL expertise'
    ],
    skills: {
      required: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Docker'],
      actual: ['React', 'TypeScript', 'Vue.js', 'Python', 'GCP', 'Kubernetes']
    },
    status: 'shortlisted',
    createdAt: new Date('2024-01-15')
  };

  const interviewQuestions = [
    {
      question: "Can you walk me through a challenging React optimization problem you've solved?",
      suggestedAnswer: "Look for specific examples of performance optimization, use of React.memo, useMemo, or code splitting."
    },
    {
      question: "How would you approach leading a team transition from Vue.js to React?",
      suggestedAnswer: "Assess their leadership approach, change management skills, and technical migration strategies."
    },
    {
      question: "Describe your experience with open source contributions and community involvement.",
      suggestedAnswer: "Evaluate their collaboration skills, code quality standards, and passion for development."
    }
  ];

  const skillsData = [
    { skill: 'React', required: true, actual: true, level: 95 },
    { skill: 'TypeScript', required: true, actual: true, level: 90 },
    { skill: 'Node.js', required: true, actual: false, level: 0 },
    { skill: 'GraphQL', required: true, actual: false, level: 0 },
    { skill: 'AWS', required: true, actual: false, level: 0 },
    { skill: 'Docker', required: true, actual: false, level: 0 },
    { skill: 'Vue.js', required: false, actual: true, level: 85 },
    { skill: 'Python', required: false, actual: true, level: 80 },
    { skill: 'GCP', required: false, actual: true, level: 75 },
    { skill: 'Kubernetes', required: false, actual: true, level: 70 }
  ];

  const radarData = [
    { category: 'Experience', score: candidate.scores.experience },
    { category: 'Skills', score: candidate.scores.skills },
    { category: 'Culture', score: candidate.scores.culture },
    { category: 'Education', score: candidate.scores.education },
    { category: 'Achievements', score: candidate.scores.achievements }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicant Profile – {candidate.name}</h1>
          <p className="text-gray-600 mt-1">Detailed candidate analysis and interview preparation</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-secondary btn-md">
            <GitCompare className="w-4 h-4 mr-2" />
            Compare
          </button>
          <button className="btn btn-secondary btn-md">
            <UserPlus className="w-4 h-4 mr-2" />
            Shortlist
          </button>
          <button className="btn btn-primary btn-md">
            <Download className="w-4 h-4 mr-2" />
            Export Interview Pack
          </button>
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
                  <p className="text-sm font-medium text-gray-900">{candidate.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{candidate.phone}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">{candidate.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(candidate.scores).map(([key, score]) => (
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
              <ul className="space-y-3">
                {candidate.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <Star className="w-4 h-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-warning-500 mr-2" />
                Key Gaps
              </h3>
              <ul className="space-y-3">
                {candidate.gaps.map((gap, index) => (
                  <li key={index} className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-warning-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skills Heatmap */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {skillsData.map((skill, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                    <div className="flex items-center space-x-1">
                      {skill.required && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full" title="Required"></div>
                      )}
                      {skill.actual && (
                        <div className="w-2 h-2 bg-success-500 rounded-full" title="Has skill"></div>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        skill.level >= 80 ? 'bg-success-500' :
                        skill.level >= 60 ? 'bg-warning-500' :
                        skill.level > 0 ? 'bg-danger-500' : ''
                      }`}
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {skill.actual ? `${skill.level}%` : 'Not found'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="card p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Score</h3>
            <div className={`text-4xl font-bold mb-2 ${
              candidate.scores.overall >= 85 ? 'text-success-600' :
              candidate.scores.overall >= 70 ? 'text-warning-600' : 'text-danger-600'
            }`}>
              {formatScore(candidate.scores.overall)}
            </div>
            <div className={`text-sm font-medium ${getScoreColorClass(candidate.scores.overall)}`}>
              {candidate.scores.overall >= 85 ? 'Excellent Match' :
               candidate.scores.overall >= 70 ? 'Good Match' : 'Fair Match'}
            </div>
          </div>

          {/* Pipeline Stage */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stage</h3>
            <select
              value={pipelineStage}
              onChange={(e) => setPipelineStage(e.target.value)}
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
              {radarData.map((item, index) => (
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
              {interviewQuestions.map((item, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Q{index + 1}: {item.question}
                  </p>
                  <p className="text-xs text-gray-600">
                    💡 {item.suggestedAnswer}
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