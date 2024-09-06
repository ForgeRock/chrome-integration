# Chrome

Chrome OS allows managed users to login to their accounts on a device level with their 3p IdP account. 

## Setting up SAML

In the ForgeRock tenant, set up a hosted IDP. Docs for setting up a hosted IDP can be found here [here](https://backstage.forgerock.com/docs/idcloud-am/latest/saml2-guide/saml2-providers-and-cots.html). 

Create the remote SP as well. Use the attached XML as a template, and update the entity ID and ACS URLs.
- Sample ACS URL: https://accounts.google.com/samlrp/{}/acs
- Sample entity ID: https://accounts.google.com/samlrp/{}

Retrieve the certificate to upload from: https://(ENVIRONMENT)/am/saml2/jsp/exportmetadata.jsp?entityid=(ENTITYID)&realm=/(REALM)

In the google admin tenant, go to security -> authentication, SSO with third party IDP. Enable it, and copy the SSO sign in URL from the ForgeRock hosted IPD as the sign in URL.

In the google admin tenant, upload the certificate from ForgeRock IDP. 

After setting up SAML, users can leverage authentication journeys in their flow. 


## Setting up a service account

A service account will need to be created and set up in google. Steps for that can be found here: https://support.google.com/a/answer/7378726?hl=en.

After a service account is created and a key is added, a json file will be downloaded containing information about the service account. This information will need to be added as ESVs in the ForgeRock environment: https://backstage.forgerock.com/docs/idcloud/latest/tenants/esvs.html. 

## Automatic provisioning of usernames to google

Users can be automatically provisioned from ForgeRock to Google using the Google directory api: https://developers.google.com/admin-sdk/directory/reference/rest/v1/users/insert. This can be done through a ForgeRock IDM on create script. This script will be triggered every time a user is created to also create the user in Google. To do so, here are the following steps:

1) Navigate to the ForgeRock Identity Management console
2) Navigate to Managed Objects -> alpha_user -> scripts
3) Under add script for managed events, select onCreate and click add script
4) Copy and paste the script from scripts/on-create.js and click save
```
function buildJwt(claims) {
  var privateBytes = java.util.Base64.getDecoder().decode(identityServer.getProperty("esv.x.privatekey"));

  /* Generate private key. */
  var ks = new java.security.spec.PKCS8EncodedKeySpec(privateBytes);
  var kf = java.security.KeyFactory.getInstance("RSA");
  var pvt = kf.generatePrivate(ks);

  var signingKey = new org.forgerock.secrets.keys.SigningKey(new org.forgerock.secrets.SecretBuilder()
    .secretKey(pvt)
    .expiresAt(java.time.Instant.MAX)
    .stableId(identityServer.getProperty("esv.x.stableid")));

  var jwtString = new org.forgerock.json.jose.builders.SignedJwtBuilderImpl(new org.forgerock.json.jose.jws.handlers.SecretRSASigningHandler(signingKey))
    .headers().alg(org.forgerock.json.jose.jws.JwsAlgorithm.RS256).done()
    .claims(new org.forgerock.json.jose.builders.JwtClaimsSetBuilder().claims(claims.asMap()).build()).build();
  var theParams = {
    'url': 'https://oauth2.googleapis.com/token',
    'method': 'POST',
    'headers': {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    'body': "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + jwtString
    
  }
  var access_token = null;
  try{
     var theResponse = openidm.action('external/rest', 'call', theParams);
     access_token = theResponse.access_token;
  } catch(e) {
    logger.error("Exception during REST call: ");
    logger.error(e);
  }
  
  
  
  
  try {
  	var theBody2 = {
      "name": {
        "familyName": object.sn,
        "givenName": object.givenName

      },
      "password": object.password,
      "primaryEmail": object.mail

    };
    
    

    var theParams2 = {
      'url': 'https://admin.googleapis.com/admin/directory/v1/users',
      'method': 'POST',
      'body': JSON.stringify(theBody2),
      'headers': {
        "Authorization": "Bearer " + access_token,
        "Content-Type": "application/json",
      }
    }
    
    
    

    var theResponse = openidm.action('external/rest', 'call', theParams2);
    
    
  } catch (e) {
    logger.error("-----onCreate Script an error occurred: " + e);
  }
  
  return jwtString;
}

function generateJwtToken() {
  try {
    var iat = new Date();
    var iatTime = iat.getTime();
    var expTime = iat.getTime() + (60 * 60 * 1000);

    var claims = new org.forgerock.json.JsonValue(java.util.Map.of(
      "iss", identityServer.getProperty("esv.x.iss"),
      "scope", "https://www.googleapis.com/auth/admin.directory.user",
      "aud", "https://oauth2.googleapis.com/token",
      "sub", identityServer.getProperty("esv.x.adminemail"),
      "exp", new java.util.Date(expTime),
      "iat", new java.util.Date(iatTime),
    ));

    return buildJwt(claims);
  } catch (e) {
    console.log("Failure generating JWT : " + e);
    throw e;
  }
}

try {
  var theJWT = generateJwtToken();
} catch (e) {
  console.log("Exception encountered");
  console.log("Exception: " + e);
  throw e;
}
```

   <img width="1301" alt="Screenshot 2023-06-20 at 9 27 38 AM" src="https://github.com/ForgeRock/chrome-integration/assets/94064355/826b3298-6de7-4cdf-97df-6e32d7a93a0a">


## Notify Chrome OS about password changes

1) Navigate to the ForgeRock Identity Management console
2) Navigate to Managed Objects -> alpha_user -> scripts
3) Under add script for managed events, select onUpdate and click add script
4) Copy and paste the script from scripts/updated-password.js and click save

```
function buildJwt(claims) {
  var privateBytes = java.util.Base64.getDecoder().decode(identityServer.getProperty("esv.x.privatekey"));

  /* Generate private key. */
  var ks = new java.security.spec.PKCS8EncodedKeySpec(privateBytes);
  var kf = java.security.KeyFactory.getInstance("RSA");
  var pvt = kf.generatePrivate(ks);

  var signingKey = new org.forgerock.secrets.keys.SigningKey(new org.forgerock.secrets.SecretBuilder()
    .secretKey(pvt)
    .expiresAt(java.time.Instant.MAX)
    .stableId(identityServer.getProperty("esv.x.stableid")));

  var jwtString = new org.forgerock.json.jose.builders.SignedJwtBuilderImpl(new org.forgerock.json.jose.jws.handlers.SecretRSASigningHandler(signingKey))
    .headers().alg(org.forgerock.json.jose.jws.JwsAlgorithm.RS256).done()
    .claims(new org.forgerock.json.jose.builders.JwtClaimsSetBuilder().claims(claims.asMap()).build()).build();
  var theParams = {
    'url': 'https://oauth2.googleapis.com/token',
    'method': 'POST',
    'headers': {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    'body': "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + jwtString
    
  }
  var access_token = null;
  try{
     var theResponse = openidm.action('external/rest', 'call', theParams);
     access_token = theResponse.access_token;
     logger.error("-----token Script theResponse-----  " + theResponse);
  } catch(e) {
    logger.error("Exception during REST access call: ");
    logger.error(e);
  }
  
  logger.error("ACCESS TOKEN" + access_token);
  
  
  
  try {
    
    var theBody3 = {
      "token_type": "SAML_PASSWORD"

    };
    
    

    var theParams3 = {
      'url': 'https://chromedevicetoken.googleapis.com/v1/users:invalidateToken',
      'method': 'POST',
      'body': JSON.stringify(theBody3),
      'headers': {
        "Authorization": "Bearer " + access_token,
        "Content-Type": "application/json",
      }
    }
    if(object.password != null && (typeof oldSource === undefined || openidm.decrypt(object.password) != oldSource.password)) {
    	openidm.action('external/rest', 'call', theParams3);
    }
    
    
  } catch (e) {
    logger.error("-----onCreate Script an error occurred: " + e);
  }
  
  return jwtString;
}

function generateJwtToken() {
  try {
    var iat = new Date();
    var iatTime = iat.getTime();
    var expTime = iat.getTime() + (60 * 60 * 1000);

    var claims = new org.forgerock.json.JsonValue(java.util.Map.of(
      "iss", identityServer.getProperty("esv.x.iss"),
      "scope", "https://www.googleapis.com/auth/admin.directory.user",
      "aud", "https://oauth2.googleapis.com/token",
      "sub", identityServer.getProperty("esv.x.adminemail"),
      "exp", new java.util.Date(expTime),
      "iat", new java.util.Date(iatTime),
    ));

    return buildJwt(claims);
  } catch (e) {
    console.log("Failure generating JWT : " + e);
    throw e;
  }
}

try {
  var theJWT = generateJwtToken();
} catch (e) {
  console.log("Exception: " + e);
  throw e;
}
```
