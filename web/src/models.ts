export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  createdAt?: any;
  updatedAt?: any;
  deadline?: any;
  projectStatus: 'planned' | 'in_progress' | 'blocked' | 'closed';
  codeLink?: string; // Link to code repository (GitHub, GitLab, etc.)
  resultLink?: string; // Link to result (website, app, etc.)
}

export interface Epic {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  assignedTo?: string;
  ownerId?: string;
  businessValue?: number; // 0-100
  riskLevel?: 'low' | 'medium' | 'high';
  dueDate?: any;
  createdAt?: any;
  updatedAt?: any;
}

export interface Story {
  id: string;
  epicId: string;
  projectId: string;
  title: string;
  description?: string;
  storyPoints?: number;
  assignedTo?: string;
  status?: string;
  ownerId?: string;
  sprintNumber?: number;
  acceptanceCriteria?: string[];
  businessValue?: number;
  complexity?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  createdAt?: any;
  updatedAt?: any;
}

export interface Task {
  id: string;
  storyId: string;
  epicId?: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  estimatedHours?: number;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  ownerId?: string;
  timeSpent?: number;
  remainingHours?: number;
  tags?: string[];
  blocked?: boolean;
  blockedReason?: string;
  reviewRequested?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Requirement {
  id: string;
  taskId: string;
  projectId: string;
  title: string;
  description?: string;
  acceptanceCriteria: string[];
  priority?: string;
  requirementType?: 'functional' | 'technical' | 'compliance';
  testCases?: string[];
  verified?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate?: any;
  endDate?: any;
  status: 'planned' | 'active' | 'done';
}

export interface Metrics {
  totalEpics: number;
  totalStories: number;
  totalTasks: number;
  completionRate: number;
  verifiedRequirements: number;
  blockedTasks: number;
}
