import { Project, ProjectStatus, Platform } from '@/types';
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

// 売上計算（タスクベース、手数料を考慮）
export function calculateRevenue(projects: Project[]): {
  confirmed: number;      // 確定売上（取引完了）- 手数料差し引き後
  inProgress: number;    // 進行中（取引中）- 手数料差し引き後
  estimated: number;     // 見込み（見積もり段階）- 手数料差し引き後
  total: number;         // 合計 - 手数料差し引き後
  nextMonth: number;     // 翌月の見込み売上 - 手数料差し引き後
  grossTotal: number;    // 手数料差し引き前の合計金額
} {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  
  // タスクベースで計算（手数料を考慮）
  let confirmed = 0;
  let inProgress = 0;
  let estimated = 0;
  let nextMonthRevenue = 0;
  let grossTotal = 0;
  
  projects.forEach((project) => {
    project.tasks.forEach((task) => {
      const taskAmount = task.amount || 0;
      const netAmount = calculateNetAmount(taskAmount, project.platform);
      
      grossTotal += taskAmount;
      
      // プロジェクトのステータスに応じて分類（手数料差し引き後の金額）
      if (project.status === 'completed') {
        confirmed += netAmount;
      } else if (project.status === 'in_progress') {
        inProgress += netAmount;
      } else if (project.status === 'free_estimate' || project.status === 'paid_estimate') {
        estimated += netAmount;
      }
      
      // タスクの期限が翌月の場合は翌月の見込み売上に含める（手数料差し引き後の金額）
      if (task.deadline) {
        const taskDate = new Date(task.deadline);
        if (taskDate >= nextMonth && taskDate <= nextMonthEnd) {
          nextMonthRevenue += netAmount;
        }
      }
    });
  });
  
  return {
    confirmed,
    inProgress,
    estimated,
    total: confirmed + inProgress + estimated,
    nextMonth: nextMonthRevenue,
    grossTotal,
  };
}

// 今月の売上（タスクベース、手数料を考慮）
export function calculateMonthlyRevenue(projects: Project[]): number {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  let monthlyRevenue = 0;
  
  projects.forEach((project) => {
    if (project.status !== 'completed') return;
    
    project.tasks.forEach((task) => {
      // タスクが完了していて、期限が今月の場合は今月の売上に含める（手数料差し引き後の金額）
      if (task.completed && task.deadline) {
        const taskDate = new Date(task.deadline);
        if (taskDate >= thisMonthStart && taskDate <= thisMonthEnd) {
          const taskAmount = task.amount || 0;
          const netAmount = calculateNetAmount(taskAmount, project.platform);
          monthlyRevenue += netAmount;
        }
      }
    });
  });
  
  return monthlyRevenue;
}

// プラットフォーム別の手数料率を計算して受取額を返す
export function calculateNetAmount(amount: number, platform: Platform): number {
  if (amount <= 0) return 0;
  
  switch (platform) {
    case 'coconala':
      // ココナラ: 22%の手数料（税込）
      return Math.floor(amount * 0.78);
    
    case 'lancers':
      // ランサーズ: 報酬額に応じて変動
      if (amount >= 200000) {
        // 20万円以上: 5%
        return Math.floor(amount * 0.95);
      } else if (amount >= 100000) {
        // 10万円以上20万円未満: 10%
        return Math.floor(amount * 0.90);
      } else {
        // 10万円未満: 20%
        return Math.floor(amount * 0.80);
      }
    
    case 'crowdworks':
      // クラウドワークス: 10%の手数料
      return Math.floor(amount * 0.90);
    
    case 'direct':
    case 'other':
      // 直接案件・その他: 手数料なし
      return amount;
    
    default:
      return amount;
  }
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

