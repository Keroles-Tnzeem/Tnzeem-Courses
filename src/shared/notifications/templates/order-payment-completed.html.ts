export interface OrderPaymentCompletedEmailData {
  studentName: string;
  orderId: string;
  courseName: string;
  appName?: string;
}

/**
 * Renders a simple Arabic-only payment-completed HTML email.
 */
export function renderOrderPaymentCompletedEmail(data: OrderPaymentCompletedEmailData): string {
  const { orderId, courseName, appName = 'معهد التنظيم' } = data;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>تم تأكيد الدفع</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#4f46e5;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">${appName}</p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:32px 40px;text-align:right;">
              <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.8;">
                تم تأكيد دفع طلبك رقم <strong>#${orderId}</strong>
                للالتحاق بدورة <strong>${courseName}</strong> بنجاح.<br/>
                شكراً لك، وسيتم التواصل معك قريباً بتفاصيل البدء.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; 2026 معهد التنظيم</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
