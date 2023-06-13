# Chrome


## Automatic provision of usernames to google

Users can be automatically provisioned from ForgeRock to Google. This can be done through a ForgeRock IDM on create script. To do so, here are the following steps:

1) Navigate to the ForgeRock Identity Management console
2) Navigate to Managed Objects -> alpha_user -> scripts
3) Under add script for managed events, select onCreate and click add script
4) Copy and paste the script from scripts/on-create.js and click save
