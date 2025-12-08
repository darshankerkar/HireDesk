import React, { useState, useEffect } from 'react';
import { Briefcase, Users, TrendingUp, Activity } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    totalResumes: 0,
    avgMatchRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [jobsRes, candidatesRes] = await Promise.all([
        api.get('/recruitment/jobs/'),
        api.get('/recruitment/candidates/')
      ]);

      const activeJobs = jobsRes.data.filter(job => job.is_active).length;
      const totalCandidates = candidatesRes.data.length;
      const totalResumes = candidatesRes.data.filter(c => c.resume).length;

      // Calculate Average Match Rate
      let avgMatchRate = 0;
      if (totalCandidates > 0) {
        const totalScore = candidatesRes.data.reduce((sum, c) => sum + (c.score || 0), 0);
        avgMatchRate = Math.round(totalScore / totalCandidates);
      }

      setStats({
        activeJobs,
        totalCandidates,
        totalResumes,
        avgMatchRate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold text-white mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="bg-surface overflow-hidden rounded-2xl border border-gray-800 hover:border-primary transition-colors duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-dark rounded-xl p-3 border border-gray-700">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Active Jobs</dt>
                    <dd className="text-2xl font-bold text-white">
                      {loading ? '...' : stats.activeJobs}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface overflow-hidden rounded-2xl border border-gray-800 hover:border-primary transition-colors duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-dark rounded-xl p-3 border border-gray-700">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Total Candidates</dt>
                    <dd className="text-2xl font-bold text-white">
                      {loading ? '...' : stats.totalCandidates}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

           {/* Card 3 */}
           <div className="bg-surface overflow-hidden rounded-2xl border border-gray-800 hover:border-primary transition-colors duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-dark rounded-xl p-3 border border-gray-700">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Resumes Uploaded</dt>
                    <dd className="text-2xl font-bold text-white">
                      {loading ? '...' : stats.totalResumes}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

           {/* Card 4 */}
           <div className="bg-surface overflow-hidden rounded-2xl border border-gray-800 hover:border-primary transition-colors duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-dark rounded-xl p-3 border border-gray-700">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Avg Match Rate</dt>
                    <dd className="text-2xl font-bold text-white">
                      {loading ? '...' : `${stats.avgMatchRate}%`}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="bg-surface rounded-2xl border border-gray-800 overflow-hidden">
                <div className="p-6 text-gray-400 text-center">
                    {stats.totalCandidates === 0 ? 'No recent activity to show.' : `${stats.totalCandidates} candidates processed`}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

