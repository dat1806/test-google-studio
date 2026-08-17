import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  Tag, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TeamMember } from '../../types';
import { getPriorityBadge, getStatusBadge, formatDate, isTaskOverdue } from '../../utils/formatters';

interface ListViewProps {
  tasks: Task[];
  members: TeamMember[];
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTaskPriority?: (taskId: string, newPriority: TaskPriority) => void;
  onUpdateTaskAssignee?: (taskId: string, assigneeId: string) => void;
  onDeleteTasks?: (taskIds: string[]) => void;
  onQuickAddTask: () => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  members,
  onSelectTask,
  onUpdateTaskStatus,
  onUpdateTaskPriority,
  onUpdateTaskAssignee,
  onDeleteTasks,
  onQuickAddTask,
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const memberMap = new Map<string, TeamMember>(members.map((m) => [m.id, m]));

  const allSelected = tasks.length > 0 && selectedTaskIds.length === tasks.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map((t) => t.id));
    }
  };

  const toggleSelectTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((item) => item !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const handleBatchMarkDone = () => {
    selectedTaskIds.forEach((id) => onUpdateTaskStatus(id, 'done'));
    setSelectedTaskIds([]);
  };

  const handleBatchDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedTaskIds.length} công việc đã chọn?`)) {
      onDeleteTasks(selectedTaskIds);
      setSelectedTaskIds([]);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Batch Actions Bar (when tasks are selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold text-indigo-900 dark:text-indigo-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span>Đã chọn <strong>{selectedTaskIds.length}</strong> công việc</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchMarkDone}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Đánh dấu Hoàn thành
            </button>
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa ({selectedTaskIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-3.5 min-w-[280px]">Tên Công Việc</th>
                <th className="p-3.5 min-w-[130px]">Trạng Thái</th>
                <th className="p-3.5 min-w-[120px]">Ưu Tiên</th>
                <th className="p-3.5 min-w-[160px]">Người Phụ Trách</th>
                <th className="p-3.5 min-w-[110px]">Hạn Chót</th>
                <th className="p-3.5 min-w-[100px]">Tiến Độ</th>
                <th className="p-3.5 min-w-[90px] text-right">Giờ (L/E)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy công việc nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  const priority = getPriorityBadge(task.priority);
                  const status = getStatusBadge(task.status);
                  const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : null;
                  const overdue = isTaskOverdue(task.dueDate, task.status);
                  const subtaskDone = task.subtasks.filter((s) => s.completed).length;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 transition cursor-pointer ${
                        isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectTask(task.id, e as any)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Title & Tags */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 mb-1">
                          {task.title}
                        </div>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status Selector */}
                      <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border ${status.bg} focus:outline-none cursor-pointer`}
                        >
                          <option value="todo">Cần làm</option>
                          <option value="in_progress">Đang làm</option>
                          <option value="review">Đang duyệt</option>
                          <option value="done">Hoàn thành</option>
                        </select>
                      </td>

                      {/* Priority Selector */}
                      <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.priority}
                          onChange={(e) => onUpdateTaskPriority(task.id, e.target.value as TaskPriority)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border ${priority.bg} focus:outline-none cursor-pointer`}
                        >
                          <option value="urgent">Khẩn cấp</option>
                          <option value="high">Ưu tiên cao</option>
                          <option value="medium">Trung bình</option>
                          <option value="low">Thấp</option>
                        </select>
                      </td>

                      {/* Assignee Selector */}
                      <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {assignee ? (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          )}

                          <select
                            value={task.assigneeId || ''}
                            onChange={(e) => onUpdateTaskAssignee(task.id, e.target.value)}
                            className="bg-transparent text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer max-w-[120px] truncate"
                          >
                            <option value="">Chưa giao</option>
                            {members.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="p-3.5">
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            overdue
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {overdue && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                          {formatDate(task.dueDate)}
                        </span>
                      </td>

                      {/* Subtask Progress */}
                      <td className="p-3.5">
                        {task.subtasks.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500"
                                style={{
                                  width: `${(subtaskDone / task.subtasks.length) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {subtaskDone}/{task.subtasks.length}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Hours */}
                      <td className="p-3.5 text-right font-medium text-slate-600 dark:text-slate-400">
                        {task.loggedHours}h / {task.estimatedHours}h
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
