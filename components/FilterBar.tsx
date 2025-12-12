'use client';

import { FilterType } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import { ProjectStatus, STATUS_LABELS, STATUS_COLORS } from '@/types';

export default function FilterBar() {
  const filter = useProjectStore((state) => state.filter || 'all');
  const setFilter = useProjectStore((state) => state.setFilter);
  const statusFilter = useProjectStore((state) => state.statusFilter);
  const toggleStatusFilter = useProjectStore((state) => state.toggleStatusFilter);
  const setStatusFilter = useProjectStore((state) => state.setStatusFilter);
  const hideCompletedTasks = useProjectStore((state) => state.hideCompletedTasks);
  const setHideCompletedTasks = useProjectStore((state) => state.setHideCompletedTasks);

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'すべて' },
    { value: 'today', label: '今日' },
    { value: 'thisWeek', label: '今週' },
    { value: 'thisMonth', label: '今月' },
    { value: 'overdue', label: '期限超過' },
    { value: 'upcoming', label: '今後の予定' },
  ];

  const statusOptions: { value: ProjectStatus; label: string; color: string }[] = [
    { value: 'estimate', label: STATUS_LABELS.estimate, color: STATUS_COLORS.estimate },
    { value: 'in_progress', label: STATUS_LABELS.in_progress, color: STATUS_COLORS.in_progress },
    { value: 'completed', label: STATUS_LABELS.completed, color: STATUS_COLORS.completed },
    { value: 'pending', label: STATUS_LABELS.pending, color: STATUS_COLORS.pending },
  ];

  const isAllSelected = statusFilter.length === 0;

  return (
    <div className="flex gap-4 flex-wrap items-center">
      {/* 期間フィルター */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === f.value
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 区切り線 */}
      <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

      {/* タスク表示切り替え */}
      <button
        onClick={() => setHideCompletedTasks(!hideCompletedTasks)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          hideCompletedTasks
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-2 ring-blue-500 ring-offset-1'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        }`}
      >
        {hideCompletedTasks ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
            完了タスクを非表示
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            完了タスクを表示
          </>
        )}
      </button>

      {/* 区切り線 */}
      <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

      {/* ステータスフィルター（複数選択） */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ステータス:
        </label>
        {/* すべてボタン */}
        <button
          onClick={() => setStatusFilter([])}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            isAllSelected
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
          }`}
        >
          すべて
        </button>
        {/* 各ステータスのトグルボタン */}
        {statusOptions.map((option) => {
          const isSelected = statusFilter.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleStatusFilter(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? option.color + ' ring-2 ring-offset-1 ring-blue-500'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

