import React, { useState } from 'react';
import { X, Download, Upload, RefreshCw, FileSpreadsheet, FileJson, CheckCircle2, AlertCircle } from 'lucide-react';
import { Project, Task, TeamMember } from '../../types';
import { exportProjectDataJSON, exportTasksToCSV, resetDefaultState } from '../../utils/storage';

interface ImportExportModalProps {
  currentProject: Project;
  allProjects: Project[];
  allTasks: Task[];
  members: TeamMember[];
  onClose: () => void;
  onDataReloaded: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  currentProject,
  allProjects,
  allTasks,
  members,
  onClose,
  onDataReloaded,
}) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const projectTasks = allTasks.filter((t) => t.projectId === currentProject.id);

  const handleExportCSV = () => {
    exportTasksToCSV(projectTasks, currentProject.name);
  };

  const handleExportJSON = () => {
    exportProjectDataJSON(allProjects, allTasks);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.projects && parsed.tasks) {
          localStorage.setItem('projecthub_projects', JSON.stringify(parsed.projects));
          localStorage.setItem('projecthub_tasks', JSON.stringify(parsed.tasks));
          setImportStatus('success');
          setTimeout(() => {
            onDataReloaded();
            onClose();
          }, 1500);
        } else {
          throw new Error('Định dạng file sao lưu không hợp lệ. Cần chứa projects và tasks.');
        }
      } catch (err: any) {
        setImportStatus('error');
        setErrorMessage(err.message || 'Lỗi khi đọc file backup JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('CẢNH BÁO: Hành động này sẽ xóa các thay đổi hiện tại và khôi phục dữ liệu mẫu chuẩn ban đầu. Bạn có muốn tiếp tục?')) {
      resetDefaultState();
      onDataReloaded();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Xuất / Nhập & Quản Lý Dữ Liệu
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Xuất Dữ Liệu (Export)
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportCSV}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 text-left transition group space-y-2"
            >
              <FileSpreadsheet className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition" />
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">Xuất File Excel/CSV</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Danh sách việc dự án <strong>{currentProject.name}</strong>
                </p>
              </div>
            </button>

            <button
              onClick={handleExportJSON}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/60 text-left transition group space-y-2"
            >
              <FileJson className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition" />
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">Sao Lưu Toàn Bộ (JSON)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Tất cả dự án, công việc và lịch sử</p>
              </div>
            </button>
          </div>
        </div>

        {/* Import Backup */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Khôi Phục Bản Sao Lưu (Import)
          </h4>

          <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition text-center">
            <Upload className="w-6 h-6 text-indigo-600 mb-1" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Chọn hoặc kéo thả file JSON sao lưu vào đây
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {importStatus === 'success' && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Khôi phục dữ liệu thành công! Đang tải lại ứng dụng...
            </div>
          )}

          {importStatus === 'error' && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              {errorMessage}
            </div>
          )}
        </div>

        {/* Reset Database */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-300">Khôi phục dữ liệu mẫu mặc định</p>
            <p className="text-[10px] text-slate-400">Tải lại bộ dự án và dữ liệu mẫu phong phú</p>
          </div>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 transition font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Khôi Phục
          </button>
        </div>
      </div>
    </div>
  );
};
