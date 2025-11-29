'use client';

import { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { PlusIcon } from './Icons';

export default function AddProjectRow() {
  const { addProject } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [projectName, setProjectName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAdd = () => {
    if (!projectName.trim()) {
      setIsAdding(false);
      return;
    }

    addProject({
      name: projectName,
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

    setProjectName('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setProjectName('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <tr className="bg-blue-50/50 dark:bg-blue-900/10">
        <td className="px-8 py-6" style={{ minWidth: '350px' }}>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 dark:text-slate-600 text-lg">▶</span>
            <input
              ref={inputRef}
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleCancel();
              }}
              onBlur={handleAdd}
              placeholder="新しい案件名を入力..."
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-xl text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </td>
        <td className="px-6 py-6 text-base text-slate-400" style={{ minWidth: '220px' }}>-</td>
        <td className="px-6 py-6 text-base text-slate-400" style={{ minWidth: '180px' }}>-</td>
        <td className="px-6 py-6 text-base text-slate-400" style={{ minWidth: '160px' }}>-</td>
        <td className="px-6 py-6 text-base text-slate-400" style={{ minWidth: '160px' }}>-</td>
        <td className="px-6 py-6 text-base text-slate-400" style={{ minWidth: '180px' }}>-</td>
        <td className="px-6 py-6 text-sm text-slate-400" style={{ minWidth: '160px' }}>
          Escでキャンセル
        </td>
      </tr>
    );
  }

  return (
    <tr 
      className="hover:bg-slate-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
      onClick={() => setIsAdding(true)}
    >
      <td colSpan={7} className="px-8 py-6">
        <div className="flex items-center gap-4 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
            <PlusIcon className="w-5 h-5" />
          </div>
          <span className="text-base font-medium">新しい案件を追加...</span>
        </div>
      </td>
    </tr>
  );
}
