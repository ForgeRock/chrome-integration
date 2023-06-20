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
