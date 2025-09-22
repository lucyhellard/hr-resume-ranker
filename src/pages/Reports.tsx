import { useState } from 'react';
import { Download, Eye, Share2, Plus, FileText, Users, BarChart3 } from 'lucide-react';
import { Report } from '../types';

const Reports = () => {
  const [selectedReportType, setSelectedReportType] = useState<string>('');

  // Mock reports data
  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Senior Frontend Developer - Top 5 Candidates',
      jobTitle: 'Senior Frontend Developer',
      type: 'shortlist',
      createdAt: new Date('2024-01-20'),
      createdBy: 'Sarah Johnson',
      url: '/reports/senior-frontend-shortlist.pdf'
    },
    {
      id: '2',
      name: 'Product Manager - Interview Pack',
      jobTitle: 'Product Manager',
      type: 'interview-pack',
      createdAt: new Date('2024-01-18'),
      createdBy: 'Mike Chen',
      url: '/reports/product-manager-interview-pack.pdf'
    },
    {
      id: '3',
      name: 'UX Designer - Bias-Free Analysis',
      jobTitle: 'UX Designer',
      type: 'bias-free-comparison',
      createdAt: new Date('2024-01-15'),
      createdBy: 'Emily Davis',
      url: '/reports/ux-designer-bias-free.pdf'
    },
    {
      id: '4',
      name: 'Backend Engineer - Candidate Comparison',
      jobTitle: 'Backend Engineer',
      type: 'shortlist',
      createdAt: new Date('2024-01-12'),
      createdBy: 'Alex Thompson',
      url: '/reports/backend-engineer-comparison.pdf'
    },
    {
      id: '5',
      name: 'Senior Frontend Developer - Interview Guide',
      jobTitle: 'Senior Frontend Developer',
      type: 'interview-pack',
      createdAt: new Date('2024-01-10'),
      createdBy: 'Sarah Johnson',
      url: '/reports/frontend-interview-guide.pdf'
    }
  ]);

  const getReportIcon = (type: Report['type']) => {
    switch (type) {
      case 'shortlist':
        return <Users className="w-5 h-5 text-primary-600" />;
      case 'interview-pack':
        return <FileText className="w-5 h-5 text-success-600" />;
      case 'bias-free-comparison':
        return <BarChart3 className="w-5 h-5 text-warning-600" />;
    }
  };

  const getReportTypeLabel = (type: Report['type']) => {
    switch (type) {
      case 'shortlist':
        return 'Shortlist Report';
      case 'interview-pack':
        return 'Interview Pack';
      case 'bias-free-comparison':
        return 'Bias-Free Analysis';
    }
  };

  const getReportTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'shortlist':
        return 'bg-primary-100 text-primary-700';
      case 'interview-pack':
        return 'bg-success-100 text-success-700';
      case 'bias-free-comparison':
        return 'bg-warning-100 text-warning-700';
    }
  };

  const handleExportReport = () => {
    // Export new report logic
    console.log('Exporting new report of type:', selectedReportType);
  };

  const reportTypes = [
    { value: 'shortlist', label: 'Shortlist Report', description: 'Top ranked candidates with scores' },
    { value: 'interview-pack', label: 'Interview Pack', description: 'Tailored questions and candidate insights' },
    { value: 'bias-free-comparison', label: 'Bias-Free Analysis', description: 'Anonymous candidate comparison' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">All reports are securely stored and can be downloaded anytime.</p>
        </div>
        <button
          onClick={handleExportReport}
          disabled={!selectedReportType}
          className="btn btn-primary btn-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Export New Report
        </button>
      </div>

      {/* Export New Report Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportTypes.map((type) => (
            <div
              key={type.value}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedReportType === type.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedReportType(type.value)}
            >
              <div className="flex items-center mb-2">
                {getReportIcon(type.value as Report['type'])}
                <h4 className="ml-2 font-medium text-gray-900">{type.label}</h4>
              </div>
              <p className="text-sm text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reports Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-2xl font-semibold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-success-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Shortlist Reports</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.type === 'shortlist').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-warning-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Interview Packs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.type === 'interview-pack').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getReportIcon(report.type)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {report.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.jobTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getReportTypeColor(report.type)}`}>
                      {getReportTypeLabel(report.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.createdBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-success-600 hover:text-success-900 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Templates Info */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <Users className="w-6 h-6 text-primary-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Shortlist Report</h4>
              <p className="text-sm text-gray-600 mt-1">
                Ranked list of top candidates with detailed scoring breakdown and key insights.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FileText className="w-6 h-6 text-success-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Interview Pack</h4>
              <p className="text-sm text-gray-600 mt-1">
                Tailored interview questions, candidate strengths/gaps, and suggested talking points.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <BarChart3 className="w-6 h-6 text-warning-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Bias-Free Analysis</h4>
              <p className="text-sm text-gray-600 mt-1">
                Anonymous comparison report focusing purely on skills and qualifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;