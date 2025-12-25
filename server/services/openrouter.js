const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const openRouterClient = axios.create({
    baseURL: OPENROUTER_URL,
    headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173', // change in prod
        'X-Title': 'TEAM_FORGE'
    }
});

const callOpenRouter = async ({ messages, model = 'openai/gpt-3.5-turbo' }) => {
    const response = await openRouterClient.post('', {
        model,
        messages
    });

    return response.data;
};

module.exports = { callOpenRouter };
