import { z } from 'zod';

// Define the validation schema for the spec data
export const specSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  brief: z.string().min(1, 'Brief is required'),
  services: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string())
    })
  ),
  pricing: z.array(
    z.object({
      title: z.string(),
      price: z.number(),
      currency: z.string(),
      features: z.array(z.string())
    })
  ),
  contact: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    website: z.string().url().optional()
  }),
  meta: z.object({
    brandColors: z.array(z.string()).optional(),
    logoUrl: z.string().url().optional()
  })
});

// Type for the validated spec data
export type SpecInput = z.infer<typeof specSchema>;