# Chrome

Chrome OS allows managed users to login to their accounts on a device level with their 3p IdP account. 

## Setting up SAML


## Setting up a service account

A service account will need to be created and set up in google. Steps for that can be found here: https://support.google.com/a/answer/7378726?hl=en.

After a service account is created and a key is added, a json file will be downloaded containing information about the service account. This information will need to be added as ESVs in the ForgeRock environment: https://backstage.forgerock.com/docs/idcloud/latest/tenants/esvs.html. 

## Automatic provision of usernames to google

Users can be automatically provisioned from ForgeRock to Google using the Google directory api: https://developers.google.com/admin-sdk/directory/reference/rest/v1/users/insert. This can be done through a ForgeRock IDM on create script. This script will be triggered every time a user is created to also create the user in Google. To do so, here are the following steps:

1) Navigate to the ForgeRock Identity Management console
2) Navigate to Managed Objects -> alpha_user -> scripts
3) Under add script for managed events, select onCreate and click add script
4) Copy and paste the script from scripts/on-create.js and click save

## Notify Chrome OS about password changes

1) Navigate to the ForgeRock Identity Management console
2) Navigate to Managed Objects -> alpha_user -> scripts
3) Under add script for managed events, select onUpdate and click add script
4) Copy and paste the script from scripts/updated-password.js and click save
