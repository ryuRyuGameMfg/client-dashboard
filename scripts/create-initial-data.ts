import { Project, DataFile } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const now = new Date();
const december1 = new Date('2024-12-01');

const initialProjects: Project[] = [
  {
    id: generateId(),
    name: 'AIキャラクターの開発',
    client: '辻様',
    platform: 'lancers',
    type: 'development',
    amount: 150000,
    deadline: december1,
    status: 'in_progress',
    tasks: [],
    proposals: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'AIキャラクターの開発',
    client: 'クーラー様',
    platform: 'coconala',
    type: 'development',
    amount: 100000,
    deadline: null,
    status: 'in_progress',
    tasks: [],
    proposals: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'AIキャラクターの開発',
    client: 'クーラー様',
    platform: 'coconala',
    type: 'development',
    amount: 300000,
    deadline: null,
    status: 'in_progress',
    tasks: [],
    proposals: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'オンライン講座',
    client: '',
    platform: 'coconala',
    type: 'teaching',
    amount: 0,
    deadline: null,
    status: 'free_estimate',
    tasks: [],
    proposals: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
  },
];

const dataFile: DataFile = {
  projects: initialProjects.map(p => ({
    ...p,
    deadline: p.deadline ? p.deadline.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    tasks: p.tasks.map(t => ({
      ...t,
      deadline: t.deadline ? t.deadline.toISOString() : null,
    })),
    proposals: p.proposals.map(prop => ({
      ...prop,
      estimateDeadline: prop.estimateDeadline ? prop.estimateDeadline.toISOString() : null,
    })),
  })),
  lastUpdated: now.toISOString(),
};

console.log(JSON.stringify(dataFile, null, 2));

