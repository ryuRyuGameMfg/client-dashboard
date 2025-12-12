import { create } from 'zustand';
import { Project, Task, Proposal, ProjectStatus } from '@/types';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';

interface ProjectStore {
  projects: Project[];
  selectedProjectId: string | null;
  viewMode: 'card' | 'table';
  filter: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'overdue' | 'upcoming';
  statusFilter: ProjectStatus[];
  hideCompletedTasks: boolean;
  
  // 初期化
  initialize: () => void;
  
  // プロジェクト操作
  setProjects: (projects: Project[]) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (activeId: string, overId: string) => void;
  
  // タスク操作
  addTask: (projectId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  reorderTasks: (projectId: string, activeId: string, overId: string) => void;
  
  // 提案操作
  addProposal: (projectId: string, proposal: Omit<Proposal, 'id'>) => void;
  updateProposal: (projectId: string, proposalId: string, updates: Partial<Proposal>) => void;
  deleteProposal: (projectId: string, proposalId: string) => void;
  
  // UI操作
  setSelectedProject: (id: string | null) => void;
  setViewMode: (mode: 'card' | 'table') => void;
  setFilter: (filter: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'overdue' | 'upcoming') => void;
  setStatusFilter: (statuses: ProjectStatus[]) => void;
  toggleStatusFilter: (status: ProjectStatus) => void;
  setHideCompletedTasks: (hide: boolean) => void;
  
  // データの保存
  save: () => void;
}

// ID生成
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  selectedProjectId: null,
  viewMode: 'table',
  filter: 'all',
  statusFilter: ['estimate', 'in_progress'], // デフォルトで「見積もり」と「取引中」のみ表示
  hideCompletedTasks: false,

  initialize: async () => {
    const projects = await loadDataFromStorage();
    set({ projects });
  },

  setProjects: (projects) => {
    set({ projects });
    // 非同期で保存（エラーを無視）
    saveDataToStorage(projects).catch(console.error);
  },

  addProject: (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => {
      const newProjects = [...state.projects, newProject];
      // 非同期で保存（エラーを無視）
      saveDataToStorage(newProjects).catch(console.error);
      return { projects: newProjects };
    });
  },

  updateProject: (id, updates) => {
    set((state) => {
      const newProjects = state.projects.map((project) =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      );
      // 非同期で保存（エラーを無視）
      saveDataToStorage(newProjects).catch(console.error);
      return { projects: newProjects };
    });
  },

  deleteProject: (id) => {
    set((state) => {
      const newProjects = state.projects.filter((project) => project.id !== id);
      saveDataToStorage(newProjects);
      return { 
        projects: newProjects,
        selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
      };
    });
  },

  reorderProjects: (activeId, overId) => {
    set((state) => {
      const oldIndex = state.projects.findIndex((p) => p.id === activeId);
      const newIndex = state.projects.findIndex((p) => p.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return state;
      
      const newProjects = [...state.projects];
      const [removed] = newProjects.splice(oldIndex, 1);
      newProjects.splice(newIndex, 0, removed);
      
      saveDataToStorage(newProjects).catch(console.error);
      return { projects: newProjects };
    });
  },

  addTask: (projectId, taskData) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
    };
    
    set((state) => {
      const newProjects = state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: [...project.tasks, newTask],
              updatedAt: new Date(),
            }
          : project
      );
      // 非同期で保存（エラーを無視）
      saveDataToStorage(newProjects).catch(console.error);
      return { projects: newProjects };
    });
  },

  updateTask: (projectId, taskId, updates) => {
    set((state) => {
      const newProjects = state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
              updatedAt: new Date(),
            }
          : project
      );
      // 非同期で保存（エラーを無視）
      saveDataToStorage(newProjects).catch(console.error);
      return { projects: newProjects };
    });
  },

  deleteTask: (projectId, taskId) => {
    set((state) => {
      const newProjects = state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.filter((task) => task.id !== taskId),
              updatedAt: new Date(),
            }
          : project
      );
      // 非同期で保存（エラーを無視）
      saveDataToStorage(newProjects).catch(console.error);
      return { projects: newProjects };
    });
  },

  toggleTask: (projectId, taskId) => {
    set((state) => {
      const project = state.projects.find((p) => p.id === projectId);
      if (!project) return state;

      const taskIndex = project.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return state;

      const task = project.tasks[taskIndex];
      const newCompleted = !task.completed;

      // 新しいタスク配列を作成
      const newTasks = project.tasks.map((t, index) => {
        if (t.id === taskId) {
          // チェックを入れた場合: 完了ステータスに
          // チェックを外した場合: 進行中ステータスに
          return {
            ...t,
            completed: newCompleted,
            status: newCompleted ? 'completed' as const : 'in_progress' as const,
          };
        }
        
        // チェックを入れた場合、次の未完了タスクを進行中に
        if (newCompleted && index === taskIndex + 1 && !t.completed && t.status !== 'in_progress') {
          return {
            ...t,
            status: 'in_progress' as const,
          };
        }
        
        return t;
      });

      const newProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, tasks: newTasks, updatedAt: new Date() }
          : p
      );

      saveDataToStorage(newProjects).catch(console.error);
      return { projects: newProjects };
    });
  },

  reorderTasks: (projectId, activeId, overId) => {
    set((state) => {
      const project = state.projects.find((p) => p.id === projectId);
      if (!project) return state;

      const oldIndex = project.tasks.findIndex((t) => t.id === activeId);
      const newIndex = project.tasks.findIndex((t) => t.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return state;
      
      const newTasks = [...project.tasks];
      const [removed] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, removed);
      
      const newProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, tasks: newTasks, updatedAt: new Date() }
          : p
      );
      
      saveDataToStorage(newProjects).catch(console.error);
      return { projects: newProjects };
    });
  },

  addProposal: (projectId, proposalData) => {
    const newProposal: Proposal = {
      ...proposalData,
      id: generateId(),
    };
    
    set((state) => {
      const newProjects = state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              proposals: [...project.proposals, newProposal],
              updatedAt: new Date(),
            }
          : project
      );
      // 非同期で保存（エラーを無視）
      saveDataToStorage(newProjects).catch(console.error);
      return { projects: newProjects };
    });
  },

  updateProposal: (projectId, proposalId, updates) => {
    set((state) => {
      const newProjects = state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              proposals: project.proposals.map((proposal) =>
                proposal.id === proposalId ? { ...proposal, ...updates } : proposal
              ),
              updatedAt: new Date(),
            }
          : project
      );
      // 非同期で保存（エラーを無視）
      saveDataToStorage(newProjects).catch(console.error);
      return { projects: newProjects };
    });
  },

  deleteProposal: (projectId, proposalId) => {
    set((state) => {
      const newProjects = state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              proposals: project.proposals.filter((proposal) => proposal.id !== proposalId),
              updatedAt: new Date(),
            }
          : project
      );
      // 非同期で保存（エラーを無視）
      saveDataToStorage(newProjects).catch(console.error);
      return { projects: newProjects };
    });
  },

  setSelectedProject: (id) => {
    set({ selectedProjectId: id });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setFilter: (filter: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'overdue' | 'upcoming') => {
    set({ filter });
  },

  setStatusFilter: (statuses: ProjectStatus[]) => {
    set({ statusFilter: statuses });
  },

  toggleStatusFilter: (status: ProjectStatus) => {
    set((state) => {
      const currentFilters = state.statusFilter;
      if (currentFilters.includes(status)) {
        // 既に選択されている場合は削除
        return { statusFilter: currentFilters.filter((s) => s !== status) };
      } else {
        // 選択されていない場合は追加
        return { statusFilter: [...currentFilters, status] };
      }
    });
  },

  setHideCompletedTasks: (hide: boolean) => {
    set({ hideCompletedTasks: hide });
  },

  save: () => {
    const { projects } = get();
    // 非同期で保存（エラーを無視）
    saveDataToStorage(projects).catch(console.error);
  },
}));

