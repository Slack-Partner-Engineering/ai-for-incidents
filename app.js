const { App, LogLevel } = require('@slack/bolt');
const SummarizeIncident = require('./functions/summarize_incident');
const GetThreadHistory = require('./functions/get_thread');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

/** Initialization */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.ERROR,
  installerOptions: {
    port: PORT,
  },
});

/** Summarize Incident Listener */
app.function('summarize_incident', SummarizeIncident);

/** Get Thread History Listener */
app.function('get_thread', GetThreadHistory);

/** App Mention Listener */
app.event('app_mention', async ({ event }) => {
  try {
    console.log(`Received mention in ${event.channel}`);
  } catch (error) {
    console.error(error);
  }
});

/** Start Bolt App */
(async () => {
  try {
    await app.start(PORT);
    console.log(`⚡️ AI for Incidents app is running on port ${PORT} ⚡️`);
  } catch (error) {
    console.error('Unable to start App', error);
  }
})();
