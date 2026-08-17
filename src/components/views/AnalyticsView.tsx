import React from 'react';
import { Project, Task, TeamMember, ActivityLog } from '../../types';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  Layers,
  CalendarCheck
} from 'lucide-react';

interface AnalyticsViewProps {
  project: Project;
  tasks: Task[];
  members: TeamMember[];
  activities: ActivityLog[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  project,
  tasks,
  members,
  activities,
}) => {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const reviewTasks = tasks.filter((t) => t.status === 'review');
  const todoTasks = tasks.filter((t) => t.status === 'todo');

  const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalLoggedHours = tasks.reduce((sum, t) => sum + (t.loggedHours || 0), 0);

  const urgentCount = tasks.filter((t) => t.priority === 'urgent').length;
  const highCount = tasks.filter((t) => t.priority === 'high').length;
  const mediumCount = tasks.filter((t) => t.priority === 'medium').length;
  const lowCount = tasks.filter((t) => t.priority === 'low').length;

  const budgetUsageRate = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Completion Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tiến Độ Dự Án</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-500">
              ({doneTasks.length}/{totalTasks} việc)
            </span>
          </div>
          <div className="mt-3 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Metric 2: Hours Logged vs Estimated */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Thời Gian Làm Việc</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              {totalLoggedHours}h
            </span>
            <span className="text-xs text-slate-500">
              / {totalEstimatedHours}h dự kiến
            </span>
          </div>
          <div className="mt-3 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${totalEstimatedHours > 0 ? Math.min(100, (totalLoggedHours / totalEstimatedHours) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Budget Utilization */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ngân Sách Đã Chi</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 truncate">
              {formatCurrency(project.spent)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tổng định mức: {formatCurrency(project.budget)} ({budgetUsageRate}%)
          </p>
        </div>

        {/* Metric 4: Urgent & High Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mức Độ Ưu Tiên Cao</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">
              {urgentCount + highCount}
            </span>
            <span className="text-xs text-slate-500">
              ({urgentCount} khẩn cấp, {highCount} cao)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Cần tập trung ưu tiên xử lý trước hạn chót.
          </p>
        </div>
      </div>

      {/* Middle Section: Status breakdown & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Phân Bổ Theo Trạng Thái Công Việc
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600 dark:text-slate-300">Hoàn thành (Done)</span>
                <span className="font-bold text-emerald-600">{doneTasks.length} ({totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${totalTasks > 0 ? (doneTasks.length / totalTasks) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600 dark:text-slate-300">Đang thực hiện (In Progress)</span>
                <span className="font-bold text-indigo-600">{inProgressTasks.length} ({totalTasks > 0 ? Math.round((inProgressTasks.length / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: `${totalTasks > 0 ? (inProgressTasks.length / totalTasks) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600 dark:text-slate-300">Chờ nghiệm thu (Review / QA)</span>
                <span className="font-bold text-amber-600">{reviewTasks.length} ({totalTasks > 0 ? Math.round((reviewTasks.length / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${totalTasks > 0 ? (reviewTasks.length / totalTasks) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600 dark:text-slate-300">Cần làm (To Do)</span>
                <span className="font-bold text-slate-600 dark:text-slate-400">{todoTasks.length} ({totalTasks > 0 ? Math.round((todoTasks.length / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400" style={{ width: `${totalTasks > 0 ? (todoTasks.length / totalTasks) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Cơ Cấu Mức Độ Ưu Tiên
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50">
              <span className="text-xs font-semibold text-rose-600">Khẩn Cấp (Urgent)</span>
              <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
                {urgentCount}
              </div>
              <p className="text-[10px] text-rose-500 mt-0.5">Cần giải quyết ngay</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
              <span className="text-xs font-semibold text-amber-600">Ưu Tiên Cao (High)</span>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
                {highCount}
              </div>
              <p className="text-[10px] text-amber-500 mt-0.5">Quan trọng trong sprint</p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50">
              <span className="text-xs font-semibold text-blue-600">Trung Bình (Medium)</span>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
                {mediumCount}
              </div>
              <p className="text-[10px] text-blue-500 mt-0.5">Tiến độ tiêu chuẩn</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Thấp (Low)</span>
              <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
                {lowCount}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Cải tiến phụ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          Nhật Ký Hoạt Động Gần Đây (Activity Stream)
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {activities.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">Chưa có hoạt động nào được ghi nhận.</p>
          ) : (
            activities.slice(0, 8).map((act) => (
              <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {act.userName ? act.userName.slice(0, 1) : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      <strong>{act.userName}</strong> {act.action}{' '}
                      {act.taskTitle && <span className="text-indigo-600 dark:text-indigo-400 font-semibold">"{act.taskTitle}"</span>}
                    </p>
                    {act.details && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {act.details}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
