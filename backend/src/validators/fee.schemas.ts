import { z } from "zod";

export const createFeeSchema = z.object({
  studentId: z.number().int().positive(),
  title: z.string().min(2).max(150),
  amount: z.number().positive(),
  semester: z.string().max(20),
  dueDate: z.string(),
});

export const updateFeeStatusSchema = z.object({
  status: z.enum(["pending", "paid", "overdue", "waived"]),
});
