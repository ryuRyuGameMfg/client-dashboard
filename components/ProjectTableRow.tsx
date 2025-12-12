'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Project, Platform, ProjectType, ProjectStatus } from '@/types';
import { formatCurrency, calculateNetAmount } from '@/lib/utils';
import { PLATFORM_LABELS, TYPE_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { useProjectStore } from '@/store/useProjectStore';
import { TrashIcon, InfoIcon, EditIcon, CheckIcon, XIcon, DragHandleIcon } from './Icons';
import TaskRow from './TaskRow';
import AddTaskRow from './AddTaskRow';
import SortableTaskList from './SortableTaskList';

interface ProjectTableRowProps {
  project: Project;
  isNew?: boolean;
}

export default function ProjectTableRow({ project, isNew = false }: ProjectTableRowProps) {
  const { setSelectedProject, updateProject, deleteProject, hideCompletedTasks } = useProjectStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);
  const [editedProject, setEditedProject] = useState({
    name: project.name,
    client: project.client,
    platform: project.platform,
    type: project.type,
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  // ドラッグアンドドロップ設定
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  // タスクの合計金額を計算（手数料差し引き後）
  const totalAmount = project.tasks.reduce((sum, task) => {
    const taskAmount = task.amount || 0;
    const netAmount = calculateNetAmount(taskAmount, project.platform);
    return sum + netAmount;
  }, 0);
  
  // タスク数とタスクの進捗を計算
  const taskCount = project.tasks.length;
  const completedTaskCount = project.tasks.filter(t => t.completed).length;

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditedProject({
      name: project.name,
      client: project.client,
      platform: project.platform,
      type: project.type,
    });
  }, [project]);

  const handleSave = () => {
    if (!editedProject.name.trim()) {
      if (isNew) {
        deleteProject(project.id);
      } else {
        setEditedProject({
          name: project.name,
          client: project.client,
          platform: project.platform,
          type: project.type,
        });
        setIsEditing(false);
      }
      return;
    }

    updateProject(project.id, {
      name: editedProject.name,
      client: editedProject.client,
      platform: editedProject.platform,
      type: editedProject.type,
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
      });
      setIsEditing(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 編集モード
  if (isEditing) {
    return (
      <tr ref={setNodeRef} style={style} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500">
        <td className="px-4 py-6" style={{ width: '50px' }}>
          {/* ドラッグハンドル（編集中は非アクティブ） */}
          <div className="text-slate-300 dark:text-slate-600">
            <DragHandleIcon className="w-5 h-5" />
          </div>
        </td>
        <td className="px-6 py-6" style={{ minWidth: '320px' }}>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 dark:text-slate-600 text-lg">▶</span>
            <input
              ref={nameInputRef}
              type="text"
              value={editedProject.name}
              onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              placeholder="案件名"
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </td>
        <td className="px-6 py-6" style={{ minWidth: '220px' }}>
          <input
            type="text"
            value={editedProject.client}
            onChange={(e) => setEditedProject({ ...editedProject, client: e.target.value })}
            placeholder="顧客名"
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-600 rounded-xl text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </td>
        <td className="px-6 py-6" style={{ minWidth: '180px' }}>
          <select
            value={editedProject.platform}
            onChange={(e) => setEditedProject({ ...editedProject, platform: e.target.value as Platform })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-600 rounded-xl text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </td>
        <td className="px-6 py-6" style={{ minWidth: '160px' }}>
          <select
            value={editedProject.type}
            onChange={(e) => setEditedProject({ ...editedProject, type: e.target.value as ProjectType })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-600 rounded-xl text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </td>
        <td className="px-6 py-6 text-base text-slate-400" style={{ minWidth: '140px' }}>-</td>
        <td className="px-6 py-6 text-base text-slate-400" style={{ minWidth: '160px' }}>-</td>
        <td className="px-6 py-6 text-base text-slate-400" style={{ minWidth: '180px' }}>-</td>
        <td className="px-6 py-6" style={{ minWidth: '160px' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!editedProject.name.trim()}
              className="p-3 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 rounded-xl transition-colors"
              title="保存"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancel}
              className="p-3 text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-colors"
              title="キャンセル"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className={`hover:bg-slate-50 dark:hover:bg-gray-750 cursor-pointer transition-all duration-150 group ${isDragging ? 'opacity-50 bg-blue-50 dark:bg-blue-900/20' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-4 py-6" style={{ width: '50px' }}>
          {/* ドラッグハンドル */}
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="ドラッグして並び替え"
          >
            <DragHandleIcon className="w-5 h-5" />
          </div>
        </td>
        <td className="px-6 py-6" style={{ minWidth: '320px' }}>
          <div className="flex items-center gap-4">
            <span className={`text-slate-400 text-lg transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
            <div className="flex-1">
              <div className="text-base font-bold text-slate-800 dark:text-white">
                {project.name}
              </div>
              {taskCount > 0 && (
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {taskCount}件のタスク
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-6 text-base text-slate-600 dark:text-slate-300" style={{ minWidth: '220px' }}>
          {project.client || <span className="text-slate-400">-</span>}
        </td>
        <td className="px-6 py-6" style={{ minWidth: '180px' }}>
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-full">
            {PLATFORM_LABELS[project.platform]}
          </span>
        </td>
        <td className="px-6 py-6" style={{ minWidth: '160px' }}>
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            {TYPE_LABELS[project.type]}
          </span>
        </td>
        <td className="px-6 py-6" style={{ minWidth: '140px' }} onClick={(e) => e.stopPropagation()}>
          <select
            value={project.status}
            onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}
            className={`px-3 py-2 text-sm font-semibold rounded-full cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${STATUS_COLORS[project.status]}`}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </td>
        <td className="px-6 py-6" style={{ minWidth: '160px' }}>
          {taskCount > 0 ? (
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    completedTaskCount === taskCount 
                      ? 'bg-green-500' 
                      : completedTaskCount > 0 
                        ? 'bg-blue-500' 
                        : 'bg-slate-300'
                  }`}
                  style={{ width: `${(completedTaskCount / taskCount) * 100}%` }}
                />
              </div>
              <span className="text-base font-semibold text-slate-600 dark:text-slate-400">
                {completedTaskCount}/{taskCount}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 text-base">-</span>
          )}
        </td>
        <td className="px-6 py-6" style={{ minWidth: '180px' }}>
          <span className="text-lg font-bold text-slate-800 dark:text-white">
            {formatCurrency(totalAmount)}
          </span>
        </td>
        <td className="px-6 py-6" style={{ minWidth: '160px' }}>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
              title="編集"
            >
              <EditIcon className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProject(project.id);
              }}
              className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title="詳細"
            >
              <InfoIcon className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('この案件を削除しますか？')) {
                  deleteProject(project.id);
                }
              }}
              className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
              title="削除"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-50/50 dark:bg-gray-800/30">
          <td colSpan={9} className="px-8 py-8">
            <div className="ml-8 pl-8 border-l-3 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  タスク・マイルストーン
                </h4>
              </div>
              <SortableTaskList 
                projectId={project.id} 
                tasks={hideCompletedTasks 
                  ? project.tasks.filter(t => !t.completed) 
                  : project.tasks
                } 
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
