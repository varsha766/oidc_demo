import { Provider, Configuration } from "oidc-provider"
import { gty, parameters, passwordHandler } from '../actions/grants/password'
export const oidc = (issuer, configuration) => {
    const provider = new Provider(issuer, configuration)
    provider.registerGrantType(gty, passwordHandler, parameters)
    return provider
}