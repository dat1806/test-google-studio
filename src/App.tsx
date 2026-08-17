import React, { useState, useEffect, useMemo } from 'react';
import { 
  Project, 
  Task, 
  TeamMember, 
  Milestone, 
  ActivityLog, 
  TaskFilter, 
  TaskStatus, 
  TaskPriority, 
  ViewMode,
  AIGeneratedTask 
} from './types';
import { 
  loadProjects, 
  saveProjects, 
  loadTasks, 
  saveTasks, 
  loadMilestones, 
  saveMilestones, 
  loadTeamMembers, 
  saveTeamMembers, 
  loadActivities, 
  saveActivities, 
  loadActiveProjectId, 
  saveActiveProjectId 
} from './utils/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { KanbanView } from './components/views/KanbanView';
import { ListView } from './components/views/ListView';
import { GanttView } from './components/views/GanttView';
import { CalendarView } from './components/views/CalendarView';
import { TeamView } from './components/views/TeamView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { NewTaskModal } from './components/modals/NewTaskModal';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { ImportExportModal } from './components/modals/ImportExportModal';

export const App: React.FC = () => {
  // Global Data State
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [milestones, setMilestones] = useState<Milestone[]>(loadMilestones);
  const [members, setMembers] = useState<TeamMember[]>(loadTeamMembers);
  const [activities, setActivities] = useState<ActivityLog[]>(loadActivities);

  // Active Navigation & View State
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = loadActiveProjectId();
    return saved && projects.some((p) => p.id === saved) ? saved : (projects[0]?.id || '');
  });
  const [activeView, setActiveView] = useState<ViewMode>('kanban');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Filter State
  const [filter, setFilter] = useState<TaskFilter>({
    search: '',
    status: 'all',
    priority: 'all',
    assigneeId: 'all',
    tag: 'all',
  });

  // Modal States
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [newTaskDefaultStatus, setNewTaskDefaultStatus] = useState<TaskStatus>('todo');
  const [newTaskDefaultDate, setNewTaskDefaultDate] = useState<string | undefined>(undefined);
  const [newTaskDefaultAssignee, setNewTaskDefaultAssignee] = useState<string | undefined>(undefined);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState<boolean>(false);

  // Theme Class Toggle
  useEffect(() => {
    console.log('test')
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist State to Storage on changes
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveMilestones(milestones);
  }, [milestones]);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    if (activeProjectId) {
      saveActiveProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  // Active Project Data
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || {
      id: 'default',
      name: 'Dự Án Mặc Định',
      description: '',
      color: '#4F46E5',
      category: 'Phát Triển Phần Mềm',
      status: 'in_progress',
      priority: 'high',
      budget: 0,
      spent: 0,
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      managerId: 'm1',
      memberIds: ['m1'],
      starred: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [projects, activeProjectId]);

  // Filter Tasks for current Project
  const projectTasks = useMemo(() => {
    return tasks.filter((t) => t.projectId === currentProject.id);
  }, [tasks, currentProject.id]);

  const filteredTasks = useMemo(() => {
    return projectTasks.filter((t) => {
      // Search
      if (filter.search) {
        const query = filter.search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchDesc = t.description.toLowerCase().includes(query);
        const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }
      // Status
      if (filter.status !== 'all' && t.status !== filter.status) return false;
      // Priority
      if (filter.priority !== 'all' && t.priority !== filter.priority) return false;
      // Assignee
      if (filter.assigneeId !== 'all' && t.assigneeId !== filter.assigneeId) return false;
      // Tag
      if (filter.tag !== 'all' && !t.tags.includes(filter.tag)) return false;

      return true;
    });
  }, [projectTasks, filter]);

  // Project Milestones
  const projectMilestones = useMemo(() => {
    return milestones.filter((m) => m.projectId === currentProject.id);
  }, [milestones, currentProject.id]);

  // Helper to log activities
  const logAction = (action: string, taskTitle?: string, details?: string) => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      projectId: currentProject.id,
      userId: 'm1',
      userName: 'Nguyễn Văn An',
      action,
      taskTitle,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Task Actions
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, status: newStatus, updatedAt: new Date().toISOString() };
          logAction(
            `đã chuyển trạng thái sang "${newStatus === 'done' ? 'Hoàn thành' : newStatus === 'in_progress' ? 'Đang thực hiện' : newStatus === 'review' ? 'Chờ duyệt' : 'Cần làm'}"`,
            t.title
          );
          return updated;
        }
        return t;
      })
    );
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    logAction('đã cập nhật thông tin công việc', updatedTask.title);
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (target) {
      logAction('đã xóa công việc', target.title);
    }
  };

  const handleDuplicateTask = (task: Task) => {
    const duplicated: Task = {
      ...task,
      id: `t-${Date.now()}`,
      title: `${task.title} (Bản sao)`,
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [duplicated, ...prev]);
    logAction('đã nhân bản công việc', duplicated.title);
  };

  const handleCreateNewTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `t-${Date.now()}`,
      projectId: currentProject.id,
      title: taskData.title || 'Công việc mới',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      assigneeId: taskData.assigneeId,
      dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      startDate: taskData.startDate || new Date().toISOString().slice(0, 10),
      estimatedHours: taskData.estimatedHours || 0,
      loggedHours: 0,
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || [],
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    logAction('đã tạo công việc mới', newTask.title);
  };

  // Quick Add Triggers
  const handleOpenNewTaskWithDefaults = (opts?: {
    status?: TaskStatus;
    date?: string;
    assigneeId?: string;
  }) => {
    setNewTaskDefaultStatus(opts?.status || 'todo');
    setNewTaskDefaultDate(opts?.date);
    setNewTaskDefaultAssignee(opts?.assigneeId);
    setIsNewTaskModalOpen(true);
  };

  // Project Actions
  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProj: Project = {
      id: `p-${Date.now()}`,
      name: projectData.name || 'Dự Án Mới',
      description: projectData.description || '',
      color: projectData.color || '#4F46E5',
      category: projectData.category || 'Phát Triển Phần Mềm',
      status: projectData.status || 'in_progress',
      priority: projectData.priority || 'high',
      budget: projectData.budget || 0,
      spent: 0,
      startDate: projectData.startDate || new Date().toISOString().slice(0, 10),
      dueDate: projectData.dueDate || new Date(Date.now() + 86400000 * 60).toISOString().slice(0, 10),
      managerId: projectData.managerId || members[0]?.id || 'm1',
      memberIds: projectData.memberIds || members.map((m) => m.id),
      starred: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    logAction(`đã khởi tạo dự án mới: "${newProj.name}"`);
  };

  const handleToggleStarProject = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, starred: !p.starred } : p))
    );
  };

  // AI Import Handler
  const handleImportAITasks = (aiTasks: AIGeneratedTask[]) => {
    const newTaskList: Task[] = aiTasks.map((at, idx) => {
      // Find matching member by role if possible
      const matchedMember = members.find((m) =>
        m.role.toLowerCase().includes((at.suggestedRole || '').toLowerCase())
      );

      return {
        id: `t-ai-${Date.now()}-${idx}`,
        projectId: currentProject.id,
        title: at.title,
        description: at.description,
        status: 'todo',
        priority: at.priority,
        assigneeId: matchedMember?.id,
        dueDate: new Date(Date.now() + 86400000 * (idx + 3) * 2).toISOString().slice(0, 10),
        startDate: new Date().toISOString().slice(0, 10),
        estimatedHours: at.estimatedHours || 12,
        loggedHours: 0,
        tags: at.tags || [currentProject.category],
        subtasks: (at.subtasks || []).map((sub, sIdx) => ({
          id: `st-ai-${idx}-${sIdx}`,
          title: sub,
          completed: false,
        })),
        comments: [],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    setTasks((prev) => [...prev, ...newTaskList]);
    logAction(`đã phân rã và thêm ${newTaskList.length} công việc từ AI Assistant`);
  };

  // Reload all data after JSON import or reset
  const handleDataReloaded = () => {
    setProjects(loadProjects());
    setTasks(loadTasks());
    setMilestones(loadMilestones());
    setMembers(loadTeamMembers());
    setActivities(loadActivities());
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        projects={projects}
        activeProjectId={currentProject.id}
        activeView={activeView}
        isCollapsed={isSidebarCollapsed}
        onSelectProject={(id) => setActiveProjectId(id)}
        onSelectView={(v) => setActiveView(v)}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        onToggleStarProject={handleToggleStarProject}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeProject={currentProject}
          activeView={activeView}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onOpenNewTask={() => handleOpenNewTaskWithDefaults()}
          onOpenImportExport={() => setIsImportExportModalOpen(true)}
          onSwitchView={(v) => setActiveView(v)}
        />

        {/* Dynamic Filter Bar (For Kanban & List views) */}
        {(activeView === 'kanban' || activeView === 'list') && (
          <FilterBar
            filter={filter}
            members={members}
            tasks={projectTasks}
            onFilterChange={(newF) => setFilter(newF)}
          />
        )}

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto">
          {activeView === 'kanban' && (
            <KanbanView
              tasks={filteredTasks}
              members={members}
              onUpdateStatus={handleUpdateTaskStatus}
              onSelectTask={(task) => setSelectedTask(task)}
              onQuickAddTask={(status) => handleOpenNewTaskWithDefaults({ status })}
            />
          )}

          {activeView === 'list' && (
            <ListView
              tasks={filteredTasks}
              members={members}
              onUpdateStatus={handleUpdateTaskStatus}
              onSelectTask={(task) => setSelectedTask(task)}
              onQuickAddTask={() => handleOpenNewTaskWithDefaults()}
            />
          )}

          {activeView === 'gantt' && (
            <GanttView
              tasks={filteredTasks}
              milestones={projectMilestones}
              members={members}
              project={currentProject}
              onSelectTask={(task) => setSelectedTask(task)}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView
              tasks={projectTasks}
              members={members}
              onSelectTask={(task) => setSelectedTask(task)}
              onQuickAddTask={(date) => handleOpenNewTaskWithDefaults({ date })}
            />
          )}

          {activeView === 'team' && (
            <TeamView
              members={members}
              tasks={projectTasks}
              project={currentProject}
              onSelectTask={(task) => setSelectedTask(task)}
              onQuickAddTaskForMember={(mId) => handleOpenNewTaskWithDefaults({ assigneeId: mId })}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              project={currentProject}
              tasks={projectTasks}
              members={members}
              activities={activities.filter((a) => a.projectId === currentProject.id)}
            />
          )}

          {activeView === 'ai_planner' && (
            <AIAssistantView
              project={currentProject}
              tasks={projectTasks}
              members={members}
              onImportGeneratedTasks={handleImportAITasks}
            />
          )}
        </main>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
          onSaveTask={handleSaveTask}
          onDeleteTask={handleDeleteTask}
          onDuplicateTask={handleDuplicateTask}
        />
      )}

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <NewTaskModal
          projectId={currentProject.id}
          defaultStatus={newTaskDefaultStatus}
          defaultDate={newTaskDefaultDate}
          defaultAssigneeId={newTaskDefaultAssignee}
          members={members}
          onClose={() => setIsNewTaskModalOpen(false)}
          onCreateTask={handleCreateNewTask}
        />
      )}

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <NewProjectModal
          members={members}
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreateProject={handleCreateProject}
        />
      )}

      {/* Import / Export Modal */}
      {isImportExportModalOpen && (
        <ImportExportModal
          currentProject={currentProject}
          allProjects={projects}
          allTasks={tasks}
          members={members}
          onClose={() => setIsImportExportModalOpen(false)}
          onDataReloaded={handleDataReloaded}
        />
      )}
    </div>
  );
};

export default App;
