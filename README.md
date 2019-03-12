# Nemeslack

[![CircleCI](https://circleci.com/gh/wesbaker/nemeslack.svg?style=svg)](https://circleci.com/gh/wesbaker/nemeslack)
[![Code Climate](https://codeclimate.com/github/wesbaker/nemeslack/badges/gpa.svg)](https://codeclimate.com/github/wesbaker/nemeslack)

A simple way to send [Nemestats][nemestats] plays to Slack:

![Example Nemeslack](example.png)

## Installation

At the moment you'll need your own instance for your Slack. I run mine on Heroku (for free) and it works really well.

1. Create [a new Slack app](https://api.slack.com/apps?new_app=1)
2. Enable Incoming Webhooks
3. Create a Webhook URL for the desired channel and team
4. Create a new app over at [Heroku](https://dashboard.heroku.com/new-app?org=personal-apps)
5. [Set two environment variables on your app at Heroku](https://devcenter.heroku.com/articles/config-vars#setting-up-config-vars-for-a-deployed-application):
    - `GAMING_GROUP_ID` is the ID in the URL of your gaming group at [Nemestats][nemestats] (e.g. with a url of `https://nemestats.com/GamingGroup/Details/13468` your ID is `13468`)
    - `SLACK_WEBHOOK_URL` is the Webhook URL created in step 3
6. Clone this repository and then [deploy it to Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app)
7. Schedule a run of the app so the games get posted
    - Open the scheduler: `heroku addons:open scheduler`
    - Add a new job specifying a daily run at the time you want running `npm run post`

[nemestats]: https://nemestats.com
