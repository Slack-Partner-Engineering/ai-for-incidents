# ChatGPT for Incidents

*This app contains a feature that is in Beta! You must use the npm package `"@slack/bolt": "3.17.1-customFunctionBeta.0"`*

This app is built using [Bolt for JavaScript](https://slack.dev/bolt-js) and includes two [custom functions for Bolt](https://api.slack.com/automation/functions/custom-bolt). These functions are meant to be deployed on your own infrastructure. This is different from the previously released [workflow apps](https://api.slack.com/automation/functions/custom) built with the Deno Slack SDK and are hosted on Slack's infrastructure.

The functions are modular! Once the app is installed, any builder with access to the functions can use them in their own workflows and mix-and-match as needed for their use case.

🧵 **Get all thread replies**
Fetch all replies from the referenced Slack thread. The timestamp, author, & text of each message are extracted and output via the `replies` property as a stringified array to be used in subsequent steps.

🤖 **Summarize incident with ChatGPT**
This step expects an array of Slack messages describing an incident and includes several hardcoded system prompts that instruct ChatGPT on how to interpret the inputs and what outputs are expected. ChatGPT returns a JSON object that is parsed and assigned to individual outputs: `summary`, `cause`, `impact`, `resolution`, `duration`, & `timeline`. Each can be used as individual variables in subsequent workflow steps.

## Setup

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy)

Before getting started, first make sure you have a [development workspace](https://api.slack.com/developer-program) where you have permission to install apps. **Please note that the features in this project require that the workspace be part of [a Slack paid plan](https://slack.com/pricing).**

1. Clone this repository to your local development environment and run `npm install`.
2. Create a new app from api.slack.com/apps using the included `manifest.json` file.
3. Ensure your app has opted into the [Org-wide apps](https://api.slack.com/enterprise/org-wide-apps) feature
4. Install the app. If you are building in an Enterprise Grid, you [must install at the org-level](https://api.slack.com/automation/functions/custom-bolt#org-wide-apps). If you are building on a standalone workspace, this does not apply.
5. Create a copy of `.env.sample`, rename to `.env` and provide the required values: an OpenAI API key and two tokens from your newly created app.
6. Run your app locally or deploy to a hosting platform of your choice such as Heroku.
7. Open [Workflow Builder](https://slack.com/help/articles/17542172840595-Build-a-workflow--Create-a-workflow-in-Slack) and create a new workflow that includes one or both of the provided functions. They will appear in the **Custom** section of the steps list for all users that have been [granted access](https://api.slack.com/automation/functions/custom#access).

## Using Functions in Workflow Builder
With your server running, your function is now ready for use in [Workflow Builder](https://slack.com/help/articles/17542172840595-Build-a-workflow--Create-a-workflow-in-Slack)! They will appear in the **Custom** section of the steps list for all users that have been [granted access](https://api.slack.com/automation/functions/custom#access).

![Example workflow](./assets/example-workflow.png)

## Implementation details
The `get_thread` function outputs a `replies` JSON string. Here is an example of what you can expect this function to output for a Slack thread with a parent message and two nested replies:

```json
{
  "messages": [    
    {
      "author": "Adam",
      "message": "Our payments system stopped working",
      "datetime": "2024-04-11T22:59:01.000Z"
    },
    {
      "author": "Adam",
      "message": "10 customers have contacted our support team",
      "datetime": "2024-04-11T22:59:31.000Z"
    },
    {
      "author": "Jennifer",
      "message": "Not sure what is wrong, checking logs",
      "datetime": "2024-04-11T22:59:55.000Z"
    }
  ]
}
```

## Project Structure

### `.slack/`

Contains `apps.dev.json` and `config.json`, which include installation details for your project.

### `app.js`

`app.js` is the entry point for the application and is the file you'll run to start the server. This project aims to keep this file as thin as possible, primarily using it as a way to route inbound requests.

### `manifest.json`

`manifest.json` is a configuration for Slack apps. With a manifest, you can create an app with a pre-defined configuration, or adjust the configuration of an existing app.

### `slack.json`

Used by the Slack CLI to interact with the project's SDK dependencies. It contains
script hooks that are executed by the CLI and implemented by `@slack/cli-hooks`.

## Linting
Run ESLint for code formatting and linting:

```zsh
$ npm run lint
```
