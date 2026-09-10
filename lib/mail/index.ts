import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * E-poçt göndərmə qatı — Gmail SMTP.
 *
 * Konfiqurasiya `.env` faylından oxunur:
 *   GMAIL_USER          — göndərən Gmail ünvanı
 *   GMAIL_APP_PASSWORD  — Google «Tətbiq parolu» (adi hesab parolu DEYİL)
 *   MAIL_FROM_NAME      — məktubda görünən ad (istəyə bağlı)
 *   NEXT_PUBLIC_SITE_URL— məktublardakı linklərin baza ünvanı
 *
 * Konfiqurasiya yoxdursa göndərmə sadəcə baş tutmur — sayt işləməyə davam
 * edir. Abunə, şərh və sual axınları məktubdan asılı olmamalıdır.
 */

/**
 * Dəyər təmizlənir: bəzi redaktorlar dırnaq əlavə edir, Google isə tətbiq
 * parolunu «abcd efgh ijkl mnop» şəklində boşluqlarla göstərir. İkisi də
 * qəbul edilir ki, sadə kopyala-yapışdır işləsin.
 */
function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const clean = raw.trim().replace(/^["']|["']$/g, "").trim();
  return clean || undefined;
}

const user = readEnv("GMAIL_USER");
const pass = readEnv("GMAIL_APP_PASSWORD")?.replace(/\s+/g, "");

export function isMailConfigured(): boolean {
  return Boolean(user && pass);
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    "http://localhost:3000"
  );
}

let cached: Transporter | null = null;

function transporter(): Transporter | null {
  if (!isMailConfigured()) return null;
  if (cached) return cached;

  cached = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    /* Gmail bir bağlantıda çoxlu məktuba icazə verir — kütləvi göndərişdə
     * hər məktub üçün yeni SMTP bağlantısı açılmasın deyə hovuz açılır. */
    pool: true,
    maxConnections: 1,
    maxMessages: 50,
  });

  return cached;
}

export interface MailInput {
  to: string | string[];
  /** Kütləvi göndərişdə alıcılar bir-birini görməsin deyə */
  bcc?: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface MailResult {
  success: boolean;
  /** Konfiqurasiya olmadığına görə göndərilmədisə */
  skipped?: boolean;
  error?: string;
}

export async function sendMail(input: MailInput): Promise<MailResult> {
  const tx = transporter();
  if (!tx) {
    console.warn(
      "[mail] GMAIL_USER / GMAIL_APP_PASSWORD təyin edilməyib — məktub göndərilmədi.",
    );
    return { success: false, skipped: true };
  }

  const fromName = process.env.MAIL_FROM_NAME?.trim() || "Dr. Nərmin Əliyeva";

  try {
    await tx.sendMail({
      from: `"${fromName}" <${user}>`,
      to: input.to,
      bcc: input.bcc,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[mail] Göndərmə xətası:", message);
    return { success: false, error: message };
  }
}

/** SMTP məlumatlarının doğruluğunu yoxlayır (admin panelindəki test düyməsi) */
export async function verifyMailConnection(): Promise<MailResult> {
  const tx = transporter();
  if (!tx) return { success: false, skipped: true };
  try {
    await tx.verify();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
