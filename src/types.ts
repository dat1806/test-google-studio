export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'delayed';
export type ViewMode = 'kanban' | 'list' | 'gantt' | 'calendar' | 'team' | 'analytics' | 'ai_planner' | 'ai-assistant';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate: string;
  startDate?: string;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  subtasks: SubTask[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  milestoneId?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  category: string;
  status: ProjectStatus;
  priority: TaskPriority;
  budget: number;
  spent: number;
  startDate: string;
  dueDate: string;
  managerId: string;
  memberIds: string[];
  starred?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  capacityHoursPerWeek: number;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  taskId?: string;
  taskTitle?: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface TaskFilter {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  assigneeId: string | 'all';
  tag: string | 'all';
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export type FilterOptions = TaskFilter;

export interface AIRiskAnalysis {
  overallScore: number;
  healthStatus: string;
  summary: string;
  risks: {
    title: string;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
  recommendations: string[];
}

export interface AIExecutiveReport {
  reportTitle: string;
  generatedDate: string;
  executiveSummary: string;
  keyHighlights: string[];
  nextSteps: string[];
}

export interface AIGeneratedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedHours: number;
  tags: string[];
  subtasks: string[];
  suggestedRole?: string;
}
