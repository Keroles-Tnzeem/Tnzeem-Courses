import { ulid } from 'ulid';

/**
 * Generates a Universally Unique Lexicographically Sortable Identifier (ULID).
 */
export const generateUlid = (): string => {
    return ulid();
};
