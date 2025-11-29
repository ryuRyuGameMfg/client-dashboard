import { create } from 'zustand';
import { Project, Task, Proposal } from '@/types';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';

interface ProjectStore {
  projects: Project[];
  selectedProjectId: string | null;
  viewMode: 'card' | 'table';
  filter: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'overdue' | 'upcoming';
  
  // 初期化
  initialize: () => void;
  
  // プロジェクト操作
  setProjects: (projects: Project[]) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // タスク操作
  addTask: (projectId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  
  // 提案操作
  addProposal: (projectId: string, proposal: Omit<Proposal, 'id'>) => void;
  updateProposal: (projectId: string, proposalId: string, updates: Partial<Proposal>) => void;
  deleteProposal: (projectId: string, proposalId: string) => void;
  
  // UI操作
  setSelectedProject: (id: string | null) => void;
  setViewMode: (mode: 'card' | 'table') => void;
  setFilter: (filter: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'overdue' | 'upcoming') => void;
  
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
    const state = get();
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return;

    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return;

    get().updateTask(projectId, taskId, { completed: !task.completed });
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

  save: () => {
    const { projects } = get();
    // 非同期で保存（エラーを無視）
    saveDataToStorage(projects).catch(console.error);
  },
}));

