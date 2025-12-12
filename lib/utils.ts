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

// ステータス別フィルタリング（複数選択対応）
export function filterByStatus(projects: Project[], statuses: ProjectStatus[]): Project[] {
  // 空の配列の場合はすべて表示
  if (statuses.length === 0) return projects;
  // 選択されたステータスのいずれかに一致するものを表示
  return projects.filter((p) => statuses.includes(p.status));
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
      } else if (project.status === 'estimate') {
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

// 月別の売上データを計算（過去6ヶ月〜未来6ヶ月）
export interface MonthlyRevenueData {
  month: string;           // YYYY-MM形式
  monthLabel: string;      // 表示用（例: "2024年1月"）
  confirmed: number;       // 確定売上（完了タスク）
  expected: number;        // 見込み売上（未完了タスク）
  total: number;           // 合計
  grossConfirmed: number;  // 手数料前確定
  grossExpected: number;   // 手数料前見込み
}

export function calculateMonthlyRevenueData(projects: Project[]): MonthlyRevenueData[] {
  const now = new Date();
  const monthsData: Map<string, MonthlyRevenueData> = new Map();
  
  // 過去6ヶ月〜未来6ヶ月の月を初期化
  for (let i = -6; i <= 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    
    monthsData.set(monthKey, {
      month: monthKey,
      monthLabel,
      confirmed: 0,
      expected: 0,
      total: 0,
      grossConfirmed: 0,
      grossExpected: 0,
    });
  }
  
  // 各タスクの期限に基づいて売上を計算
  projects.forEach((project) => {
    project.tasks.forEach((task) => {
      if (!task.deadline || !task.amount) return;
      
      const taskDate = new Date(task.deadline);
      const monthKey = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}`;
      
      const data = monthsData.get(monthKey);
      if (!data) return;
      
      const netAmount = calculateNetAmount(task.amount, project.platform);
      
      if (task.completed) {
        data.confirmed += netAmount;
        data.grossConfirmed += task.amount;
      } else {
        data.expected += netAmount;
        data.grossExpected += task.amount;
      }
      data.total = data.confirmed + data.expected;
    });
  });
  
  // 月順にソートして配列で返す
  return Array.from(monthsData.values()).sort((a, b) => a.month.localeCompare(b.month));
}

// 進行中の案件数を計算（タスクのステータスベース）
export function countActiveProjects(projects: Project[]): number {
  return projects.filter((p) => 
    p.tasks.some(t => t.status === 'in_progress')
  ).length;
}

// 期限間近の案件数を計算（タスクの期限ベース、3日以内）
export function countNearDeadlineProjects(projects: Project[]): number {
  const now = new Date();
  return projects.filter((p) => {
    return p.tasks.some(task => {
      if (!task.deadline || task.completed) return false;
      const taskDate = new Date(task.deadline);
      const diffTime = taskDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    });
  }).length;
}

