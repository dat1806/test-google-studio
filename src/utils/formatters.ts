import { TaskPriority, TaskStatus, ProjectStatus } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Chưa đặt';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatRelativeTime = (timestamp?: string): string => {
  if (!timestamp) return '';
  try {
    const now = new Date();
    const date = new Date(timestamp);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Vừa xong';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;
    return formatDate(timestamp);
  } catch {
    return timestamp;
  }
};

export const getPriorityBadge = (priority: TaskPriority) => {
  switch (priority) {
    case 'urgent':
      return {
        label: 'Khẩn cấp',
        bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
    case 'high':
      return {
        label: 'Ưu tiên cao',
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case 'medium':
      return {
        label: 'Trung bình',
        bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500',
      };
    case 'low':
      return {
        label: 'Thấp',
        bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
        dot: 'bg-slate-400',
      };
  }
};

export const getStatusBadge = (status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return {
        label: 'Cần làm',
        bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
    case 'in_progress':
      return {
        label: 'Đang làm',
        bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
        dot: 'bg-indigo-500',
      };
    case 'review':
      return {
        label: 'Đang duyệt',
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case 'done':
      return {
        label: 'Hoàn thành',
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
  }
};

export const getProjectStatusBadge = (status: ProjectStatus) => {
  switch (status) {
    case 'planning':
      return { label: 'Lên kế hoạch', color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200' };
    case 'in_progress':
      return { label: 'Đang triển khai', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200' };
    case 'on_hold':
      return { label: 'Tạm dừng', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200' };
    case 'completed':
      return { label: 'Đã hoàn thành', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' };
    case 'delayed':
      return { label: 'Chậm tiến độ', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200' };
  }
};

export const isTaskOverdue = (dueDate: string, status: TaskStatus): boolean => {
  if (status === 'done' || !dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
};
