'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { formatDate } from '@/lib/utils';
import { Task } from '@/types';

interface TaskListProps {
  projectId: string;
}

export default function TaskList({ projectId }: TaskListProps) {
  const { projects, addTask, toggleTask, deleteTask } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    addTask(projectId, {
      title: newTaskTitle,
      deadline: newTaskDeadline ? new Date(newTaskDeadline) : null,
      completed: false,
    });

    setNewTaskTitle('');
    setNewTaskDeadline('');
    setIsAdding(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">タスク</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + 追加
        </button>
      </div>

      {/* タスク追加フォーム */}
      {isAdding && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <input
            type="text"
            placeholder="タスク名"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={newTaskDeadline}
              onChange={(e) => setNewTaskDeadline(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              追加
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTaskTitle('');
                setNewTaskDeadline('');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* タスクリスト */}
      {project.tasks.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">タスクがありません</p>
      ) : (
        <div className="space-y-2">
          {project.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(projectId, task.id)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div className="flex-1">
                <div className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                  {task.title}
                </div>
                {task.deadline && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(task.deadline)}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (confirm('このタスクを削除しますか？')) {
                    deleteTask(projectId, task.id);
                  }
                }}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

