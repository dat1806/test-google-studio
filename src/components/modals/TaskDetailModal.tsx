import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Copy, 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  CheckSquare, 
  Square, 
  MessageSquare, 
  Paperclip, 
  Tag, 
  User, 
  AlertCircle, 
  Save,
  CheckCircle2
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TeamMember, SubTask, TaskComment, TaskAttachment } from '../../types';
import { getPriorityBadge, getStatusBadge, formatDate, formatRelativeTime, isTaskOverdue } from '../../utils/formatters';

interface TaskDetailModalProps {
  task: Task;
  members: TeamMember[];
  onClose: () => void;
  onSaveTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  members,
  onClose,
  onSaveTask,
  onDeleteTask,
  onDuplicateTask,
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState<string>(task.assigneeId || '');
  const [dueDate, setDueDate] = useState<string>(task.dueDate || '');
  const [startDate, setStartDate] = useState<string>(task.startDate || '');
  const [estimatedHours, setEstimatedHours] = useState<number>(task.estimatedHours || 0);
  const [loggedHours, setLoggedHours] = useState<number>(task.loggedHours || 0);
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [comments, setComments] = useState<TaskComment[]>(task.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>(task.attachments || []);

  // Live Timer (Stopwatch) State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleSaveTimerToLoggedHours = () => {
    if (timerSeconds === 0) return;
    const additionalHours = parseFloat((timerSeconds / 3600).toFixed(2));
    const newLogged = parseFloat((loggedHours + additionalHours).toFixed(2));
    setLoggedHours(newLogged);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  const formatTimerDisplay = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Subtask handlers
  const handleToggleSubtask = (stId: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === stId ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSt: SubTask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (stId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== stId));
  };

  // Tag handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const cleanTag = newTagInput.trim().replace(/^#/, '');
      if (!tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Comment handler
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newC: TaskComment = {
      id: `c-${Date.now()}`,
      authorId: 'm1',
      authorName: 'Nguyễn Văn An',
      content: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments([newC, ...comments]);
    setNewCommentText('');
  };

  // Save changes
  const handleSave = () => {
    const updated: Task = {
      ...task,
      title: title.trim() || 'Công việc không tên',
      description,
      status,
      priority,
      assigneeId: assigneeId || undefined,
      dueDate,
      startDate,
      estimatedHours: Number(estimatedHours) || 0,
      loggedHours: Number(loggedHours) || 0,
      tags,
      subtasks,
      comments,
      attachments,
      updatedAt: new Date().toISOString(),
    };
    onSaveTask(updated);
    onClose();
  };

  const subtaskDone = subtasks.filter((s) => s.completed).length;
  const overdue = isTaskOverdue(dueDate, status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-400">
              #{task.id}
            </span>
            {overdue && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200">
                <AlertCircle className="w-3 h-3" /> Quá hạn chót
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDuplicateTask(task)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Nhân bản công việc"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Xóa công việc"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Columns Layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tiêu Đề Công Việc
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-base sm:text-lg font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-slate-700 pb-2 focus:outline-none focus:border-indigo-600 transition"
                placeholder="Nhập tiêu đề công việc..."
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mô Tả Chi Tiết
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition leading-relaxed"
                placeholder="Mô tả các yêu cầu, lưu ý và tiêu chuẩn nghiệm thu của công việc..."
              />
            </div>

            {/* Subtasks Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  Danh Sách Việc Nhỏ (Subtasks: {subtaskDone}/{subtasks.length})
                </label>
              </div>

              {subtasks.length > 0 && (
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(subtaskDone / subtasks.length) * 100}%` }}
                  />
                </div>
              )}

              <div className="space-y-2">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className="flex items-center gap-2.5 text-left flex-1"
                    >
                      {st.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                        {st.title}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask form */}
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Thêm bước thực hiện mới (nhấn Enter)..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-100 transition"
                >
                  Thêm
                </button>
              </form>
            </div>

            {/* Comments Stream */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Trao Đổi & Bình Luận ({comments.length})
              </label>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Viết bình luận, ghi chú tiến độ..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition shadow-2xs"
                >
                  Gửi
                </button>
              </form>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {comment.authorName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Properties (Right 1 col) */}
          <div className="space-y-5 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 dark:text-slate-400">Trạng Thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="todo">Cần Làm (To Do)</option>
                <option value="in_progress">Đang Thực Hiện (In Progress)</option>
                <option value="review">Chờ Duyệt / QA (Review)</option>
                <option value="done">Đã Hoàn Thành (Done)</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 dark:text-slate-400">Mức Độ Ưu Tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="urgent">Khẩn Cấp (Urgent)</option>
                <option value="high">Ưu Tiên Cao (High)</option>
                <option value="medium">Trung Bình (Medium)</option>
                <option value="low">Thấp (Low)</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 dark:text-slate-400">Người Phụ Trách</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Chưa phân công</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400">Ngày Bắt Đầu</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400">Hạn Chót</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full p-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 ${
                    overdue ? 'border-rose-500 text-rose-600 font-bold' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
            </div>

            {/* Hours: Estimated vs Logged */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400">Ước tính (giờ)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400">Đã log (giờ)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={loggedHours}
                  onChange={(e) => setLoggedHours(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* LIVE STOPWATCH TIMER */}
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Bấm Giờ Trực Tiếp
                </span>
                <span className="font-mono font-bold text-sm text-indigo-700 dark:text-indigo-300">
                  {formatTimerDisplay(timerSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-bold transition text-white ${
                    isTimerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isTimerRunning ? 'Tạm Dừng' : 'Bắt Đầu'}
                </button>

                {timerSeconds > 0 && (
                  <button
                    type="button"
                    onClick={handleSaveTimerToLoggedHours}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition"
                    title="Ghi nhận giờ vào tổng đã log"
                  >
                    Lưu Giờ
                  </button>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 dark:text-slate-400">Nhãn (Tags)</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Nhập tag rồi ấn Enter..."
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <Save className="w-4 h-4" /> Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
};
