# Chrome

Chrome OS allows managed users to login to their accounts on a device level with their 3p IdP account. 

## Setting up SAML

In the ForgeRock tenant, set up a remote SP with Google and hosted IDP. Docs for setting up a hosted IDP and remote SP can be found [here](https://backstage.forgerock.com/docs/idcloud-am/latest/saml2-guide/saml2-providers-and-cots.html). 

Once it is created, get the IDP initiated url. It should look some like this: https://<am-url>/idpssoinit?metaAlias=<idp meta alias>&spEntityID=<sp entity id>

In the google admin tenant, go to security -> authentication, SSO with third party IDP. Enable it, and copy the IDP initiated URL as the sign in URL.

After setting up SAML, users can leverate authentication journeys in their flow. 


## Setting up a service account

A service account will need to be created and set up in google. Steps for that can be found here: https://support.google.com/a/answer/7378726?hl=en.

After a service account is created and a key is added, a json file will be downloaded containing information about the service account. This information will need to be added as ESVs in the ForgeRock environment: https://backstage.forgerock.com/docs/idcloud/latest/tenants/esvs.html. 

## Automatic provisioning of usernames to google

Users can be automatically provisioned from ForgeRock to Google using the Google directory api: https://developers.google.com/admin-sdk/directory/reference/rest/v1/users/insert. This can be done through a ForgeRock IDM on create script. This script will be triggered every time a user is created to also create the user in Google. To do so, here are the following steps:

1) Navigate to the ForgeRock Identity Management console
2) Navigate to Managed Objects -> alpha_user -> scripts
3) Under add script for managed events, select onCreate and click add script
4) Copy and paste the script from scripts/on-create.js and click save

   <img width="1301" alt="Screenshot 2023-06-20 at 9 27 38 AM" src="https://github.com/ForgeRock/chrome-integration/assets/94064355/826b3298-6de7-4cdf-97df-6e32d7a93a0a">


## Notify Chrome OS about password changes

1) Navigate to the ForgeRock Identity Management console
2) Navigate to Managed Objects -> alpha_user -> scripts
3) Under add script for managed events, select onUpdate and click add script
4) Copy and paste the script from scripts/updated-password.js and click save
