import * as crypto from 'crypto';

export function generateRandomString(length) {
    return crypto.randomBytes(Math.ceil(length)).toString('hex').slice(0, length);
}