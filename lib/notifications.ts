import prisma from "./prisma";

type NotificationType = "TASK_ASSIGNED" | "COMPLETION_REQUESTED" | "TASK_APPROVED" | "TASK_REJECTED";

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  taskId?: string
) {
  await prisma.notification.create({ data: { userId, type, message, taskId } });
}

export async function notifyAdmins(
  type: NotificationType,
  message: string,
  taskId?: string
) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", deleted: false, enabled: true },
    select: { id: true },
  });
  await Promise.all(admins.map((a) => createNotification(a.id, type, message, taskId)));
}
