// import MongoAdapter from "./adapter/clientAdapter.js";
import accountService from "./services/account.service.js";
import clientService from "./services/client.service.js";
let client;
const configuration = {
  // adapter: MongoAdapter,
  clientBasedCORS() {
    return true
  },
  // models: {
  //   Client: MongoAdapter
  // },
  claims: {
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    profile: ['birthdate', 'family_name', 'gender', 'given_name', 'locale', 'middle_name', 'name',
      'nickname', 'picture', 'preferred_username', 'profile', 'updated_at', 'website', 'zoneinfo'],
  },
  features: {
    clientCredentials: { enabled: true },

    introspection: {
      enabled: true,
      allowedPolicy(ctx, client, token) {
        if (
          client.introspectionEndpointAuthMethod === "none" &&
          token.clientId !== ctx.oidc.client?.clientId
        ) {
          return false;
        }
        return true;
      }
    },
    registration: {
      enabled: true,
      hooks: {
        afterRegistration: async req => {
          console.log(req, "req============")
          const { client, metadata } = req
          // await clientService.
        }
      }

    },
    // jwtIntrospection: {
    //     ack: undefined,
    //     enabled: true
    // },
    // resourceIndicators: {

    //     // async audiences(ctx, sub, token, use) {
    //     //     if (use === 'access_token') {
    //     //         const { oidc: { route, client, params: { resource: resourceParam } } } = ctx;
    //     //         let grantedResource;
    //     //         if (route === 'token') {
    //     //             const { oidc: { params: { grant_type } } } = ctx;
    //     //             switch (grant_type) {
    //     //                 case 'authorization_code':
    //     //                     grantedResource = ctx.oidc.entities.AuthorizationCode.resource;
    //     //                     break;
    //     //                 case 'refresh_token':
    //     //                     grantedResource = ctx.oidc.entities.RefreshToken.resource;
    //     //                     break;
    //     //                 case 'urn:ietf:params:oauth:grant-type:device_code':
    //     //                     grantedResource = ctx.oidc.entities.DeviceCode.resource;
    //     //                     break;
    //     //                 default:
    //     //             }
    //     //         }
    //     //         const allowed = await resourceAllowedForClient(resourceParam, grantedResource, client);
    //     //         if (!allowed) {
    //     //             throw new InvalidResource('unauthorized "resource" requested');
    //     //         }
    //     //         return transform(resourceParam, grantedResource); // => array of validated and transformed string audiences
    //     //     }
    //     // },
    //     // formats: {
    //     //     default: 'opaque',
    //     //     AccessToken(token) {
    //     //         if (Array.isArray(token.aud)) {
    //     //             return 'jwt';
    //     //         }
    //     //         return 'opaque';
    //     //     }
    //     // },
    //     // // ...
    // },
    // resourceIndicators: {
    //   defaultResource: (ctx, client, oneOf) => {
    //     console.log('default resource', client);
    //     return "http://example.com";
    //   },
    //   enabled: true,
    //   getResourceServerInfo: (ctx, resourceIndicator, client) => {
    //     console.log('get resource server info', client);
    //     return ({
    //       audience: 'solid',
    //       accessTokenTTL: 2 * 60 * 60, // 2 hours
    //       accessTokenFormat: 'jwt',
    //       jwt: {
    //         sign: { alg: 'ES256' },
    //       },
    //     });
    //   },
    //   useGrantedResource: (ctx, model) => {
    //     // @param ctx - koa request context
    //     // @param model - depending on the request's grant_type this can be either an AuthorizationCode, BackchannelAuthenticationRequest,
    //     //                RefreshToken, or DeviceCode model instance.
    //     return true;
    //   }
    // },
    resourceIndicators: {
      defaultResource(ctx) {
        return Array.isArray(ctx.oidc.params?.resource)
          ? ctx.oidc.params?.resource[0]
          : ctx.oidc.params?.resource;
      },
      getResourceServerInfo(ctx, resourceIndicator, client) {
        return {
          scope: "api:read offline_access",
        };
      },
    },
    revocation: { enabled: true },
    devInteractions: { enabled: false },

  },
  // formats: {
  //   AccessToken: 'jwt',
  // },
  // clients: client,
  pkce: {
    required: () => false, methods: ['S256']
  },
}
// console.log(configuration, "configuration")
export default
  configuration