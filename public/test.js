I have generated twitter access token using api  https://api.twitter.com/2/oauth2/token and got the response as ```

    {
        "token_type": "bearer",
        "expires_in": 7200,
        "access_token": "TrwasM3lxTnp***********JmRGJYRHZERS1QZ3NRMm5**************************",
        "scope": "follows.read like.read users.read tweet.read follows.write"
    }
```

when i tried calling twitter api  as below
```
const tweetId = 'some id'
const response = await fetch(
    `https://api.twitter.com/2/tweets/${tweetId}/liking_users`, {
    headers: {
        Authorization: `Bearer ${socialAccessToken}`
    }
}
);
```
i am getting 
```

{
    client_id: '27152910',
    detail: 'When authenticating requests to the Twitter API v2 endpoints, you must use keys and tokens from a Twitter developer App that is attached to a Project. You can create a project via the developer portal.',
    registration_url: 'https://developer.twitter.com/en/docs/projects/overview',
    title: 'Client Forbidden',
    required_enrollment: 'Appropriate Level of API Access',
    reason: 'client-not-enrolled',
    type: 'https://api.twitter.com/2/problems/client-forbidden'
} ```
I have created a project on twitter developer portal and used its clientId to generate code and then excahngaed the code to access_token and passed that access_token in header of above api.

Also tried using Twit package to get liking user list as 
``` const T = await this.twitterClient.get(`tweets/${tweetId}/liking_users`, (err, data, resp) => {
    if (err) {
        console.log(err)
    } else {
        console.log(resp)
        console.log(data)
    }
})```
not able to get any log value.My code reaching to else but there after it say nothing.

**Note**:-  With above socialAccessToken i am able to gt user deatails.

Thanks in advance
