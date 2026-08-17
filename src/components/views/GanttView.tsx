import React, { useState, useMemo } from 'react';
import { Task, Milestone, TeamMember, Project } from '../../types';
import { formatDate, getStatusBadge, isTaskOverdue } from '../../utils/formatters';
import { Calendar, ChevronLeft, ChevronRight, Flag, Clock } from 'lucide-react';

interface GanttViewProps {
  tasks: Task[];
  milestones: Milestone[];
  members: TeamMember[];
  project: Project;
  onSelectTask: (task: Task) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({
  tasks,
  milestones,
  members,
  project,
  onSelectTask,
}) => {
  const [zoomDays, setZoomDays] = useState<number>(30); // 15, 30, 60 days
  const [startDateOffset, setStartDateOffset] = useState<number>(0);

  const memberMap = new Map<string, TeamMember>(members.map((m) => [m.id, m]));

  // Calculate timeline start and end dates
  const timelineDates = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 5 + startDateOffset);
    start.setHours(0, 0, 0, 0);

    const dates: Date[] = [];
    for (let i = 0; i < zoomDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [zoomDays, startDateOffset]);

  const timelineStart = timelineDates[0];
  const timelineEnd = timelineDates[timelineDates.length - 1];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper to calculate left & width percentage for a task
  const getTaskBarStyle = (task: Task) => {
    const taskStart = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
    const taskEnd = task.dueDate ? new Date(task.dueDate) : new Date(taskStart.getTime() + 86400000 * 3);

    taskStart.setHours(0, 0, 0, 0);
    taskEnd.setHours(23, 59, 59, 999);

    const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();
    
    // Left offset
    const offsetMs = taskStart.getTime() - timelineStart.getTime();
    let leftPct = (offsetMs / totalTimelineMs) * 100;
    
    // Duration width
    const durationMs = taskEnd.getTime() - taskStart.getTime();
    let widthPct = (durationMs / totalTimelineMs) * 100;

    // Bounds clamp
    if (leftPct < 0) {
      widthPct += leftPct;
      leftPct = 0;
    }
    if (leftPct + widthPct > 100) {
      widthPct = 100 - leftPct;
    }

    const isVisible = widthPct > 0 && leftPct < 100;

    return { leftPct: Math.max(0, leftPct), widthPct: Math.max(1.5, widthPct), isVisible };
  };

  const getBarColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-emerald-500 text-white';
      case 'review':
        return 'bg-amber-500 text-white';
      case 'in_progress':
        return 'bg-indigo-600 text-white';
      default:
        return 'bg-slate-400 text-slate-900';
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Controls: Zoom & Date navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStartDateOffset((prev) => prev - 7)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Lùi 7 ngày"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setStartDateOffset(0)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Hôm Nay
          </button>
          <button
            onClick={() => setStartDateOffset((prev) => prev + 7)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Tiến 7 ngày"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-2">
            Khoảng thời gian: <strong>{formatDate(timelineStart.toISOString())}</strong> - <strong>{formatDate(timelineEnd.toISOString())}</strong>
          </span>
        </div>

        {/* Zoom selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium">Khung xem:</span>
          {[15, 30, 45].map((days) => (
            <button
              key={days}
              onClick={() => setZoomDays(days)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                zoomDays === days
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {days} Ngày
            </button>
          ))}
        </div>
      </div>

      {/* Gantt Chart Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header: Task column + Timeline dates */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
              <div className="w-72 p-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 border-r border-slate-200 dark:border-slate-800">
                Công việc / Mốc dự án
              </div>
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timelineDates.length}, minmax(0, 1fr))` }}>
                {timelineDates.map((date, index) => {
                  const isToday = date.toDateString() === today.toDateString();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <div
                      key={index}
                      className={`text-center py-2 text-[10px] font-medium border-r border-slate-200/60 dark:border-slate-800 ${
                        isToday
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                          : isWeekend
                          ? 'bg-slate-100/50 dark:bg-slate-800/40 text-slate-400'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div>{date.toLocaleDateString('vi-VN', { weekday: 'narrow' })}</div>
                      <div className={isToday ? 'inline-block px-1.5 rounded-full bg-indigo-600 text-white font-bold' : ''}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones bar (if any) */}
            {milestones.length > 0 && (
              <div className="flex border-b border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 py-2">
                <div className="w-72 px-3 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 shrink-0 border-r border-slate-200 dark:border-slate-800">
                  <Flag className="w-3.5 h-3.5" /> Mốc Tiến Độ (Milestones)
                </div>
                <div className="flex-1 relative h-6">
                  {milestones.map((m) => {
                    const mDate = new Date(m.dueDate);
                    mDate.setHours(0, 0, 0, 0);
                    const totalMs = timelineEnd.getTime() - timelineStart.getTime();
                    const leftPct = ((mDate.getTime() - timelineStart.getTime()) / totalMs) * 100;

                    if (leftPct < 0 || leftPct > 100) return null;

                    return (
                      <div
                        key={m.id}
                        style={{ left: `${leftPct}%` }}
                        className="absolute top-0 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-xs whitespace-nowrap z-10"
                        title={`${m.title} (${formatDate(m.dueDate)})`}
                      >
                        <Flag className="w-3 h-3" />
                        <span className="max-w-[120px] truncate">{m.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  Chưa có công việc nào trên dòng thời gian.
                </div>
              ) : (
                tasks.map((task) => {
                  const { leftPct, widthPct, isVisible } = getTaskBarStyle(task);
                  const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : null;
                  const barColor = getBarColor(task.status);
                  const overdue = isTaskOverdue(task.dueDate, task.status);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="flex hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                    >
                      {/* Left: Task Info */}
                      <div className="w-72 p-3 border-r border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 transition">
                            {task.title}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(task.dueDate)}
                          </p>
                        </div>

                        {assignee && (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                            title={assignee.name}
                          />
                        )}
                      </div>

                      {/* Right: Timeline Grid & Bar */}
                      <div className="flex-1 relative py-2.5 px-1 flex items-center">
                        {/* Grid background lines */}
                        <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${timelineDates.length}, minmax(0, 1fr))` }}>
                          {timelineDates.map((_, i) => (
                            <div key={i} className="border-r border-slate-100 dark:border-slate-800/60 h-full" />
                          ))}
                        </div>

                        {/* Task Schedule Bar */}
                        {isVisible && (
                          <div
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                            className={`absolute h-7 rounded-lg shadow-xs flex items-center px-2 text-[11px] font-medium transition-all group-hover:brightness-110 z-10 overflow-hidden ${barColor}`}
                          >
                            <span className="truncate whitespace-nowrap">
                              {task.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
