'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { PlusIcon } from './Icons';

export default function AddProjectButton() {
  const { addProject } = useProjectStore();

  const handleAdd = () => {
    // インライン編集用の空のプロジェクトを追加
    addProject({
      name: '',
      client: '',
      platform: 'direct',
      type: 'development',
      amount: 0,
      deadline: null,
      status: 'free_estimate',
      tasks: [],
      proposals: [],
      notes: '',
    });
  };

  return (
    <button
      onClick={handleAdd}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
    >
      <PlusIcon className="w-5 h-5" />
      新規案件
    </button>
  );
}

