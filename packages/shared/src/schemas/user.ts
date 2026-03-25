import { z } from 'zod'

export const UserRoleSchema = z.enum(['athlete', 'trainer', 'admin', 'assistant_coach'])

export type UserRole = z.infer<typeof UserRoleSchema>
