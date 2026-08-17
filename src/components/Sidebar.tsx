import React from 'react';
import { 
  FolderKanban, 
  Plus, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Briefcase, 
  ChevronRight, 
  Star,
  HardDrive,
  Users2
} from 'lucide-react';
import { Project, Task, TeamMember } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onOpenNewProject: () => void;
  onToggleStarProject: (id: string) => void;
  allTasks: Task[];
  members: TeamMember[];
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenAIAssistant: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onOpenNewProject,
  onToggleStarProject,
  allTasks,
  members,
  isOpen,
  onCloseMobile,
  onOpenAIAssistant,
}) => {
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeTasks = allTasks.filter((t) => t.projectId === activeProjectId);
  const doneTasks = activeTasks.filter((t) => t.status === 'done');
  const inProgressTasks = activeTasks.filter((t) => t.status === 'in_progress');
  const urgentTasks = activeTasks.filter((t) => t.priority === 'urgent' && t.status !== 'done');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo & Name */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">
                ProjectHub
              </h1>
              <p className="text-[11px] text-slate-400">Quản Trị Dự Án Chuyên Nghiệp</p>
            </div>
          </div>

          <button
            id="sidebar-quick-ai-btn"
            onClick={onOpenAIAssistant}
            className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition"
            title="Trợ lý AI"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Project List Section */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Dự Án Đang Quản Lý ({projects.length})
              </span>
              <button
                id="sidebar-add-project-btn"
                onClick={onOpenNewProject}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Tạo dự án mới"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {projects.map((project) => {
                const isSelected = project.id === activeProjectId;
                const projectTaskCount = allTasks.filter((t) => t.projectId === project.id).length;
                const projectDoneCount = allTasks.filter((t) => t.projectId === project.id && t.status === 'done').length;

                return (
                  <div
                    key={project.id}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 text-white font-medium border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                    onClick={() => {
                      onSelectProject(project.id);
                      onCloseMobile();
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold truncate leading-tight">
                          {project.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {projectDoneCount}/{projectTaskCount} việc hoàn tất
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStarProject(project.id);
                      }}
                      className={`p-1 rounded transition opacity-60 group-hover:opacity-100 ${
                        project.starred ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={project.starred ? 'Bỏ ghim' : 'Ghim dự án'}
                    >
                      <Star className={`w-3.5 h-3.5 ${project.starred ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Active Project Highlights */}
          {activeProject && (
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Tổng Quan Dự Án
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  {activeProject.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Hoàn thành
                  </div>
                  <div className="text-sm font-bold text-white">
                    {doneTasks.length} / {activeTasks.length}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                    <Clock className="w-3 h-3 text-indigo-400" /> Đang làm
                  </div>
                  <div className="text-sm font-bold text-white">
                    {inProgressTasks.length} việc
                  </div>
                </div>
              </div>

              {urgentTasks.length > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="text-[11px] leading-tight">
                    Có <strong>{urgentTasks.length}</strong> việc khẩn cấp cần xử lý!
                  </span>
                </div>
              )}

              {/* Budget info */}
              {activeProject.budget > 0 && (
                <div className="pt-2 border-t border-slate-700/60 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Ngân sách dự chi:</span>
                    <span className="font-semibold text-slate-200">
                      {formatCurrency(activeProject.budget)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        activeProject.spent > activeProject.budget ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (activeProject.spent / activeProject.budget) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer: User & Quick AI Banner */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                Admin Quản Trị
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                admin@projecthub.vn
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
