import React, { useState } from 'react';
import { Project, Task, TeamMember, AIGeneratedTask, AIRiskAnalysis, AIExecutiveReport } from '../../types';
import { 
  Sparkles, 
  Send, 
  Check, 
  Plus, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Copy, 
  CheckCheck,
  RefreshCw,
  Zap,
  ListPlus,
  Compass,
  Briefcase
} from 'lucide-react';
import { getPriorityBadge } from '../../utils/formatters';

interface AIAssistantViewProps {
  project: Project;
  tasks: Task[];
  members: TeamMember[];
  onImportGeneratedTasks: (newTasks: AIGeneratedTask[]) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  project,
  tasks,
  members,
  onImportGeneratedTasks,
}) => {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'risk' | 'report'>('breakdown');
  
  // Task Breakdown state
  const [goalPrompt, setGoalPrompt] = useState('');
  const [taskCount, setTaskCount] = useState(6);
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<AIGeneratedTask[]>([]);
  const [selectedTaskIndices, setSelectedTaskIndices] = useState<number[]>([]);
  const [breakdownSuccessMsg, setBreakdownSuccessMsg] = useState(false);

  // Risk Assessment state
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);
  const [riskData, setRiskData] = useState<AIRiskAnalysis | null>(null);

  // Report state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<AIExecutiveReport | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  // Handle Generate Tasks
  const handleGenerateBreakdown = async () => {
    setIsGeneratingBreakdown(true);
    setBreakdownSuccessMsg(false);
    try {
      const res = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: project.name,
          projectDescription: goalPrompt || project.description,
          category: project.category,
          memberRoles: members.map((m) => m.role),
          count: taskCount,
        }),
      });
      const data = await res.json();
      if (data.tasks) {
        setGeneratedTasks(data.tasks);
        setSelectedTaskIndices(data.tasks.map((_: any, idx: number) => idx));
      }
    } catch (e) {
      console.error('Failed to generate breakdown', e);
    } finally {
      setIsGeneratingBreakdown(false);
    }
  };

  // Handle Import Selected Tasks
  const handleImportTasks = () => {
    const tasksToImport = generatedTasks.filter((_, idx) => selectedTaskIndices.includes(idx));
    if (tasksToImport.length > 0) {
      onImportGeneratedTasks(tasksToImport);
      setBreakdownSuccessMsg(true);
      setTimeout(() => setBreakdownSuccessMsg(false), 4000);
    }
  };

  // Handle Risk Analysis
  const handleAnalyzeRisk = async () => {
    setIsAnalyzingRisk(true);
    try {
      const res = await fetch('/api/ai/risk-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, tasks }),
      });
      const data = await res.json();
      setRiskData(data);
    } catch (e) {
      console.error('Failed to analyze risk', e);
    } finally {
      setIsAnalyzingRisk(false);
    }
  };

  // Handle Executive Report
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, tasks, members }),
      });
      const data = await res.json();
      setReportData(data);
    } catch (e) {
      console.error('Failed to generate report', e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const copyReportText = () => {
    if (!reportData) return;
    const text = `${reportData.reportTitle}
Ngày lập: ${reportData.generatedDate}

TÓM TẮT ĐIỀU HÀNH:
${reportData.executiveSummary}

KẾT QUẢ & ĐIỂM NỔI BẬT:
${reportData.keyHighlights.map((h) => `- ${h}`).join('\n')}

HÀNH ĐỘNG TIẾP THEO:
${reportData.nextSteps.map((s) => `- ${s}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Banner */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Powered by Gemini 3.7 Flash AI
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Trợ Lý Quản Trị Dự Án Thông Minh
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            Tự động phân rã mục tiêu thành công việc cụ thể, đánh giá các điểm nghẽn rủi ro và tổng hợp báo cáo tiến độ chỉ trong vài giây.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'breakdown'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ListPlus className="w-4 h-4" /> Phân Rã Kế Hoạch (Task Breakdown)
        </button>

        <button
          onClick={() => {
            setActiveTab('risk');
            if (!riskData) handleAnalyzeRisk();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'risk'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Đánh Giá Rủi Ro (Risk Audit)
        </button>

        <button
          onClick={() => {
            setActiveTab('report');
            if (!reportData) handleGenerateReport();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'report'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Báo Cáo Tiến Độ (Executive Report)
        </button>
      </div>

      {/* TAB 1: TASK BREAKDOWN */}
      {activeTab === 'breakdown' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Nhập Mục Tiêu Hoặc Đề Bài Dự Án
            </h3>

            <div className="space-y-3">
              <textarea
                value={goalPrompt}
                onChange={(e) => setGoalPrompt(e.target.value)}
                placeholder={`Ví dụ: "Xây dựng tính năng thanh toán One-Page Checkout", "Triển khai chiến dịch ra mắt sản phẩm trên TikTok & Facebook", "Tối ưu hóa tốc độ load trang dưới 1.5s"...`}
                rows={3}
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Số lượng việc cần tạo:</span>
                  {[4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTaskCount(num)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        taskCount === num
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {num} việc
                    </button>
                  ))}
                </div>

                <button
                  id="ai-generate-breakdown-btn"
                  onClick={handleGenerateBreakdown}
                  disabled={isGeneratingBreakdown}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition"
                >
                  {isGeneratingBreakdown ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Đang Phân Tích & Phân Rã...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> AI Phân Rã Kế Hoạch Ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generated Tasks Results */}
          {generatedTasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Kết Quả Phân Rã ({generatedTasks.length} công việc gợi ý)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Chọn các công việc bạn muốn thêm vào dự án <strong>{project.name}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedTaskIndices.length === generatedTasks.length) {
                        setSelectedTaskIndices([]);
                      } else {
                        setSelectedTaskIndices(generatedTasks.map((_, i) => i));
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {selectedTaskIndices.length === generatedTasks.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>

                  <button
                    id="import-ai-tasks-btn"
                    onClick={handleImportTasks}
                    disabled={selectedTaskIndices.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-xs transition"
                  >
                    <Plus className="w-4 h-4" /> Nhập Vào Dự Án ({selectedTaskIndices.length})
                  </button>
                </div>
              </div>

              {breakdownSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  Đã nhập thành công {selectedTaskIndices.length} công việc vào dự án! Bạn có thể xem trên Bảng Kanban hoặc Danh Sách.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedTasks.map((task, index) => {
                  const isSelected = selectedTaskIndices.includes(index);
                  const priority = getPriorityBadge(task.priority);

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTaskIndices(selectedTaskIndices.filter((i) => i !== index));
                        } else {
                          setSelectedTaskIndices([...selectedTaskIndices, index]);
                        }
                      }}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
                          />

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priority.bg}`}>
                            {priority.label}
                          </span>
                        </div>

                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
                          {task.title}
                        </h5>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {task.description}
                        </p>
                      </div>

                      {/* Subtasks Preview */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Các bước thực hiện ({task.subtasks.length}):
                          </span>
                          {task.subtasks.map((st, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1 h-1 rounded-full bg-slate-400" />
                              <span className="truncate">{st}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                        <span>Ước tính: <strong>{task.estimatedHours} giờ</strong></span>
                        {task.suggestedRole && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                            {task.suggestedRole}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RISK ASSESSMENT */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Đánh Giá Sức Khỏe & Cảnh Báo Rủi Ro Dự Án
              </h3>
              <p className="text-xs text-slate-500">
                AI quét toàn bộ hạn chót, công việc quá hạn, ngân sách và khối lượng công việc để chỉ ra điểm rủi ro.
              </p>
            </div>

            <button
              onClick={handleAnalyzeRisk}
              disabled={isAnalyzingRisk}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingRisk ? 'animate-spin' : ''}`} />
              Quét Lại Rủi Ro
            </button>
          </div>

          {isAnalyzingRisk && (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Đang phân tích các thông số dự án...
              </p>
            </div>
          )}

          {riskData && !isAnalyzingRisk && (
            <div className="space-y-5">
              {/* Score & Summary Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Trạng Thái Sức Khỏe Dự Án</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-indigo-600">
                      {riskData.overallScore}/100
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                      {riskData.healthStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl mt-2 leading-relaxed">
                    {riskData.summary}
                  </p>
                </div>
              </div>

              {/* Identified Risks */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Các Rủi Ro Cần Lưu Tâm ({riskData.risks.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riskData.risks.map((risk, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          {risk.title}
                        </h5>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          risk.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {risk.severity === 'high' ? 'Mức cao' : 'Mức vừa'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                        <strong>Giải pháp:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Khuyến Nghị Hành Động (Actionable Recommendations)
                </h4>

                <div className="space-y-2">
                  {riskData.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXECUTIVE REPORT */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Báo Cáo Tiến Độ Dự Án (Executive Summary)
              </h3>
              <p className="text-xs text-slate-500">
                Tự động định dạng văn bản báo cáo cho Ban Giám Đốc hoặc Khách Hàng.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {reportData && (
                <button
                  onClick={copyReportText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {copiedReport ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedReport ? 'Đã Sao Chép!' : 'Sao Chép'}
                </button>
              )}

              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                Tạo Báo Cáo Mới
              </button>
            </div>
          </div>

          {isGeneratingReport && (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                AI đang biên soạn báo cáo...
              </p>
            </div>
          )}

          {reportData && !isGeneratingReport && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 text-xs sm:text-sm">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {reportData.reportTitle}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ngày xuất bản: {reportData.generatedDate} | Dự án: {project.name}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  1. Tóm Tắt Điều Hành (Executive Summary)
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
                  {reportData.executiveSummary}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  2. Kết Quả & Điểm Sáng Nổi Bật (Key Highlights)
                </h4>
                <div className="space-y-1.5 pl-2">
                  {reportData.keyHighlights.map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  3. Kế Hoạch & Hành Động Tiếp Theo (Next Steps)
                </h4>
                <div className="space-y-1.5 pl-2">
                  {reportData.nextSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-2" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
