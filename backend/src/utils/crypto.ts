import crypto from 'crypto';

/**
 * Generate a secure random token for email verification or password reset
 */
export const generateToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token for storage in database
 */
export const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify a token matches its hashed version
 */
export const verifyToken = (token: string, hashedToken: string): boolean => {
    return hashToken(token) === hashedToken;
};
