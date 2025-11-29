'use client';

import { FilterType } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';

export default function FilterBar() {
  const filter = useProjectStore((state) => state.filter || 'all');
  const setFilter = useProjectStore((state) => state.setFilter);

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'すべて' },
    { value: 'today', label: '今日' },
    { value: 'thisWeek', label: '今週' },
    { value: 'thisMonth', label: '今月' },
    { value: 'overdue', label: '期限超過' },
    { value: 'upcoming', label: '今後の予定' },
  ];

  return (
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
  );
}

