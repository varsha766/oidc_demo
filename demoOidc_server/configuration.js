let client;
const configuration = {
  clientBasedCORS() {
    return true
  },
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
  clients: client,
  pkce: {
    required: () => false, methods: ['S256']
  },
}
export default
  configuration