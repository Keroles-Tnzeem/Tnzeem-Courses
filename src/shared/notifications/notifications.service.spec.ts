import { NotificationsService } from './notifications.service';
import { NotificationChannelEnum } from './enums/notification-channel.enum';
import { NotificationTypeEnum } from './enums/notification-type.enum';

describe('NotificationsService.notify', () => {
    const input = {
        userId: 1,
        type: NotificationTypeEnum.ENROLLMENT_CREATED,
        title: { en: 'T', ar: 'ع' },
        body: { en: 'B', ar: 'ج' },
    };

    const build = (sendImpl: jest.Mock) => {
        const saved: any[] = [];
        const notificationRepo = {
            create: jest.fn((v) => ({ ...v })),
            save: jest.fn(async (v) => {
                saved.push(v);
                return v;
            }),
        };
        const userRepo = { findOne: jest.fn().mockResolvedValue({ id: 1, email: 'a@b.c' }) };
        const factory = { getStrategy: jest.fn(() => ({ send: sendImpl })) };
        const service = new NotificationsService(
            notificationRepo as any,
            userRepo as any,
            factory as any,
            { t: jest.fn() } as any,
        );
        return { service, saved, userRepo };
    };

    it('creates one row per channel (in-app and mail by default)', async () => {
        const { service, saved } = build(jest.fn().mockResolvedValue(undefined));
        await service.notify(input);
        expect(saved.map((n) => n.channel)).toEqual([
            NotificationChannelEnum.IN_APP,
            NotificationChannelEnum.MAIL,
        ]);
    });

    it('records the failure reason and does not throw when a channel fails', async () => {
        const { service, saved } = build(jest.fn().mockRejectedValue(new Error('smtp down')));
        await expect(service.notify(input)).resolves.toBeUndefined();
        expect(saved).toHaveLength(2);
        expect(saved[0].failedReason).toBe('smtp down');
    });

    it('skips silently when the user does not exist', async () => {
        const { service, saved, userRepo } = build(jest.fn());
        userRepo.findOne.mockResolvedValue(null);
        await service.notify(input);
        expect(saved).toHaveLength(0);
    });
});
