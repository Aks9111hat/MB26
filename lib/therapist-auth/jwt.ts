import jwt from 'jsonwebtoken';

const SECRET = process.env.THERAPIST_JWT_SECRET;
if (!SECRET) {
    throw new Error('THERAPIST_JWT_SECRET is not set');
}

export interface TherapistTokenPayload {
    therapistId: string;
    email: string;
}

export function signTherapistToken(payload: TherapistTokenPayload): string {
    return jwt.sign(payload, SECRET as string, { expiresIn: '7d' });
}

export function verifyTherapistToken(token: string): TherapistTokenPayload | null {
    try {
        return jwt.verify(token, SECRET as string) as TherapistTokenPayload;
    } catch {
        return null;
    }
}