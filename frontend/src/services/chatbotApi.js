import apiClient from './apiClient'

// history: array of { role: 'user' | 'bot' | 'assistant', content: string }
export const sendChatMessage = (message, history = []) =>
  apiClient.post('/chatbot/message', { message, history })

export default sendChatMessage
