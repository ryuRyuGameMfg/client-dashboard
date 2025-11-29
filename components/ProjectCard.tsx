'use client';

import { Project } from '@/types';
import { formatDate, calculateProgress, formatCurrency, isDeadlineNear } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS, PLATFORM_LABELS, TYPE_LABELS } from '@/types';
import { useProjectStore } from '@/store/useProjectStore';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { setSelectedProject } = useProjectStore();
  const progress = calculateProgress(project.tasks);
  const deadlineNear = project.deadline && isDeadlineNear(project.deadline);

  const handleClick = () => {
    setSelectedProject(project.id);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
    >
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {project.client}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[project.status]}`}>
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      {/* メタ情報 */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium mr-2">プラットフォーム:</span>
          <span>{PLATFORM_LABELS[project.platform]}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium mr-2">種別:</span>
          <span>{TYPE_LABELS[project.type]}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium mr-2">金額:</span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(project.amount)}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium mr-2">期限:</span>
          <span className={deadlineNear ? 'text-orange-600 dark:text-orange-400 font-semibold' : ''}>
            {formatDate(project.deadline)}
          </span>
        </div>
      </div>

      {/* 進捗バー */}
      {project.tasks.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">進捗</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* タスク数 */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {project.tasks.filter((t) => t.completed).length} / {project.tasks.length} タスク完了
      </div>
    </div>
  );
}

