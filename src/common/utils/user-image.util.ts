const DEFAULT_AVATAR_PATH = '/images/empty-user.jpeg';

export function buildUserImageUrl(img?: string | null): string {
    if (img) {
        return img.startsWith('http') ? img : `${appUrl()}${img}`;
    }

    return process.env.DEFAULT_AVATAR_URL || `${appUrl()}${DEFAULT_AVATAR_PATH}`;
}

function appUrl(): string {
    return process.env.APP_URL || 'http://localhost:3000';
}
