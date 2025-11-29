'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { calculateRevenue, calculateMonthlyRevenue, countActiveProjects, countNearDeadlineProjects } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { CurrencyIcon, BriefcaseIcon, ClockIcon, ChartIcon } from './Icons';
import ProjectTable from './ProjectTable';
import ProjectSidePanel from './ProjectSidePanel';
import FilterBar from './FilterBar';
import FileSetupDialog from './FileSetupDialog';
import RevenueChartModal from './RevenueChartModal';

export default function Dashboard() {
  const { projects, initialize } = useProjectStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <FileSetupDialog />
      <DashboardContent />
    </>
  );
}

function DashboardContent() {
  const { projects } = useProjectStore();
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  const revenue = calculateRevenue(projects);
  const monthlyRevenue = calculateMonthlyRevenue(projects);
  
  // タスクのステータスベースで進行中を計算
  const activeProjects = countActiveProjects(projects);
  
  // タスクの期限ベースで期限間近を計算
  const nearDeadline = countNearDeadlineProjects(projects);

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
          {/* 今月の確定売上 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">今月の確定売上</div>
              <CurrencyIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(monthlyRevenue)}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              完了タスクの期限が今月のもの
            </div>
          </div>
          
          {/* 進行中 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">進行中</div>
              <BriefcaseIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {activeProjects}件
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              タスクステータスが「進行中」の案件
            </div>
          </div>
          
          {/* 期限間近 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">期限間近</div>
              <ClockIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {nearDeadline}件
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              未完了タスクの期限が3日以内
            </div>
          </div>
          
          {/* 見込み売上 - クリックでグラフモーダルを開く */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setIsChartModalOpen(true)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">見込み売上（手数料差し引き後）</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">詳細を見る →</span>
                <ChartIcon className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(revenue.total)}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              翌月: {formatCurrency(revenue.nextMonth)}
            </div>
            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              手数料前: {formatCurrency(revenue.grossTotal)}
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
        
        {/* 売上グラフモーダル */}
        <RevenueChartModal 
          isOpen={isChartModalOpen}
          onClose={() => setIsChartModalOpen(false)}
          projects={projects}
        />
      </div>
    </div>
  );
}
