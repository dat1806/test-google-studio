import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI Endpoint: Task Breakdown & Project Plan Generator
app.post("/api/ai/breakdown", async (req, res) => {
  try {
    const { projectTitle, projectDescription, category, memberRoles, count = 6 } = req.body;

    const ai = getGenAI();
    if (!ai) {
      // Return smart structured fallback if API key is not configured
      return res.json({
        success: true,
        source: "fallback",
        tasks: [
          {
            title: `Lập kế hoạch & Đặc tả yêu cầu cho ${projectTitle || "dự án"}`,
            description: "Thu thập yêu cầu chi tiết từ khách hàng và các bên liên quan, xác định phạm vi và mục tiêu chính.",
            priority: "high",
            estimatedHours: 16,
            tags: ["Planning", "Specs"],
            subtasks: [
              "Họp kickoff và thống nhất mục tiêu",
              "Soạn tài liệu đặc tả chức năng (SRS)",
              "Phê duyệt mốc tiến độ chính"
            ],
            suggestedRole: "Project Manager"
          },
          {
            title: `Thiết kế kiến trúc hệ thống & Wireframe UI/UX`,
            description: "Xây dựng sơ đồ dữ liệu, luồng người dùng (User Flow) và bộ giao diện mẫu hoàn chỉnh.",
            priority: "urgent",
            estimatedHours: 24,
            tags: ["Design", "Architecture"],
            subtasks: [
              "Thiết kế bản vẽ sơ đồ hệ thống",
              "Thiết kế Figma nguyên mẫu (Prototype)",
              "Review với team kỹ thuật"
            ],
            suggestedRole: "UI/UX Designer"
          },
          {
            title: `Phát triển module cốt lõi & API Backend`,
            description: "Khởi tạo database, xây dựng các dịch vụ backend và API xác thực, xử lý dữ liệu.",
            priority: "high",
            estimatedHours: 40,
            tags: ["Backend", "Core"],
            subtasks: [
              "Cấu hình cơ sở dữ liệu & migration",
              "Viết API CRUD nghiệp vụ chính",
              "Kiểm thử bảo mật và phân quyền"
            ],
            suggestedRole: "Backend Developer"
          },
          {
            title: `Xây dựng giao diện tương tác Frontend & Tích hợp API`,
            description: "Lập trình các màn hình chính, kết nối API backend, xử lý trải nghiệm mượt mà trên desktop và mobile.",
            priority: "medium",
            estimatedHours: 36,
            tags: ["Frontend", "Integration"],
            subtasks: [
              "Xây dựng component UI thư viện",
              "Ghép nối API và xử lý loading state",
              "Tối ưu hiệu năng render"
            ],
            suggestedRole: "Frontend Developer"
          },
          {
            title: `Kiểm thử chất lượng QA/QC & Sửa lỗi (UAT)`,
            description: "Thực hiện test ca sử dụng, kiểm tra hiệu năng tải và hỗ trợ kiểm thử người dùng cuối.",
            priority: "medium",
            estimatedHours: 20,
            tags: ["QA", "Testing"],
            subtasks: [
              "Viết Test Case và kịch bản UAT",
              "Test tự động & manual bug hunting",
              "Xác nhận các tiêu chí nghiệm thu"
            ],
            suggestedRole: "QA Engineer"
          },
          {
            title: `Triển khai sản phẩm (Production) & Chuyển giao bàn giao`,
            description: "Thiết lập môi trường máy chủ, CI/CD pipeline, bàn giao tài liệu vận hành và đào tạo người dùng.",
            priority: "high",
            estimatedHours: 12,
            tags: ["DevOps", "Release"],
            subtasks: [
              "Deploy lên Cloud / Container",
              "Cấu hình giám sát (Monitoring & Logging)",
              "Biên soạn hướng dẫn sử dụng"
            ],
            suggestedRole: "DevOps Engineer"
          }
        ]
      });
    }

    const prompt = `Bạn là một Chuyên gia Quản lý Dự án (Senior Technical Project Manager).
Hãy phân rã mục tiêu/dự án sau thành danh sách các công việc (tasks) chi tiết, thực tế và có cấu trúc cao:

Tên dự án: ${projectTitle}
Mô tả/Mục tiêu: ${projectDescription || "Quản lý và thực hiện hiệu quả"}
Lĩnh vực/Category: ${category || "Chung"}
Đội ngũ vai trò sẵn có: ${memberRoles ? memberRoles.join(", ") : "Project Manager, Tech Lead, Frontend Dev, Backend Dev, UI/UX Designer, QA Engineer"}
Số lượng công việc mong muốn: khoảng ${count} công việc chính logic.

Trả về kết quả bằng tiếng Việt theo định dạng JSON đúng schema được chỉ định.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Tiêu đề công việc ngắn gọn, rõ ràng" },
                  description: { type: Type.STRING, description: "Mô tả chi tiết việc cần làm" },
                  priority: { type: Type.STRING, description: "Mức ưu tiên: 'low' | 'medium' | 'high' | 'urgent'" },
                  estimatedHours: { type: Type.NUMBER, description: "Số giờ ước tính hoàn thành (ví dụ 8, 16, 24)" },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Các nhãn phân loại (vd: Frontend, Backend, UI/UX, QA, DevOps)"
                  },
                  subtasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Các bước việc nhỏ cụ thể (subtasks checklist)"
                  },
                  suggestedRole: { type: Type.STRING, description: "Vai trò phù hợp phụ trách công việc này" }
                },
                required: ["title", "description", "priority", "estimatedHours", "tags", "subtasks"]
              }
            }
          },
          required: ["tasks"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      source: "gemini",
      tasks: parsed.tasks || []
    });
  } catch (error: any) {
    console.error("AI Task Breakdown Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI task breakdown",
    });
  }
});

// AI Endpoint: Project Risk & Optimization Assessment
app.post("/api/ai/risk-analysis", async (req, res) => {
  try {
    const { project, tasks } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Contextual fallback response
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter((t: any) => t.status === "done")?.length || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return res.json({
        success: true,
        source: "fallback",
        overallScore: progress > 70 ? 88 : 74,
        healthStatus: progress > 50 ? "Khá tốt (On Track)" : "Cần lưu ý tiến độ",
        summary: `Dự án "${project?.name || "Hiện tại"}" đang có ${totalTasks} công việc với tiến độ hoàn thành ${progress}%. Cần theo sát các việc ưu tiên cao (Urgent/High) và phân bổ thời gian hợp lý.`,
        risks: [
          {
            title: "Khối lượng công việc dồn ứ ở giai đoạn sau",
            severity: "medium",
            mitigation: "Nên chia nhỏ các task lớn thành subtasks và giao rõ ràng cho từng thành viên theo từng sprint 1-2 tuần."
          },
          {
            title: "Kiểm soát thời gian ước tính vs thực tế",
            severity: "low",
            mitigation: "Khuyến khích thành viên bấm giờ hoặc ghi log giờ mỗi ngày để kịp thời cảnh báo khi có task vượt estimate."
          }
        ],
        recommendations: [
          "Tổ chức Daily Standup 10 phút đầu ngày để gỡ các vướng mắc (blockers).",
          "Ưu tiên hoàn thành các task trạng thái In Review để giải phóng năng lực cho team.",
          "Cập nhật trạng thái và deadline trước ngày thứ Sáu hàng tuần."
        ]
      });
    }

    const taskSummary = (tasks || []).map((t: any) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      estimatedHours: t.estimatedHours,
      loggedHours: t.loggedHours,
      dueDate: t.dueDate
    }));

    const prompt = `Phân tích rủi ro và tình trạng sức khỏe của dự án phần mềm/kinh doanh sau:
Tên dự án: ${project?.name}
Mô tả: ${project?.description}
Ngân sách: ${project?.budget} | Đã chi: ${project?.spent}
Thời hạn: Từ ${project?.startDate} đến ${project?.dueDate}
Danh sách các công việc hiện tại (${taskSummary.length} việc):
${JSON.stringify(taskSummary.slice(0, 20), null, 2)}

Hãy đóng vai trò Giám đốc Dự án cao cấp (PMO Director), đưa ra phân tích khách quan, rủi ro tiềm ẩn và các giải pháp hành động cụ thể bằng tiếng Việt theo định dạng JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER, description: "Điểm số sức khỏe dự án trên thang 100" },
            healthStatus: { type: Type.STRING, description: "Trạng thái ngắn gọn (vd: Tốt, Cần theo dõi, Nguy cơ cao)" },
            summary: { type: Type.STRING, description: "Nhận xét tổng quan tình hình dự án" },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Tên rủi ro" },
                  severity: { type: Type.STRING, description: "'low' | 'medium' | 'high'" },
                  mitigation: { type: Type.STRING, description: "Biện pháp phòng ngừa / khắc phục" }
                },
                required: ["title", "severity", "mitigation"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Danh sách 3-5 khuyến nghị hành động ngay"
            }
          },
          required: ["overallScore", "healthStatus", "summary", "risks", "recommendations"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      source: "gemini",
      ...parsed
    });
  } catch (error: any) {
    console.error("AI Risk Analysis Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze project risks",
    });
  }
});

// AI Endpoint: Executive Summary / Progress Report Generation
app.post("/api/ai/report", async (req, res) => {
  try {
    const { project, tasks, members } = req.body;
    const ai = getGenAI();

    const totalTasks = tasks?.length || 0;
    const doneTasks = tasks?.filter((t: any) => t.status === "done")?.length || 0;
    const inProgressTasks = tasks?.filter((t: any) => t.status === "in_progress")?.length || 0;
    const reviewTasks = tasks?.filter((t: any) => t.status === "review")?.length || 0;
    const todoTasks = tasks?.filter((t: any) => t.status === "todo")?.length || 0;

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        reportTitle: `Báo Cáo Tiến Độ Dự Án: ${project?.name || "Project"}`,
        generatedDate: new Date().toLocaleDateString("vi-VN"),
        executiveSummary: `Dự án "${project?.name}" đang được triển khai với tổng số ${totalTasks} hạng mục công việc. Hiện tại đã hoàn thành ${doneTasks} việc (${totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%), đang xử lý ${inProgressTasks} việc, và ${reviewTasks} việc đang chờ nghiệm thu.`,
        keyHighlights: [
          `Đã hoàn thành ${doneTasks}/${totalTasks} công việc chính.`,
          `Các tính năng lõi đang vận hành ổn định.`,
          `Đội ngũ ${members?.length || 0} nhân sự phối hợp nhịp nhàng.`
        ],
        nextSteps: [
          "Tập trung hoàn tất các công việc đang trong giai đoạn Review.",
          "Chuẩn bị tài liệu kiểm thử và bàn giao giai đoạn tiếp theo.",
          "Tổ chức họp đánh giá tuần định kỳ."
        ]
      });
    }

    const prompt = `Hãy soạn thảo một Báo Cáo Tiến Độ Dự Án Chuyên Nghiệp (Executive Project Report) cho Ban Lãnh Đạo / Khách Hàng bằng tiếng Việt:
Thông tin dự án:
- Tên: ${project?.name}
- Mô tả: ${project?.description}
- Ngân sách: ${project?.budget} | Đã dùng: ${project?.spent}
- Tổng số công việc: ${totalTasks}
- Hoàn thành: ${doneTasks} | Đang làm: ${inProgressTasks} | Đang duyệt: ${reviewTasks} | Cần làm: ${todoTasks}
- Số thành viên tham gia: ${members?.length || 0}
- Chi tiết các việc nổi bật: ${JSON.stringify(tasks?.slice(0, 10)?.map((t: any) => ({ title: t.title, status: t.status, priority: t.priority })) || [])}

Trả về định dạng JSON theo schema chuyên nghiệp.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reportTitle: { type: Type.STRING },
            generatedDate: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            keyHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            nextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["reportTitle", "generatedDate", "executiveSummary", "keyHighlights", "nextSteps"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      source: "gemini",
      ...parsed
    });
  } catch (error: any) {
    console.error("AI Report Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate report",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
