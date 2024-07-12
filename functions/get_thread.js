// Cache of users to minimize users.info requests
const users = {};

// Helper function to convert timestamp to ISO string
function timestampToISO(ts) {
  // Remove 6 digit counter from message ts
  const unixTime = parseInt(ts.split('.')[0], 10);
  // Convert unix time (in ms) to ISO-8601
  return new Date(unixTime * 1000).toISOString();
}

// Helper function to get author name from user ID
// Get user info if we have cached the user's id and name yet
async function getUserFromCacheOrAPI(client, user_id) {
  // Check cache for user's name
  if (user_id in users) {
    // Return the user's name
    return users[user_id];
  }

  // Get user info, save and return their full name
  const { user: { real_name } } = await client.users.info({ user: user_id });
  // Add ID and name to the cache
  users[user_id] = real_name;
  // Return the user's name
  return real_name;
}

// Helper function to return bot username or fetch user name
async function getUserName(client, reply) {
  // Check if the message was broadcasted to channel
  if (reply.subtype === 'thread_broadcast') {
    if (reply.root.subtype === 'bot_message') {
      return `${reply.root.username} (app)`;
    }
    return await getUserFromCacheOrAPI(client, reply.root.user);
  }

  // Regular threaded message
  if (reply.subtype === 'bot_message') {
    return `${reply.username} (app)`;
  }
  return await getUserFromCacheOrAPI(client, reply.user);
}

// Main function
const GetThreadHistory = async ({ client, inputs, complete, fail }) => {
  try {
    // Get replies from the input thread
    const { ok, error, messages } = await client.conversations.replies({
      channel: inputs.thread_context.channel_id,
      ts: inputs.thread_context.message_ts,
      limit: 1000, // TODO: pagination
    });

    // There was an error fetching the threaded replies
    if (!ok) {
      fail({ error });
    }

    // Object of messages being exported
    const history = {};

    // For each reply, pull out message text, author's name, and datetime
    history.messages = await Promise.all(messages.map(async (reply) => {
      // Use top-level text property, ignore rich text
      const message = reply.text;

      // Check if a bot sent the message or a real user
      const author = await getUserName(client, reply);

      // Convert Slack message timestamp to ISO string
      const datetime = timestampToISO(reply.ts);

      // Add properties to messages array
      return { author, message, datetime };
    }));

    // Output parameter expects a JSON string
    const replies = JSON.stringify(history);

    // Complete function
    await complete({ outputs: { replies } });
  } catch (error) {
    console.error(error);
    fail({ error: `Failed to handle a function request: ${error}` });
  }
};

module.exports = GetThreadHistory;
