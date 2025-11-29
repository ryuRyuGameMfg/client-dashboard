import { Project, DataFile } from '@/types';

const DATA_FILE_NAME = 'client-dashboard-data.json';

// データファイルのパスを取得（ブラウザ環境ではダウンロードフォルダを想定）
function getDataFilePath(): string {
  if (typeof window === 'undefined') {
    return DATA_FILE_NAME;
  }
  // ブラウザ環境では、ユーザーが指定した場所に保存する想定
  // 実際の実装では、ファイルシステムAPIを使用するか、ダウンロード機能を使用
  return DATA_FILE_NAME;
}

// LocalStorageからデータを読み込む
export function loadDataFromStorage(): Project[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem('client-dashboard-data');
    if (!stored) {
      return [];
    }

    const data: DataFile = JSON.parse(stored);
    
    // Date文字列をDateオブジェクトに変換
    return data.projects.map(project => ({
      ...project,
      deadline: project.deadline ? new Date(project.deadline) : null,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
      tasks: project.tasks.map(task => ({
        ...task,
        deadline: task.deadline ? new Date(task.deadline) : null,
      })),
      proposals: project.proposals.map(proposal => ({
        ...proposal,
        estimateDeadline: proposal.estimateDeadline ? new Date(proposal.estimateDeadline) : null,
      })),
    }));
  } catch (error) {
    console.error('Failed to load data from storage:', error);
    return [];
  }
}

// LocalStorageにデータを保存（自動保存のみ）
export function saveDataToStorage(projects: Project[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const data: DataFile = {
      projects,
      lastUpdated: new Date().toISOString(),
    };

    // LocalStorageに即座に保存
    localStorage.setItem('client-dashboard-data', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to storage:', error);
  }
}


