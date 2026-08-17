import React from 'react';
import { TeamMember, Task, Project } from '../../types';
import { Mail, Briefcase, CheckCircle2, Clock, Plus, Award, AlertCircle } from 'lucide-react';
import { getPriorityBadge } from '../../utils/formatters';

interface TeamViewProps {
  members: TeamMember[];
  tasks: Task[];
  project: Project;
  onSelectTask: (task: Task) => void;
  onQuickAddTaskForMember: (memberId: string) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({
  members,
  tasks,
  project,
  onSelectTask,
  onQuickAddTaskForMember,
}) => {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Overview header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Quản Lý Nhân Sự & Phân Bổ Nguồn Lực
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi khối lượng công việc, giờ làm thực tế và năng lực hoàn thành của các thành viên trong dự án.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400">Tổng Thành Viên:</span>{' '}
            <strong className="text-slate-800 dark:text-white font-bold">{members.length}</strong>
          </div>
          <div className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
            <span>Tổng Giờ Ghi Nhận:</span>{' '}
            <strong className="font-bold">
              {tasks.reduce((sum, t) => sum + (t.loggedHours || 0), 0)}h
            </strong>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {members.map((member) => {
          const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
          const completedTasks = memberTasks.filter((t) => t.status === 'done');
          const inProgressTasks = memberTasks.filter((t) => t.status === 'in_progress');
          const totalEstimated = memberTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
          const totalLogged = memberTasks.reduce((sum, t) => sum + (t.loggedHours || 0), 0);

          // Workload load percentage based on weekly capacity
          const workloadPct = member.capacityHoursPerWeek > 0
            ? Math.round((totalEstimated / member.capacityHoursPerWeek) * 100)
            : 0;

          const isOverloaded = workloadPct > 100;

          return (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between gap-4"
            >
              {/* Header: Avatar, Name & Role */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500/20 shadow-xs"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {member.name}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {member.role}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3" /> {member.department}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onQuickAddTaskForMember(member.id)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-500 transition"
                  title="Giao việc mới cho thành viên này"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Workload Capacity Meter */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500 dark:text-slate-400">Khối lượng công việc:</span>
                  <span className={isOverloaded ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-200'}>
                    {totalEstimated}h / {member.capacityHoursPerWeek}h ({workloadPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isOverloaded
                        ? 'bg-rose-500'
                        : workloadPct > 75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, workloadPct)}%` }}
                  />
                </div>
                {isOverloaded && (
                  <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Cảnh báo: Vượt mức năng lực tuần
                  </p>
                )}
              </div>

              {/* Stats: Tasks done, in progress, hours logged */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Đang làm</span>
                  <strong className="text-indigo-600 font-bold text-sm">
                    {inProgressTasks.length}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Hoàn tất</span>
                  <strong className="text-emerald-600 font-bold text-sm">
                    {completedTasks.length}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Đã log</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-bold text-sm">
                    {totalLogged}h
                  </strong>
                </div>
              </div>

              {/* Active Tasks List for Member */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Công việc phụ trách ({memberTasks.length})
                </div>

                {memberTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">Chưa có công việc nào.</p>
                ) : (
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {memberTasks.slice(0, 4).map((task) => {
                      const priority = getPriorityBadge(task.priority);
                      return (
                        <div
                          key={task.id}
                          onClick={() => onSelectTask(task)}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs cursor-pointer transition"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priority.dot}`} />
                            <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                              {task.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                            {task.loggedHours}h
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
