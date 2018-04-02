Jira webhook for imdone.io
----
This is an [imdone.io](https://imdone.io) webhook that creates and updates Jira issues from TODO comments

To use it, remix [this project](https://imdone-webhook-jira.glitch.me) and add the following environment variables in .env

```sh
# Your imdone webhook secret
SECRET=""
# The jira instance host you want to create issues on (Leave off the protocol e.g. imdone.atlassian.net)
JIRA_HOST="imdone.atlassian.net"
# Your Jira username, not your email
JIRA_USER="admin"
# Your Jira password
JIRA_PASSWORD=""
# The Jira project key Issues should go to (Also the issue key prefix)
JIRA_PROJECT_KEY="IM"
# What issue type should we use when creating new issues
# See Your issue types at (https://[your.jira.host]/rest/api/2/issuetype)
JIRA_ISSUE_TYPE_NAME="Task"
# Name of the transition to use for TODOs that are deleted
JIRA_CLOSED_TRANSITION_NAME="Done"
```

Then copy the base url of your glitch app. (e.g. https://imdone-webhook-jira.glitch.me/)

Create a webhook on [imdone.io](https://imdone.io) and paste it in.