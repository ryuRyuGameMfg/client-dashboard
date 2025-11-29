import { Project, ProjectStatus } from '@/types';
import { format, isToday, isThisWeek, isThisMonth, isPast, isFuture, startOfWeek, endOfWeek } from 'date-fns';

// 日付フォーマット
export function formatDate(date: Date | null): string {
  if (!date) return '-';
  return format(date, 'yyyy/MM/dd');
}

export function formatDateTime(date: Date | null): string {
  if (!date) return '-';
  return format(date, 'yyyy/MM/dd HH:mm');
}

// 進捗率計算
export function calculateProgress(tasks: Project['tasks']): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

// フィルタリング
export type FilterType = 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'overdue' | 'upcoming';

export function filterProjects(projects: Project[], filter: FilterType): Project[] {
  const now = new Date();
  
  switch (filter) {
    case 'today':
      return projects.filter((p) => p.deadline && isToday(p.deadline));
    
    case 'thisWeek':
      return projects.filter((p) => {
        if (!p.deadline) return false;
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        return p.deadline >= weekStart && p.deadline <= weekEnd;
      });
    
    case 'thisMonth':
      return projects.filter((p) => p.deadline && isThisMonth(p.deadline));
    
    case 'overdue':
      return projects.filter((p) => p.deadline && isPast(p.deadline) && !p.tasks.every((t) => t.completed));
    
    case 'upcoming':
      return projects.filter((p) => p.deadline && isFuture(p.deadline));
    
    default:
      return projects;
  }
}

// ステータス別フィルタリング
export function filterByStatus(projects: Project[], status: ProjectStatus | 'all'): Project[] {
  if (status === 'all') return projects;
  return projects.filter((p) => p.status === status);
}

// 売上計算
export function calculateRevenue(projects: Project[]): {
  confirmed: number;      // 確定売上（取引完了）
  inProgress: number;    // 進行中（取引中）
  estimated: number;     // 見込み（見積もり段階）
  total: number;         // 合計
} {
  const confirmed = projects
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const inProgress = projects
    .filter((p) => p.status === 'in_progress')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const estimated = projects
    .filter((p) => p.status === 'free_estimate' || p.status === 'paid_estimate')
    .reduce((sum, p) => sum + p.amount, 0);
  
  return {
    confirmed,
    inProgress,
    estimated,
    total: confirmed + inProgress + estimated,
  };
}

// 今月の売上
export function calculateMonthlyRevenue(projects: Project[]): number {
  const now = new Date();
  return projects
    .filter((p) => {
      if (p.status !== 'completed') return false;
      const completedDate = p.updatedAt;
      return completedDate.getMonth() === now.getMonth() && 
             completedDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.amount, 0);
}

// 金額フォーマット
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

// 期限が近いかチェック（3日以内）
export function isDeadlineNear(deadline: Date | null): boolean {
  if (!deadline) return false;
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
}

