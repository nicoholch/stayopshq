import { Resend } from 'resend';

export const getResend = () => new Resend(process.env.RESEND_API_KEY ?? 'placeholder');
