import { Project, DataFile } from '@/types';

// APIからデータを読み込む
async function loadDataFromAPI(): Promise<Project[]> {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data: DataFile = await response.json();
    
    if (!data.projects || data.projects.length === 0) {
      return [];
    }

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
    console.error('Failed to load data from API:', error);
    return [];
  }
}

// APIにデータを保存
async function saveDataToAPI(projects: Project[]): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projects }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save data');
    }
  } catch (error) {
    console.error('Failed to save data to API:', error);
  }
}

// データを読み込む（APIから）
export async function loadDataFromStorage(): Promise<Project[]> {
  return await loadDataFromAPI();
}

// データを保存（APIに自動保存）
export async function saveDataToStorage(projects: Project[]): Promise<void> {
  await saveDataToAPI(projects);
}

// 互換性のための関数（使用しない）
export function getFileHandle(): FileSystemFileHandle | null {
  return null;
}

export function setFileHandle(): void {
  // 使用しない
}

export function hasFileHandle(): boolean {
  return true;
}

export async function initializeDataFile(): Promise<Project[]> {
  return await loadDataFromAPI();
}

export async function loadFileHandleFromIndexedDB(): Promise<FileSystemFileHandle | null> {
  return null;
}
