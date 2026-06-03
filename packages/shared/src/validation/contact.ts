import { z } from 'zod';

// Single source of truth for contact-form validation. Imported by every framework's
// form (React, Vue, Angular) and by the API that receives the submission, so the rules
// live in exactly one place and the client and server can never drift apart.
export const contactSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	email: z.email('Enter a valid email'),
	message: z.string().trim().min(1, 'Message is required'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
