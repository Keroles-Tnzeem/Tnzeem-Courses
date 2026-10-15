export interface NotificationContent {
  title: Record<string, string>;
  body: Record<string, string>;
}

const STATUS_AR: Record<string, string> = {
  pending: 'قيد الانتظار',
  active: 'نشط',
  completed: 'مكتمل',
  dropped: 'منسحب',
};

export function enrollmentCreatedContent(
  courseName: Record<string, string>,
): NotificationContent {
  const en = courseName.en ?? courseName.ar ?? '';
  const ar = courseName.ar ?? courseName.en ?? '';
  return {
    title: { en: 'Enrollment confirmed', ar: 'تم تأكيد التسجيل' },
    body: {
      en: `You have been enrolled in "${en}".`,
      ar: `تم تسجيلك في دورة "${ar}".`,
    },
  };
}

export function orderCreatedContent(
  courseName: Record<string, string>,
  orderId: string,
): NotificationContent {
  const en = courseName.en ?? courseName.ar ?? '';
  const ar = courseName.ar ?? courseName.en ?? '';
  return {
    title: { en: 'Order placed successfully', ar: 'تم تقديم طلبك بنجاح' },
    body: {
      en: `Your order #${orderId} for "${en}" has been received and is pending review.`,
      ar: `تم استلام طلبك رقم #${orderId} للدورة "${ar}" وهو قيد المراجعة.`,
    },
  };
}

export function enrollmentStatusChangedContent(
  courseName: Record<string, string>,
  status: string,
): NotificationContent {
  const en = courseName.en ?? courseName.ar ?? '';
  const ar = courseName.ar ?? courseName.en ?? '';
  return {
    title: { en: 'Enrollment updated', ar: 'تم تحديث التسجيل' },
    body: {
      en: `Your enrollment in "${en}" is now ${status}.`,
      ar: `أصبحت حالة تسجيلك في دورة "${ar}": ${STATUS_AR[status] ?? status}.`,
    },
  };
}

const COURSE_STATUS_AR: Record<string, string> = {
    pending: 'قيد المراجعة',
    published: 'منشورة',
    draft: 'مسودة',
};

export function courseCreatedContent(
    courseName: Record<string, string>,
    status: string,
): NotificationContent {
    const en = courseName.en ?? courseName.ar ?? '';
    const ar = courseName.ar ?? courseName.en ?? '';
    return {
        title: { en: 'New course created', ar: 'تم إنشاء دورة جديدة' },
        body: {
            en: `Your course "${en}" has been created. Current status: ${status}.`,
            ar: `تم إنشاء دورتك "${ar}". الحالة الحالية: ${COURSE_STATUS_AR[status] ?? status}.`,
        },
    };
}
