'use client';

import { useRef } from 'react';
import { Task, TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import { TrashIcon } from './Icons';

interface TaskRowProps {
  projectId: string;
  task: Task;
}

// 日付を見やすい形式でフォーマット
function formatDateDisplay(date: Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}/${day}`;
}

// インライン編集可能なテキストフィールド
function EditableText({ 
  value, 
  onChange, 
  placeholder = '',
  completed = false,
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string;
  completed?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  const handleBlur = () => {
    if (inputRef.current && inputRef.current.value !== value) {
      onChange(inputRef.current.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IME入力中はキーイベントを無視
    if (isComposingRef.current) return;
    
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      key={value} // valueが変わったら再マウント
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onCompositionStart={() => { isComposingRef.current = true; }}
      onCompositionEnd={() => { isComposingRef.current = false; }}
      placeholder={placeholder}
      className={`w-full px-3 py-2 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded-lg text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
        completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white font-medium'
      }`}
    />
  );
}

// インライン編集可能な日付フィールド - クリックでカレンダー表示
function EditableDate({ 
  value, 
  onChange,
}: { 
  value: Date | null; 
  onChange: (value: Date | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null;
    onChange(newDate);
  };

  const handleClick = () => {
    inputRef.current?.showPicker();
  };

  return (
    <div 
      className="relative min-w-[100px] group cursor-pointer"
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="date"
        value={formatDateForInput(value)}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
      <div className="px-3 py-2 rounded-lg text-base text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{value ? formatDateDisplay(value) : '未設定'}</span>
      </div>
    </div>
  );
}

// インライン編集可能なセレクトフィールド - クリックで即座に選択肢表示
function EditableSelect({ 
  value, 
  onChange,
  options,
  colorClass,
}: { 
  value: TaskStatus; 
  onChange: (value: TaskStatus) => void;
  options: Record<string, string>;
  colorClass: string;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as TaskStatus);
  };

  const handleClick = () => {
    selectRef.current?.showPicker?.();
  };

  return (
    <select
      ref={selectRef}
      value={value}
      onChange={handleChange}
      onClick={handleClick}
      className={`px-4 py-2 text-sm font-semibold rounded-full cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none ${colorClass}`}
      style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
    >
      {Object.entries(options).map(([val, label]) => (
        <option key={val} value={val}>
          {label}
        </option>
      ))}
    </select>
  );
}

// インライン編集可能な金額フィールド - スピナーなし
function EditableAmount({ 
  value, 
  onChange,
}: { 
  value: number; 
  onChange: (value: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    if (inputRef.current) {
      const newValue = parseInt(inputRef.current.value.replace(/[^\d]/g, '')) || 0;
      if (newValue !== value) {
        onChange(newValue);
      }
      // 表示を整形
      inputRef.current.value = formatCurrency(newValue);
    }
  };

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.value = value.toString();
      inputRef.current.select();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={formatCurrency(value)}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className="w-28 px-3 py-2 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-200 text-right transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    />
  );
}

export default function TaskRow({ projectId, task }: TaskRowProps) {
  const { updateTask, deleteTask, toggleTask } = useProjectStore();
  const taskStatus = task.status || 'not_started';

  const handleUpdateField = (field: string, value: unknown) => {
    const updates: Partial<Task> = { [field]: value };
    if (field === 'status' && value === 'completed') {
      updates.completed = true;
    } else if (field === 'status') {
      updates.completed = false;
    }
    updateTask(projectId, task.id, updates);
  };

  return (
    <div className="flex items-center gap-6 bg-white dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all group">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTask(projectId, task.id)}
        className="w-6 h-6 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500 cursor-pointer flex-shrink-0"
      />
      
      <div className="flex-1 min-w-[200px]">
        <EditableText
          value={task.title}
          onChange={(value) => handleUpdateField('title', value)}
          placeholder="タスク名"
          completed={task.completed}
        />
      </div>
      
      <div className="flex items-center gap-4 flex-shrink-0">
        <EditableDate
          value={task.deadline}
          onChange={(value) => handleUpdateField('deadline', value)}
        />
        
        <EditableSelect
          value={taskStatus}
          onChange={(value) => handleUpdateField('status', value)}
          options={TASK_STATUS_LABELS}
          colorClass={TASK_STATUS_COLORS[taskStatus]}
        />
        
        <EditableAmount
          value={task.amount || 0}
          onChange={(value) => handleUpdateField('amount', value)}
        />
        
        <button
          onClick={() => deleteTask(projectId, task.id)}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="削除"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
