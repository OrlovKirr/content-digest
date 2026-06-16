import { z } from 'zod';

/** Single source of the taxonomy, shared with the frontend's Category union. */
export const CATEGORIES = [
  'Technology',
  'Business',
  'Science',
  'Health',
  'Culture',
  'Other',
] as const;

export const CategorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof CategorySchema>;

export const DigestSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  tags: z.array(z.string()),
  suggestedCategory: CategorySchema,
});
export type Digest = z.infer<typeof DigestSchema>;

export interface DigestInput {
  text: string;
  title?: string;
}
