import { cookies } from 'next/headers';
import { verifyTherapistToken, type TherapistTokenPayload } from './jwt';

const COOKIE_NAME = 'mb_therapist_session';

export async function getTherapistSession(): Promise<TherapistTokenPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyTherapistToken(token);
}

export async function setTherapistSessionCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

export async function clearTherapistSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };