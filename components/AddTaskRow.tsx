'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { PlusIcon } from './Icons';

interface AddTaskRowProps {
  projectId: string;
}

export default function AddTaskRow({ projectId }: AddTaskRowProps) {
  const { addTask } = useProjectStore();

  const handleAddTask = () => {
    // 空のタスクを追加（タイトルは後で編集）
    addTask(projectId, {
      title: '',
      deadline: null,
      completed: false,
      status: 'not_started',
      amount: 0,
    });
  };

  return (
    <div 
      className="flex items-center gap-6 rounded-xl p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group border border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600"
      onClick={handleAddTask}
    >
      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        <PlusIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
      </div>
      <span className="text-base text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
        タスクを追加
      </span>
    </div>
  );
}
