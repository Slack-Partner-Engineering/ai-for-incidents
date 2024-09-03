const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI(
  { apiKey: process.env.OPENAI_API_KEY },
);

// Main function
const SummarizeIncident = async ({ inputs, complete, fail }) => {
  try {
    const { context } = inputs;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant tasked with analyzing a conversation that took place in Slack. Your answers must be detailed and thorough. Include qualitative and quantitative descriptions where possible. Always include time zone label when reporting a time.' },
        { role: 'system', content: 'The Slack messages describe a single incident or outage that occurred for the software service these individuals manage.' },
        { role: 'system', content: 'The user will provide the Slack message history. It is a JSON object with a messages array containing a timestamp, author\'s name, and the text for each individual message.' },
        { role: 'system', content: 'Your response will always a single JSON object. The following top-level properties must exist with a string provided as the value of each: summary, cause, impact, resolution, duration, timeline.' },
        { role: 'system', content: 'Each of the provided property names are self-explanatory as to what information should be included as the value. Don\'t just provided the requested information in a concise sentence. Your responses should be as detailed as possible. The timeline property should include a timestamp and description for each major event that took place. You must use the \n line feed character after each timeline event so that each event is on its own line for better readability.' },
        { role: 'user', content: context },
      ],
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
    });

    const incident_json = JSON.parse(completion.choices[0].message.content);
    const { summary, cause, impact, resolution, duration, timeline } = incident_json;

    await complete({ outputs: { summary, cause, impact, resolution, duration, timeline } });
  } catch (error) {
    console.error(error);
    fail({ error: `Failed to handle a function request: ${error}` });
  }
};

module.exports = SummarizeIncident;
