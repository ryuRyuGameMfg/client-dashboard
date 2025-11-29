// プラットフォーム
export type Platform = 
  | 'coconala'      // ココナラ
  | 'lancers'       // ランサーズ
  | 'crowdworks'    // クラウドワークス
  | 'direct'        // 直接案件
  | 'other';        // その他

// 案件種別（サービス形態）
export type ProjectType = 
  | 'development'   // 受託開発
  | 'teaching'     // 開発代行
  | 'consulting';  // サポート

// ステータス
export type ProjectStatus = 
  | 'free_estimate'    // 無料見積もり
  | 'paid_estimate'    // 有料見積もり
  | 'in_progress'      // 取引中
  | 'completed'        // 取引完了
  | 'pending';         // 保留中

// タスクステータス
export type TaskStatus = 
  | 'not_started'      // 未着手
  | 'in_progress'      // 進行中
  | 'completed'        // 完了
  | 'on_hold';         // 保留

// タスク
export interface Task {
  id: string;
  title: string;
  deadline: Date | null;
  completed: boolean;
  status: TaskStatus;
  amount: number;       // 金額
}

// 提案
export interface Proposal {
  id: string;
  description: string;
  amount: number;
  estimateDeadline: Date | null;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected';
}

// プロジェクト
export interface Project {
  id: string;
  name: string;              // 案件名
  client: string;            // 顧客名
  platform: Platform;        // プラットフォーム
  type: ProjectType;         // 案件種別
  amount: number;            // 金額
  deadline: Date | null;     // 納期
  status: ProjectStatus;     // ステータス
  tasks: Task[];
  proposals: Proposal[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// データファイルの構造
export interface DataFile {
  projects: Project[];
  lastUpdated: string;
}

// ステータスの表示名
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  free_estimate: '無料見積もり',
  paid_estimate: '有料見積もり',
  in_progress: '取引中',
  completed: '取引完了',
  pending: '保留中',
};

// プラットフォームの表示名
export const PLATFORM_LABELS: Record<Platform, string> = {
  coconala: 'ココナラ',
  lancers: 'ランサーズ',
  crowdworks: 'クラウドワークス',
  direct: '直接案件',
  other: 'その他',
};

// 案件種別の表示名（サービス形態）
export const TYPE_LABELS: Record<ProjectType, string> = {
  development: '受託開発',
  teaching: '開発代行',
  consulting: 'サポート',
};

// ステータスの色
export const STATUS_COLORS: Record<ProjectStatus, string> = {
  free_estimate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  paid_estimate: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

// タスクステータスの表示名
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: '未着手',
  in_progress: '進行中',
  completed: '完了',
  on_hold: '保留',
};

// タスクステータスの色
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

