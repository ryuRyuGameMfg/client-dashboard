'use client';

import { useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { calculateRevenue, calculateMonthlyRevenue, filterProjects, FilterType } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { CurrencyIcon, BriefcaseIcon, ClockIcon, ChartIcon } from './Icons';
import ProjectTable from './ProjectTable';
import ProjectSidePanel from './ProjectSidePanel';
import FilterBar from './FilterBar';

export default function Dashboard() {
  const { projects, initialize } = useProjectStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <DashboardContent />;
}

function DashboardContent() {
  const { projects } = useProjectStore();

  const revenue = calculateRevenue(projects);
  const monthlyRevenue = calculateMonthlyRevenue(projects);
  const activeProjects = projects.filter((p) => p.status === 'in_progress').length;
  const nearDeadline = projects.filter((p) => {
    if (!p.deadline) return false;
    const now = new Date();
    const diffTime = p.deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3 && p.status !== 'completed';
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
            案件ダッシュボード
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            すべての案件を一元管理
          </p>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">今月の確定売上</div>
              <CurrencyIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(monthlyRevenue)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">進行中</div>
              <BriefcaseIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {activeProjects}件
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">期限間近</div>
              <ClockIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {nearDeadline}件
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">見込み売上</div>
              <ChartIcon className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(revenue.total)}
            </div>
          </div>
        </div>

        {/* フィルターバー */}
        <div className="mb-6">
          <FilterBar />
        </div>

        {/* プロジェクト一覧 */}
        <ProjectTable />
        
        {/* サイドパネル */}
        <ProjectSidePanel />
      </div>
    </div>
  );
}


