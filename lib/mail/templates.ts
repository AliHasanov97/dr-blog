import "server-only";
import { siteUrl } from "./index";

/**
 * Məktub şablonları.
 *
 * E-poçt müştəriləri (xüsusən Gmail) müasir CSS-in çoxunu atır, ona görə
 * burada cədvəlsiz-sadə HTML və sətiriçi (`inline`) üslub işlədilir.
 * Hər məktubun mətn versiyası da var — spam filtrləri bunu tələb edir.
 */

const BRAND = "#1b3a6b";
const ACCENT = "#0f766e";
const MUTED = "#6b7280";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Abunəlikdən çıxma linki — hər abunəçinin öz gizli tokeni ilə */
export function unsubscribeUrl(token: string): string {
  return `${siteUrl()}/abunelik/cixis?token=${encodeURIComponent(token)}`;
}

function layout(options: {
  title: string;
  body: string;
  unsubscribeToken?: string;
}): string {
  const footer = options.unsubscribeToken
    ? `
      <p style="margin:24px 0 0;font-size:12px;line-height:18px;color:${MUTED}">
        Bu məktubu «Həftəlik Tibbi Bülleten»ə abunə olduğunuz üçün alırsınız.
        <a href="${unsubscribeUrl(options.unsubscribeToken)}" style="color:${MUTED}">Abunəlikdən çıxmaq</a> üçün bura klikləyin.
      </p>`
    : "";

  return `<!doctype html>
<html lang="az">
<body style="margin:0;padding:24px;background:#f4f6fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
    <div style="border-bottom:2px solid ${ACCENT};padding-bottom:12px;margin-bottom:24px">
      <span style="font-size:18px;font-weight:600;color:${BRAND}">Dr. Nərmin Əliyeva</span>
      <span style="display:block;font-size:13px;color:${MUTED};margin-top:2px">Kardiologiya · Sübutlu tibb</span>
    </div>
    ${options.body}
    ${footer}
  </div>
</body>
</html>`;
}

/* --------------------------------------------------------------
 * Abunə təsdiqi
 * ------------------------------------------------------------ */

export function welcomeEmail(unsubscribeToken: string) {
  const url = siteUrl();
  return {
    subject: "Abunəliyiniz təsdiqləndi — Həftəlik Tibbi Bülleten",
    html: layout({
      title: "Xoş gəldiniz",
      unsubscribeToken,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;line-height:30px;color:${BRAND}">Abunəliyiniz təsdiqləndi</h1>
        <p style="margin:0 0 12px;font-size:15px;line-height:24px">
          Həftəlik Tibbi Bülletenə abunə olduğunuz üçün təşəkkür edirik.
          Bundan sonra elmi yenilikləri və kardiologiya təhlillərini
          birbaşa poçtunuzda alacaqsınız.
        </p>
        <p style="margin:0 0 24px;font-size:15px;line-height:24px">
          Bu arada saytdakı son məqalələrə baxa bilərsiniz:
        </p>
        <a href="${url}/meqaleler"
           style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:15px;font-weight:600">
          Məqalələrə bax
        </a>`,
    }),
    text: [
      "Abunəliyiniz təsdiqləndi",
      "",
      "Həftəlik Tibbi Bülletenə abunə olduğunuz üçün təşəkkür edirik.",
      "Elmi yenilikləri və kardiologiya təhlillərini birbaşa poçtunuzda alacaqsınız.",
      "",
      `Məqalələr: ${url}/meqaleler`,
      "",
      `Abunəlikdən çıxmaq: ${unsubscribeUrl(unsubscribeToken)}`,
    ].join("\n"),
  };
}

/* --------------------------------------------------------------
 * Bülleten buraxılışı
 * ------------------------------------------------------------ */

/**
 * Admin panelindən yazılan bülleten mətni.
 * Mətn sadə abzaslar kimi qəbul edilir — HTML kimi şərh edilmir, çünki
 * kənar HTML məktub şablonunu poza bilər.
 */
export function newsletterEmail(options: {
  subject: string;
  bodyText: string;
  unsubscribeToken?: string;
}) {
  const paragraphs = options.bodyText
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:24px">${escapeHtml(
          block,
        ).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");

  return {
    subject: options.subject,
    html: layout({
      title: options.subject,
      unsubscribeToken: options.unsubscribeToken,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;line-height:30px;color:${BRAND}">${escapeHtml(
          options.subject,
        )}</h1>
        ${paragraphs}`,
    }),
    text: options.bodyText,
  };
}

/* --------------------------------------------------------------
 * Həkimə bildiriş
 * ------------------------------------------------------------ */

/** Yeni müraciət və ya məqalə sualı gələndə həkimə xəbər verir */
export function inboxNotificationEmail(options: {
  fullName: string;
  contact: string;
  subject: string;
  message: string;
}) {
  const url = siteUrl();
  return {
    subject: `Yeni müraciət: ${options.subject}`,
    html: layout({
      title: "Yeni müraciət",
      body: `
        <h1 style="margin:0 0 16px;font-size:20px;line-height:28px;color:${BRAND}">Yeni müraciət</h1>
        <p style="margin:0 0 6px;font-size:14px;line-height:22px"><strong>Kimdən:</strong> ${escapeHtml(
          options.fullName,
        )}</p>
        <p style="margin:0 0 6px;font-size:14px;line-height:22px"><strong>Əlaqə:</strong> ${escapeHtml(
          options.contact,
        )}</p>
        <p style="margin:0 0 16px;font-size:14px;line-height:22px"><strong>Mövzu:</strong> ${escapeHtml(
          options.subject,
        )}</p>
        <div style="background:#f4f6fa;border-radius:8px;padding:16px;font-size:15px;line-height:24px;white-space:pre-wrap">${escapeHtml(
          options.message,
        )}</div>
        <a href="${url}/admin/muracietler"
           style="display:inline-block;margin-top:20px;background:${ACCENT};color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600">
          Admin paneldə aç
        </a>`,
    }),
    text: [
      "Yeni müraciət",
      "",
      `Kimdən: ${options.fullName}`,
      `Əlaqə: ${options.contact}`,
      `Mövzu: ${options.subject}`,
      "",
      options.message,
      "",
      `${url}/admin/muracietler`,
    ].join("\n"),
  };
}
