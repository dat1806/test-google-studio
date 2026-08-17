import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  CheckSquare, 
  MessageSquare, 
  Paperclip, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  MoreVertical,
  Calendar
} from 'lucide-react';
import { Task, TaskStatus, TeamMember } from '../../types';
import { getPriorityBadge, formatDate, isTaskOverdue } from '../../utils/formatters';

interface KanbanViewProps {
  tasks: Task[];
  members: TeamMember[];
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAddTask: (status: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string; border: string; bg: string }[] = [
  { id: 'todo', title: 'Cần Làm (To Do)', color: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700', bg: 'bg-slate-500/10' },
  { id: 'in_progress', title: 'Đang Thực Hiện', color: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-300 dark:border-indigo-700', bg: 'bg-indigo-500/10' },
  { id: 'review', title: 'Chờ Duyệt / QA', color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700', bg: 'bg-amber-500/10' },
  { id: 'done', title: 'Đã Hoàn Thành', color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-700', bg: 'bg-emerald-500/10' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  members,
  onSelectTask,
  onUpdateTaskStatus,
  onQuickAddTask,
}) => {
  const memberMap = new Map<string, TeamMember>(members.map((m) => [m.id, m]));

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'review';
    if (current === 'review') return 'done';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'done') return 'review';
    if (current === 'review') return 'in_progress';
    if (current === 'in_progress') return 'todo';
    return null;
  };

  return (
    <div className="p-4 lg:p-6 overflow-x-auto min-h-[calc(100vh-140px)]">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 min-w-[960px]">
        {COLUMNS.map((column) => {
          const colTasks = tasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className="flex flex-col bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.bg}`} />
                  <h3 className={`font-bold text-sm ${column.color}`}>
                    {column.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                <button
                  id={`quick-add-task-${column.id}`}
                  onClick={() => onQuickAddTask(column.id)}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  title="Thêm việc vào cột này"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Task Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium">Chưa có công việc nào</p>
                    <button
                      onClick={() => onQuickAddTask(column.id)}
                      className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      + Tạo việc mới
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const priority = getPriorityBadge(task.priority);
                    const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : null;
                    const overdue = isTaskOverdue(task.dueDate, task.status);
                    const subtaskDone = task.subtasks.filter((s) => s.completed).length;
                    const nextStatus = getNextStatus(task.status);
                    const prevStatus = getPrevStatus(task.status);

                    return (
                      <div
                        key={task.id}
                        id={`kanban-task-${task.id}`}
                        onClick={() => onSelectTask(task)}
                        className="group bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col gap-2.5 relative"
                      >
                        {/* Top: Priority & Quick Move Buttons */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${priority.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                            {priority.label}
                          </span>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                            {prevStatus && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateTaskStatus(task.id, prevStatus);
                                }}
                                className="p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                                title="Chuyển về cột trước"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {nextStatus && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateTaskStatus(task.id, nextStatus);
                                }}
                                className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400"
                                title="Chuyển sang cột tiếp theo"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                          {task.title}
                        </h4>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Subtasks Progress Bar (if exists) */}
                        {task.subtasks.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              <span className="flex items-center gap-1">
                                <CheckSquare className="w-3 h-3 text-slate-400" />
                                Subtasks:
                              </span>
                              <span>
                                {subtaskDone}/{task.subtasks.length}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 transition-all"
                                style={{
                                  width: `${(subtaskDone / task.subtasks.length) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Card Footer: Due Date & Assignee */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {/* Due date */}
                            <span
                              className={`flex items-center gap-1 text-[11px] font-medium ${
                                overdue
                                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {overdue && <AlertCircle className="w-3 h-3 text-rose-500" />}
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                            </span>

                            {/* Hours badge */}
                            {task.estimatedHours > 0 && (
                              <span className="hidden sm:flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
                                <Clock className="w-3 h-3" />
                                {task.loggedHours}h/{task.estimatedHours}h
                              </span>
                            )}
                          </div>

                          {/* Assignee Avatar */}
                          {assignee ? (
                            <div
                              className="flex items-center gap-1.5"
                              title={`${assignee.name} (${assignee.role})`}
                            >
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                className="w-6 h-6 rounded-full object-cover border border-white dark:border-slate-700 shadow-2xs"
                              />
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Chưa giao
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
