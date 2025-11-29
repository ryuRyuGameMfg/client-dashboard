'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { formatDate, formatCurrency, calculateProgress } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS, PLATFORM_LABELS, TYPE_LABELS } from '@/types';
import TaskList from './TaskList';
import ProposalList from './ProposalList';
import { useState } from 'react';
import { ProjectForm } from './ProjectForm';

export default function ProjectSidePanel() {
  const { projects, selectedProjectId, setSelectedProject } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const project = projects.find((p) => p.id === selectedProjectId);
  
  if (!project) return null;

  const progress = calculateProgress(project.tasks);

  const handleClose = () => {
    setSelectedProject(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (confirm('この案件を削除してもよろしいですか？')) {
      useProjectStore.getState().deleteProject(project.id);
      handleClose();
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* サイドパネル */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {project.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {project.client}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                編集
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                削除
              </button>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">プラットフォーム</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {PLATFORM_LABELS[project.platform]}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">種別</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {TYPE_LABELS[project.type]}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">金額</div>
                <div className="font-medium text-blue-600 dark:text-blue-400 text-lg">
                  {formatCurrency(project.amount)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">期限</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatDate(project.deadline)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">ステータス</div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[project.status]}`}>
                  {STATUS_LABELS[project.status]}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">進捗</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {progress}%
                </div>
              </div>
            </div>
          </div>

          {/* 進捗バー */}
          {project.tasks.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">タスク進捗</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {project.tasks.filter((t) => t.completed).length} / {project.tasks.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* タスクリスト */}
          <div className="mb-6">
            <TaskList projectId={project.id} />
          </div>

          {/* 提案リスト */}
          <div className="mb-6">
            <ProposalList projectId={project.id} />
          </div>

          {/* メモ */}
          {project.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">メモ</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {project.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 編集フォーム */}
      {isEditing && (
        <ProjectForm
          onClose={() => setIsEditing(false)}
          onSubmit={(data) => {
            useProjectStore.getState().updateProject(project.id, data);
            setIsEditing(false);
          }}
          initialData={project}
        />
      )}
    </>
  );
}

