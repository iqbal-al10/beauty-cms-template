import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: any
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata || {},
      },
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

export async function logUserAction(
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: any
) {
  try {
    const user = await getCurrentUser()
    if (user) {
      await logActivity(user.id, action, entityType, entityId, metadata)
    }
  } catch (error) {
    console.error('Failed to log user action:', error)
  }
}
