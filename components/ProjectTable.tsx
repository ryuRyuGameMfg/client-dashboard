'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { filterProjects } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import ProjectTableRow from './ProjectTableRow';
import AddProjectRow from './AddProjectRow';

export default function ProjectTable() {
  const { projects, filter, reorderProjects } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // フィルターと検索を適用
  let filteredProjects = filterProjects(projects, filter);
  
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredProjects = filteredProjects.filter(project => 
      project.name.toLowerCase().includes(query) ||
      project.client.toLowerCase().includes(query) ||
      project.tasks.some(task => task.title.toLowerCase().includes(query))
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      reorderProjects(active.id as string, over.id as string);
    }
  };

  return (
    <div className="space-y-6">
      {/* 検索バー */}
      <div className="relative max-w-xl">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="案件名、顧客名、タスクで検索..."
          className="w-full px-5 py-4 pl-14 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
        />
        <svg
          className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* テーブル */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1400px' }}>
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-6 text-left text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" style={{ width: '50px' }}>
                    {/* ドラッグハンドル用 */}
                  </th>
                  <th className="px-6 py-6 text-left text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" style={{ minWidth: '320px' }}>
                    案件名
                  </th>
                  <th className="px-6 py-6 text-left text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" style={{ minWidth: '220px' }}>
                    顧客名
                  </th>
                  <th className="px-6 py-6 text-left text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" style={{ minWidth: '180px' }}>
                    プラットフォーム
                  </th>
                  <th className="px-6 py-6 text-left text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" style={{ minWidth: '160px' }}>
                    種別
                  </th>
                  <th className="px-6 py-6 text-left text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" style={{ minWidth: '160px' }}>
                    進捗
                  </th>
                  <th className="px-6 py-6 text-left text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" style={{ minWidth: '180px' }}>
                    合計金額
                  </th>
                  <th className="px-6 py-6 text-left text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" style={{ minWidth: '160px' }}>
                    操作
                  </th>
                </tr>
              </thead>
              <SortableContext
                items={filteredProjects.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredProjects.map((project) => {
                    const isNew = !project.name || project.name.trim() === '';
                    return (
                      <ProjectTableRow key={project.id} project={project} isNew={isNew} />
                    );
                  })}
                  {/* 末尾の追加行 */}
                  <AddProjectRow />
                </tbody>
              </SortableContext>
            </table>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
