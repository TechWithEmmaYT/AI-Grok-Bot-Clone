import { z } from "zod";

// zod v4: top-level z.email() replaces the deprecated z.string().email().
const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: "That does not look like an email address" }));

const MIN_PASSWORD = 8;

export const signUpIdentitySchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80, "That name is too long"),
  email,
});

export const signUpPasswordSchema = z
  .object({
    password: z.string().min(MIN_PASSWORD, `Use at least ${MIN_PASSWORD} characters`),
    confirm: z.string().min(1, "Re-enter your password"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const signInSchema = z.object({
  email,
  // No length rule: never tell a returning user their real password is too short.
  password: z.string().min(1, "Enter your password"),
});

export type SignUpIdentityValues = z.infer<typeof signUpIdentitySchema>;
export type SignUpPasswordValues = z.infer<typeof signUpPasswordSchema>;
export type SignInValues = z.infer<typeof signInSchema>;

/** Dot creation — shared by the client form and the API route. */
export const createDotSchema = z.object({
  name: z.string().trim().min(1, "Give your Dot a name").max(40),
  shape: z.string().min(1),
  color: z.string().min(1),
  instructions: z.string().max(4000).default(""),
  templateKey: z.string().nullish(),
  tools: z.array(z.string()).default([]),
});

export type CreateDotValues = z.infer<typeof createDotSchema>;

/** Task creation — shared by the create form and the API route. */
export const createTaskSchema = z.object({
  dotId: z.string().min(1, "Choose a Dot"),
  name: z.string().trim().min(1, "Give the task a name").max(60),
  prompt: z.string().trim().min(1, "Say what this task should do").max(2000),
  // Five space-separated fields; the app only ever writes expressions it built.
  cronExpression: z
    .string()
    .trim()
    .regex(/^\S+(\s+\S+){4}$/, "That is not a valid cron expression"),
  timezone: z.string().trim().min(1).default("UTC"),
});

/** Every field optional — the editor sends only what changed. */
export const updateTaskSchema = createTaskSchema
  .omit({ dotId: true })
  .partial()
  .extend({ enabled: z.boolean().optional() });

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskValues = z.infer<typeof updateTaskSchema>;
