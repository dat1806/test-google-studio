import { Project, Task, TeamMember, Milestone, ActivityLog } from '../types';
import { INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_MEMBERS, INITIAL_MILESTONES, INITIAL_ACTIVITY_LOGS } from '../data/mockData';

const STORAGE_KEYS = {
  PROJECTS: 'projecthub_projects_v1',
  TASKS: 'projecthub_tasks_v1',
  MEMBERS: 'projecthub_members_v1',
  MILESTONES: 'projecthub_milestones_v1',
  ACTIVITIES: 'projecthub_activities_v1',
  ACTIVE_PROJECT_ID: 'projecthub_active_project_id_v1',
  VIEW_MODE: 'projecthub_view_mode_v1',
};

// Projects
export const getStoredProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load projects from storage', e);
    return INITIAL_PROJECTS;
  }
};

export const saveStoredProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to storage', e);
  }
};

export const loadProjects = getStoredProjects;
export const saveProjects = saveStoredProjects;

// Tasks
export const getStoredTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks from storage', e);
    return INITIAL_TASKS;
  }
};

export const saveStoredTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to storage', e);
  }
};

export const loadTasks = getStoredTasks;
export const saveTasks = saveStoredTasks;

// Members
export const getStoredMembers = (): TeamMember[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load members from storage', e);
    return INITIAL_MEMBERS;
  }
};

export const saveStoredMembers = (members: TeamMember[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save members to storage', e);
  }
};

export const loadTeamMembers = getStoredMembers;
export const saveTeamMembers = saveStoredMembers;

// Milestones
export const getStoredMilestones = (): Milestone[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(INITIAL_MILESTONES));
      return INITIAL_MILESTONES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load milestones from storage', e);
    return INITIAL_MILESTONES;
  }
};

export const saveStoredMilestones = (milestones: Milestone[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  } catch (e) {
    console.error('Failed to save milestones to storage', e);
  }
};

export const loadMilestones = getStoredMilestones;
export const saveMilestones = saveStoredMilestones;

// Activities
export const getStoredActivities = (): ActivityLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITY_LOGS));
      return INITIAL_ACTIVITY_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load activities from storage', e);
    return INITIAL_ACTIVITY_LOGS;
  }
};

export const saveStoredActivities = (activities: ActivityLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error('Failed to save activities to storage', e);
  }
};

export const loadActivities = getStoredActivities;
export const saveActivities = saveStoredActivities;

// Active Project Id
export const getStoredActiveProjectId = (): string => {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID) || 'proj-1';
};

export const saveStoredActiveProjectId = (id: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
};

export const loadActiveProjectId = getStoredActiveProjectId;
export const saveActiveProjectId = saveStoredActiveProjectId;

// Reset All
export const resetAllDataToDefault = (): void => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(INITIAL_MILESTONES));
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, 'proj-1');
};

export const resetDefaultState = resetAllDataToDefault;

// Export / Import
export const exportAllDataToJSON = (): void => {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projects: getStoredProjects(),
    tasks: getStoredTasks(),
    members: getStoredMembers(),
    milestones: getStoredMilestones(),
    activities: getStoredActivities(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `projecthub-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportProjectDataJSON = (projects: Project[], tasks: Task[]): void => {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projects,
    tasks,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `projecthub-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportTasksToCSV = (tasks: Task[], projectName: string = 'project'): void => {
  const headers = ['Mã Task', 'Tiêu Đề', 'Trạng Thái', 'Mức Ưu Tiên', 'Người Phụ Trách', 'Hạn Chót', 'Giờ Ước Tính', 'Giờ Thực Tế', 'Nhãn Tags'];
  
  const statusLabels: Record<string, string> = {
    todo: 'Cần làm',
    in_progress: 'Đang làm',
    review: 'Đang duyệt',
    done: 'Hoàn thành'
  };

  const priorityLabels: Record<string, string> = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    urgent: 'Khẩn cấp'
  };

  const rows = tasks.map(t => [
    `"${t.id}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${statusLabels[t.status] || t.status}"`,
    `"${priorityLabels[t.priority] || t.priority}"`,
    `"${t.assigneeId || 'Chưa giao'}"`,
    `"${t.dueDate}"`,
    `"${t.estimatedHours}"`,
    `"${t.loggedHours}"`,
    `"${t.tags.join(', ')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
