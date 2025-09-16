import { z } from 'zod';

export const permissionsSchema = z.object({
  addProperty: z.boolean(),
  editProperty: z.boolean(),
  deleteProperty: z.boolean(),
  writeReview: z.boolean(),
  deleteReview: z.boolean(),
  writeBlog: z.boolean(),
  deleteBlog: z.boolean(),
  deleteUser: z.boolean(),
  viewInquiries: z.boolean(),
  viewMessages: z.boolean(),
  deleteMessages: z.boolean(),
});

export const createAdminSchema = z.object({
  name: z.string().min(3).max(60),
  phoneNumber: z.string().regex(/^[0-9]{10,15}$/),
  password: z.string().min(10)
    .regex(/[a-z]/, "Must include lowercase")
    .regex(/[A-Z]/, "Must include uppercase")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a special char"),
  permissions: permissionsSchema,
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(10)
    .regex(/[a-z]/, "Must include lowercase")
    .regex(/[A-Z]/, "Must include uppercase")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a special char"),
});

export type AdminPermissions = z.infer<typeof permissionsSchema>;
export type CreateAdminFormData = z.infer<typeof createAdminSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface Admin {
  _id: string;
  name: string;
  phoneNumber: string;
  role: 'owner' | 'admin';
  permissions: AdminPermissions;
  createdAt: string;
}
