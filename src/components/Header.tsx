import React from 'react';
import { 
  Plus, 
  Sparkles, 
  Download, 
  Search, 
  FolderKanban, 
  Calendar, 
  ListTodo, 
  BarChart3, 
  Users, 
  Clock, 
  SlidersHorizontal,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Project, ViewMode, TeamMember } from '../types';
import { getProjectStatusBadge } from '../utils/formatters';

interface HeaderProps {
  currentProject: Project;
  projects: Project[];
  viewMode: ViewMode;
  onSelectProject: (id: string) => void;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onOpenAIAssistant: () => void;
  onOpenImportExport: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  members: TeamMember[];
  completionPercentage: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  viewMode,
  onSelectProject,
  onChangeViewMode,
  onOpenNewTask,
  onOpenNewProject,
  onOpenAIAssistant,
  onOpenImportExport,
  searchQuery,
  onSearchChange,
  completionPercentage,
}) => {
  const [projectDropdownOpen, setProjectDropdownOpen] = React.useState(false);
  const statusBadge = getProjectStatusBadge(currentProject.status);

  const viewModes: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'kanban', label: 'Bảng Kanban', icon: FolderKanban },
    { id: 'list', label: 'Danh Sách', icon: ListTodo },
    { id: 'gantt', label: 'Tiến Độ Gantt', icon: Clock },
    { id: 'calendar', label: 'Lịch Biểu', icon: Calendar },
    { id: 'team', label: 'Nhân Sự', icon: Users },
    { id: 'analytics', label: 'Báo Cáo & Thống Kê', icon: BarChart3 },
    { id: 'ai-assistant', label: 'Trợ Lý AI Gemini', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner & Quick Controls */}
      <div className="px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Project Selector & Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              id="project-selector-button"
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium text-sm transition shadow-xs"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentProject.color }}
              />
              <span className="font-semibold max-w-[200px] truncate">
                {currentProject.name}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {projectDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProjectDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1 overflow-hidden">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Danh Sách Dự Án ({projects.length})
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        id={`select-project-${p.id}`}
                        onClick={() => {
                          onSelectProject(p.id);
                          setProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2 text-sm hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition ${
                          p.id === currentProject.id
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="truncate">{p.name}</span>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">
                          {p.category}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      id="create-project-from-dropdown"
                      onClick={() => {
                        setProjectDropdownOpen(false);
                        onOpenNewProject();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tạo Dự Án Mới
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <span
            className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${statusBadge.color}`}
          >
            {statusBadge.label}
          </span>

          {/* Quick Progress indicator */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Tiến độ:</span>
            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Right: Actions (Search, AI, Export, Add Task) */}
        <div className="flex items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Tìm kiếm công việc, nhãn..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-36 sm:w-56 pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* AI Project Assistant Button */}
          <button
            id="open-ai-assistant-btn"
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-medium shadow-xs hover:shadow transition"
            title="Trợ Lý Phân Rã & Đánh Giá Dự Án AI"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">AI Planner</span>
          </button>

          {/* Data Backup / Export */}
          <button
            id="open-export-modal-btn"
            onClick={onOpenImportExport}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Sao lưu / Xuất file Excel (CSV) / Nhập dữ liệu"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* New Task Button */}
          <button
            id="header-create-task-btn"
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Việc</span>
          </button>
        </div>
      </div>

      {/* Navigation View Modes Tabs */}
      <div className="px-4 lg:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 py-1">
        {viewModes.map((vm) => {
          const Icon = vm.icon;
          const isActive = viewMode === vm.id;
          return (
            <button
              key={vm.id}
              id={`viewmode-btn-${vm.id}`}
              onClick={() => onChangeViewMode(vm.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span>{vm.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
