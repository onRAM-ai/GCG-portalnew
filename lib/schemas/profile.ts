import * as z from "zod";

export const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  entertainmentType: z.enum(["dancer", "bartender", "hostess"]),
  hourlyRate: z.string().regex(/^\d+$/, "Must be a valid number"),
  experience: z.string().regex(/^\d+$/, "Must be a valid number"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;