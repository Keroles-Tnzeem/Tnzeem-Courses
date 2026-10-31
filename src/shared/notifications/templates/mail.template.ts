export interface MailTemplateData {
  appName: string;
  en: { title: string; body: string };
  ar: { title: string; body: string };
  /** Optional call-to-action button */
  action?: { url: string; label: { en: string; ar: string } };
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const section = (
  dir: 'ltr' | 'rtl',
  title: string,
  body: string,
  action?: { url: string; label: string },
): string => `
        <tr>
          <td dir="${dir}" style="padding:24px 32px;text-align:${dir === 'rtl' ? 'right' : 'left'};">
            <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">${escapeHtml(title)}</h2>
            <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(body)}</p>
            ${
              action
                ? `<p style="margin:20px 0 0;"><a href="${escapeHtml(action.url)}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">${escapeHtml(action.label)}</a></p>`
                : ''
            }
          </td>
        </tr>`;

/** Simple bilingual (English + Arabic) HTML email. Pass the data, get the HTML string. */
export function renderMailTemplate(data: MailTemplateData): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(data.en.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:20px 32px;background:#111827;color:#ffffff;font-size:18px;font-weight:bold;">${escapeHtml(data.appName)}</td>
            </tr>${section('ltr', data.en.title, data.en.body, data.action && { url: data.action.url, label: data.action.label.en })}
            <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e5e7eb;" /></td></tr>${section('rtl', data.ar.title, data.ar.body, data.action && { url: data.action.url, label: data.action.label.ar })}
            <tr>
              <td style="padding:16px 32px;background:#f9fafb;color:#9ca3af;font-size:12px;text-align:center;">&copy; ${escapeHtml(data.appName)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
