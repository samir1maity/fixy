import { z } from 'zod';

export const customerIdSchema = z.string().trim().min(1, 'Missing required parameters');
export const websiteIdParamSchema = z.coerce.number().int().positive('Missing required parameters');

export const registerWebsiteOptionsSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  url: z.string().trim().min(1).optional(),
  textContent: z.string().trim().min(1).optional(),
  fileBuffer: z.instanceof(Buffer).optional(),
  fileName: z.string().trim().min(1).optional()
}).refine(
  (data) => Boolean(data.url || data.fileBuffer || data.textContent),
  { message: 'Provide a URL, upload a file, or paste text content' }
);

export type RegisterWebsiteOptions = z.infer<typeof registerWebsiteOptionsSchema>;

export const widgetConfigSchema = z.object({
  widgetPrimaryColor: z.string().optional(),
  widgetBotName: z.string().optional(),
  widgetAvatarUrl: z.string().optional(),
  widgetWelcomeMsg: z.string().optional(),
  widgetPosition: z.string().optional(),
});

export type WidgetConfig = z.infer<typeof widgetConfigSchema>;
