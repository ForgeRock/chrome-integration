# Chrome

## Setting up SAML



## Automatic provision of usernames to google

Users can be automatically provisioned from ForgeRock to Google using the Google directory api: https://developers.google.com/admin-sdk/directory/reference/rest/v1/users/insert. This can be done through a ForgeRock IDM on create script. This script will be triggered every time a user is created to also create the user in Google. To do so, here are the following steps:

1) Navigate to the ForgeRock Identity Management console
2) Navigate to Managed Objects -> alpha_user -> scripts
3) Under add script for managed events, select onCreate and click add script
4) Copy and paste the script from scripts/on-create.js and click save

## Notify Chrome OS about apssword changes

1) Navigate to the ForgeRock Identity Management console
2) Navigate to Managed Objects -> alpha_user -> scripts
3) Under add script for managed events, select passwordUpdated and click add script
4) Copy and paste the script from scripts/password-updated.js and click save
