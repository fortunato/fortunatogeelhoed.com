import { z } from 'zod';

// Single source of truth for contact-form validation. Imported by every framework's
// form (React, Vue, Angular) and by the API that receives the submission, so the rules
// live in exactly one place and the client and server can never drift apart.
export const contactSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
	email: z.email('Enter a valid email').max(254, 'Email is too long'),
	message: z.string().trim().min(1, 'Message is required').max(5000, 'Message is too long'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
