import { BadRequestException } from '@nestjs/common';
import { translate } from './lang.helper';

// Sessions are scheduled in Saudi local time (UTC+3, no DST).
const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

const toDay = (value: Date | string): string =>
    (typeof value === 'string' ? value : value.toISOString()).slice(0, 10);

/** A round cannot end before it starts. */
export function assertRoundDatesValid(
    startDate?: Date | string | null,
    endDate?: Date | string | null,
): void {
    if (startDate && endDate && toDay(endDate) < toDay(startDate)) {
        throw new BadRequestException(
            translate('errors.ROUND_END_BEFORE_START', 'Round end date cannot be before its start date'),
        );
    }
}

/** A session must be scheduled inside its round's start/end dates (when the round has them). */
export function assertSessionWithinRound(
    scheduledAt: Date | null | undefined,
    round: { startDate?: Date | string | null; endDate?: Date | string | null },
): void {
    if (!scheduledAt) return;

    const day = new Date(scheduledAt.getTime() + RIYADH_OFFSET_MS)
        .toISOString()
        .slice(0, 10);

    const before = round.startDate && day < toDay(round.startDate);
    const after = round.endDate && day > toDay(round.endDate);
    if (before || after) {
        throw new BadRequestException(
            translate(
                'errors.SESSION_OUTSIDE_ROUND_DATES',
                'Session date must be within the round start and end dates',
            ),
        );
    }
}
