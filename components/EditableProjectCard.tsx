'use client';

import { useState, useEffect, useRef } from 'react';
import { Project } from '@/types';
import { formatDate, calculateProgress, formatCurrency, isDeadlineNear } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS, PLATFORM_LABELS, TYPE_LABELS, Platform, ProjectType, ProjectStatus } from '@/types';
import { useProjectStore } from '@/store/useProjectStore';

interface EditableProjectCardProps {
  project: Project;
  isNew?: boolean;
}

export default function EditableProjectCard({ project, isNew = false }: EditableProjectCardProps) {
  const { setSelectedProject, updateProject, deleteProject } = useProjectStore();
  const [isEditing, setIsEditing] = useState(isNew);
  // 日付をyyyy-MM-dd形式に変換
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [editedProject, setEditedProject] = useState({
    name: project.name,
    client: project.client,
    platform: project.platform,
    type: project.type,
    amount: project.amount,
    deadline: formatDateForInput(project.deadline),
    status: project.status,
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditing]);

  const progress = calculateProgress(project.tasks);
  const deadlineNear = project.deadline && isDeadlineNear(project.deadline);

  const handleSave = () => {
    updateProject(project.id, {
      name: editedProject.name,
      client: editedProject.client,
      platform: editedProject.platform,
      type: editedProject.type,
      amount: editedProject.amount,
      deadline: editedProject.deadline ? new Date(editedProject.deadline) : null,
      status: editedProject.status,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (isNew) {
      deleteProject(project.id);
    } else {
      setEditedProject({
        name: project.name,
        client: project.client,
        platform: project.platform,
        type: project.type,
        amount: project.amount,
        deadline: formatDateForInput(project.deadline),
        status: project.status,
      });
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      setSelectedProject(project.id);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-blue-500">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              案件名 *
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={editedProject.name}
              onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="案件名を入力"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                顧客名
              </label>
              <input
                type="text"
                value={editedProject.client}
                onChange={(e) => setEditedProject({ ...editedProject, client: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="顧客名"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                プラットフォーム
              </label>
              <select
                value={editedProject.platform}
                onChange={(e) => setEditedProject({ ...editedProject, platform: e.target.value as Platform })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                種別
              </label>
              <select
                value={editedProject.type}
                onChange={(e) => setEditedProject({ ...editedProject, type: e.target.value as ProjectType })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                ステータス
              </label>
              <select
                value={editedProject.status}
                onChange={(e) => setEditedProject({ ...editedProject, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                金額
              </label>
              <input
                type="number"
                value={editedProject.amount || ''}
                onChange={(e) => setEditedProject({ ...editedProject, amount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                期限
              </label>
              <input
                type="date"
                value={editedProject.deadline}
                onChange={(e) => setEditedProject({ ...editedProject, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={!editedProject.name.trim()}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 通常の表示モード
  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
    >
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {project.name || '（未入力）'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {project.client || '（未入力）'}
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

