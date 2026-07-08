import API from './axios';

export const sendChatMessage = async (message, conversationHistory) => {
    const res = await API.post('/assistant/chat', { message, conversationHistory });
    return res.data;
};

export const getTeamSummary = async () => {
    const res = await API.get('/assistant/summary');
    return res.data;
};
