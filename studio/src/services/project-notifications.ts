import { sendEmail } from "@/services/email-service";
import { getStatusLabel } from "@/services/project-service";
import { createNotification } from "@/services/notifications/notifications-service";
import type { ProjectStatus } from "@/types/project";

export async function notifyProjectStatusChange(params: {
  clientId: string;
  clientEmail?: string;
  clientName?: string;
  projectId: string;
  projectName: string;
  newStatus: ProjectStatus;
  oldStatus?: ProjectStatus;
}): Promise<void> {
  const statusLabel = getStatusLabel(params.newStatus);

  await createNotification({
    userId: params.clientId,
    title: `Project Update: ${params.projectName}`,
    body: `Your project status changed to ${statusLabel}`,
    type: "project",
    read: false,
    link: `/dashboard/projects/${params.projectId}`,
  });

  if (params.clientEmail) {
    const subject = `${params.projectName} — Status: ${statusLabel}`;
    const html = `
      <h2 style="color:#fff;margin:0 0 8px">Project Update</h2>
      <p style="color:#aaa;line-height:1.6;margin:0 0 16px">Hi ${params.clientName || "there"},</p>
      <p style="color:#aaa;line-height:1.6;margin:0 0 16px">Your project <strong style="color:#fff">${params.projectName}</strong> has moved to <strong style="color:#4ade80">${statusLabel}</strong>.</p>
      <a href="${process.env.FRONTEND_URL || "https://radbitstudios.co.zw"}/dashboard/projects/${params.projectId}" style="display:inline-block;background:#1A8A7A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View Project</a>
    `;
    await sendEmail(params.clientEmail, subject, html);
  }
}

export async function notifyTaskAssigned(params: {
  clientId: string;
  clientEmail?: string;
  clientName?: string;
  projectId: string;
  projectName: string;
  taskTitle: string;
}): Promise<void> {
  await createNotification({
    userId: params.clientId,
    title: `New Task: ${params.taskTitle}`,
    body: `A new task has been added to ${params.projectName}`,
    type: "project",
    read: false,
    link: `/dashboard/projects/${params.projectId}`,
  });

  if (params.clientEmail) {
    const subject = `New task: ${params.taskTitle}`;
    const html = `
      <h2 style="color:#fff;margin:0 0 8px">New Task Assigned</h2>
      <p style="color:#aaa;line-height:1.6;margin:0 0 16px">Hi ${params.clientName || "there"},</p>
      <p style="color:#aaa;line-height:1.6;margin:0 0 16px">A new task has been added to <strong style="color:#fff">${params.projectName}</strong>:</p>
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin:0 0 16px">
        <p style="color:#fff;font-weight:600;margin:0">${params.taskTitle}</p>
      </div>
      <a href="${process.env.FRONTEND_URL || "https://radbitstudios.co.zw"}/dashboard/projects/${params.projectId}" style="display:inline-block;background:#1A8A7A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View Task</a>
    `;
    await sendEmail(params.clientEmail, subject, html);
  }
}
