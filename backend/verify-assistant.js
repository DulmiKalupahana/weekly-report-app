require('dotenv').config();
const { chatWithAssistant } = require('./controllers/assistantController');

(async () => {
  try {
    const req = {
      body: {
        message: 'Hello',
        conversationHistory: []
      },
      user: { role: 'manager' }
    };

    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        console.log(JSON.stringify(payload));
      }
    };

    await chatWithAssistant(req, res);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
