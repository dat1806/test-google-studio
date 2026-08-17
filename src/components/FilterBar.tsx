import React from 'react';
import { 
  Filter, 
  ArrowUpDown, 
  X, 
  Tag, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { FilterOptions, TeamMember, TaskPriority, TaskStatus } from '../types';

interface FilterBarProps {
  filterOptions: FilterOptions;
  onChangeFilter: (newFilters: Partial<FilterOptions>) => void;
  onResetFilters: () => void;
  members: TeamMember[];
  allTags: string[];
  totalTasks: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  onChangeFilter,
  onResetFilters,
  members,
  allTags,
  totalTasks,
  filteredCount,
}) => {
  const hasActiveFilters =
    filterOptions.search !== '' ||
    filterOptions.status !== 'all' ||
    filterOptions.priority !== 'all' ||
    filterOptions.assigneeId !== 'all' ||
    filterOptions.tag !== 'all';

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Filters chips & Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
          <Filter className="w-3.5 h-3.5" /> Bộ Lọc:
        </span>

        {/* Priority Filter */}
        <select
          id="filter-priority-select"
          value={filterOptions.priority}
          onChange={(e) => onChangeFilter({ priority: e.target.value as TaskPriority | 'all' })}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">Mức Ưu Tiên: Tất cả</option>
          <option value="urgent">Khẩn cấp</option>
          <option value="high">Ưu tiên cao</option>
          <option value="medium">Trung bình</option>
          <option value="low">Thấp</option>
        </select>

        {/* Assignee Filter */}
        <select
          id="filter-assignee-select"
          value={filterOptions.assigneeId}
          onChange={(e) => onChangeFilter({ assigneeId: e.target.value })}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">Người Phụ Trách: Tất cả</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.role.split('/')[0]})
            </option>
          ))}
        </select>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <select
            id="filter-tag-select"
            value={filterOptions.tag}
            onChange={(e) => onChangeFilter({ tag: e.target.value })}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Nhãn Tag: Tất cả</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        )}

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <button
            id="reset-filters-btn"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition font-medium"
          >
            <X className="w-3.5 h-3.5" /> Xóa bộ lọc ({filteredCount}/{totalTasks})
          </button>
        )}
      </div>

      {/* Right: Sort controls & Total counter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400">Sắp xếp:</span>
          <select
            id="sort-by-select"
            value={filterOptions.sortBy}
            onChange={(e) => onChangeFilter({ sortBy: e.target.value as FilterOptions['sortBy'] })}
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="dueDate">Hạn chót (Deadline)</option>
            <option value="priority">Mức độ ưu tiên</option>
            <option value="createdAt">Mới tạo nhất</option>
            <option value="title">Tên việc (A-Z)</option>
          </select>

          <button
            id="sort-order-toggle-btn"
            onClick={() => onChangeFilter({ sortOrder: filterOptions.sortOrder === 'asc' ? 'desc' : 'asc' })}
            className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title={`Thứ tự: ${filterOptions.sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}`}
          >
            {filterOptions.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="text-slate-400 font-medium">
          Hiển thị: <strong className="text-slate-700 dark:text-slate-200">{filteredCount}</strong> / {totalTasks} việc
        </div>
      </div>
    </div>
  );
};
