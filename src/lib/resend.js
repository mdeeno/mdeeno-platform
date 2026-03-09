import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM = 'M-DEENO Prop-Logic™ <report@mdeeno.com>';
export const REPLY_TO = 'hello@mdeeno.com';
