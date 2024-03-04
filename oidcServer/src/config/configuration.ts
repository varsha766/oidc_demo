import { Configuration } from "oidc-provider";
export const configuration = {
    scopes: ['verifiableCredential'],
    clientBasedCORS() {
        return true
    },
    async findAccount(_, id) {
        const account = { username: "varsha", password: "123456", _id: "12345rrfvm", emailVerified: true, email: "varshakumari370@gmail.com" }
        return (
            account && {
                accountId: id,
                async claims(_, scope) {
                    if (!scope) return undefined
                    const openid = { sub: id }
                    const email = {
                        email: account.email,
                        email_verified: account.emailVerified
                    }
                    const accountInfo = {}
                    if (scope.includes('openId')) Object.assign(accountInfo, openid)
                    if (scope.includes('email')) Object.assign(accountInfo, email)
                    return accountInfo
                }
            }
        )

    }

}