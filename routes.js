const JiraClient = require('jira-connector');
const validateSignature = require('webhook-validate');
const util = require('util');
const Task = require('imdone-core/lib/task');
const _ = require('lodash');

const config = {
    host: process.env.JIRA_HOST,
    basic_auth: {
        username: process.env.JIRA_USER,
        password: process.env.JIRA_PASSWORD
    }
};
const jira = new JiraClient(config);

const issueText = function(taskNow) {
  return `${taskNow.getText({stripMeta: true, stripDates: true})}`;  
};

const getIssueKey = function(task) {
  return task.meta.ji[0];
};

const createIssue = function(taskNow, cb) {
  jira.issue.createIssue({
    fields: {
      project: {
        key: process.env.JIRA_PROJECT_KEY
      },
      summary: issueText(taskNow),
      issuetype: {
        name: process.env.JIRA_ISSUE_TYPE_NAME
      },
      description: `Created for ${taskNow.list} comment at ${taskNow.source.path}:${taskNow.line} by [imdone.io|https://imdone.io]`
    }
  }, (err, issue) => {
    if (err) return cb(err);
    taskNow.meta.ji = [issue.key];
    taskNow.updateTodoTxt();
    cb();  
  });       
};

const closeIssue = function(taskNow, cb) {
  var issueKey = getIssueKey(taskNow);
  jira.issue.getTransitions({issueKey: issueKey}, (err, data) => {
    if (err) return cb(err)
    var transitionId = _.find(data.transitions, {name:process.env.JIRA_CLOSED_TRANSITION_NAME}).id;
    jira.issue.transitionIssue({issueKey: issueKey, transition: transitionId}, (err, issue) => {
      console.log(issue);
      cb(err, issue);
    });
  });  
};

const routes = function(app) {

  app.get("/", function(req, res) {
    res.send("<h1>imdone.io JIRA webhook</h1><p>Oh, hi! There's not much to see here - view the code instead</p><footer id=\"gWidget\"></footer><script src=\"https://widget.glitch.me/widget.min.js\"></script>");
    console.log("Received GET");
  });
  
  app.post('/', function(req, res) {
    console.log('received POST');
    // TODO: Figure out how to gain access to the glitch api and track TODOs in glitch
    validateSignature(req, function(valid) {
      if (!valid) return res.status(403);
      var taskDeleted = req.body.taskNow.deleted;
      var taskNow = new Task(req.body.taskNow);
       //check for jira id
      if (taskNow.meta.ji) {
        if (taskDeleted) {
          closeIssue(taskNow, (err, issue) => {
            console.log(err);
            res.status(200).json(taskNow);  
          });
        } else {
          res.status(200).json(taskNow); 
        }
      } else {
        if (taskDeleted) return res.status(200).json(taskNow); 
        createIssue(taskNow, (err) => {
          console.log(err);
          res.status(200).json(taskNow);
        });
      }

    });

  });

};
 
module.exports = routes;