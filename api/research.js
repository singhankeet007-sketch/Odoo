const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { history } = req.body;
    
    // Initialize Gemini using your Environment Variable
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    // Gemini expects history in a specific format
    // We take all previous messages except the very last one
    const chatHistory = history.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    // The last message in the history array is the current prompt
    const currentPrompt = history[history.length - 1].content;
    const result = await chat.sendMessage(currentPrompt);
    const response = await result.response;
    const text = response.text();

    // Return the response in the format the frontend expects
    return res.status(200).json({
      content: [{ type: 'text', text: text }]
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
