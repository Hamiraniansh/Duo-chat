# ChatSphere AI Assistant - Developer Guide

Complete guide for integrating and extending the AI Assistant with real LLM services.

---

## Architecture Overview

### Current System (v1.0)

```
Frontend (UI)
    ↓
JavaScript Logic (script.js)
    ↓
HTTP POST Request
    ↓
Backend API (/api/ai/chat)
    ↓
Keyword Matching
    ↓
Pre-configured Responses
    ↓
JSON Response
    ↓
Frontend Display
```

### With Real AI (Planned)

```
Frontend (UI)
    ↓
JavaScript Logic
    ↓
HTTP POST Request
    ↓
Backend API (/api/ai/chat)
    ↓
OpenAI/Claude/etc API Call
    ↓
Process Response
    ↓
JSON Response to Frontend
```

---

## Current Implementation

### API Endpoint

**POST** `/api/ai/chat`

**Request Body:**
```json
{
  "message": "user message here",
  "history": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ]
}
```

**Response:**
```json
{
  "reply": "AI response text",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Backend Implementation (server.js)

```javascript
app.post('/api/ai/chat', (req, res) => {
    const { message, history } = req.body;
    
    // Process message
    const aiReply = processAIMessage(message.toLowerCase(), history);
    
    res.json({
        reply: aiReply,
        timestamp: new Date()
    });
});

function processAIMessage(message, history) {
    // Keyword matching logic
    if (message.includes('chat')) {
        return "...response...";
    }
    // ... more conditions
}
```

---

## Integration with OpenAI

### Step 1: Install Dependencies

```bash
npm install openai dotenv
```

### Step 2: Add Environment Variables

In `.env`:
```
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
AI_PROVIDER=openai
```

### Step 3: Update Backend Code

Replace `processAIMessage` with OpenAI call:

```javascript
const { OpenAI } = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function processAIMessage(message, history) {
    try {
        const systemPrompt = `You are ChatSphere AI, a helpful assistant for a chat application. 
You help users with:
- Chatting tips and advice
- Feature explanations
- Troubleshooting
- Developer contact information

Be friendly, concise, and helpful. Focus on ChatSphere features and user support.`;

        // Format conversation history for OpenAI
        const messages = history.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));

        // Add current message
        messages.push({
            role: 'user',
            content: message
        });

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 500,
            top_p: 0.9
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI error:', error);
        return "I'm experiencing technical difficulties. Please try again or contact the developer.";
    }
}

// Update the endpoint to be async
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        const aiReply = await processAIMessage(message, history || []);

        res.json({
            reply: aiReply,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('AI Chat error:', error);
        res.status(500).json({ error: 'Server error in AI processing' });
    }
});
```

### Step 4: Create OpenAI Account

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create account
3. Generate API key
4. Add to `.env` file
5. Start with free trial credits

---

## Integration with Claude (Anthropic)

### Step 1: Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### Step 2: Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
AI_PROVIDER=claude
```

### Step 3: Update Backend

```javascript
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function processAIMessage(message, history) {
    try {
        const systemPrompt = `You are ChatSphere AI, a helpful assistant. Help with ChatSphere features, chatting tips, troubleshooting, and developer contact.`;

        // Format history for Claude
        const messages = history.map(msg => ({
            role: msg.role || 'user',
            content: msg.content
        }));

        messages.push({
            role: 'user',
            content: message
        });

        const response = await client.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 500,
            system: systemPrompt,
            messages: messages
        });

        return response.content[0].text;
    } catch (error) {
        console.error('Claude error:', error);
        return "I'm experiencing technical difficulties. Please try again later.";
    }
}
```

---

## Integration with Google Gemini

### Step 1: Install SDK

```bash
npm install @google/generative-ai
```

### Step 2: Environment Setup

```
GOOGLE_API_KEY=your-gemini-api-key
AI_PROVIDER=gemini
```

### Step 3: Backend Implementation

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function processAIMessage(message, history) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            systemInstruction: "You are ChatSphere AI assistant. Help users with features, tips, and support."
        });

        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }))
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (error) {
        console.error('Gemini error:', error);
        return "Technical difficulties. Try again later.";
    }
}
```

---

## Hybrid Approach (Fallback)

Combine real AI with keyword matching as fallback:

```javascript
async function getAIResponse(message, history) {
    try {
        // Try real AI first
        if (process.env.AI_PROVIDER === 'openai') {
            return await processAIMessageOpenAI(message, history);
        } else if (process.env.AI_PROVIDER === 'claude') {
            return await processAIMessageClaude(message, history);
        }
    } catch (error) {
        console.warn('AI provider failed, using fallback:', error.message);
    }
    
    // Fallback to keyword matching
    return processAIMessageFallback(message);
}

function processAIMessageFallback(message) {
    // Use existing keyword-based responses
    const msg = message.toLowerCase();
    
    if (msg.includes('feature')) {
        return "Here are ChatSphere features...";
    }
    // ... more fallbacks
}
```

---

## System Prompts

### For ChatSphere

```
You are ChatSphere AI, a helpful assistant for a real-time chat application.

Your role:
- Help users with chatting advice and best practices
- Explain ChatSphere features (profiles, Couple Mode, themes, reactions, etc.)
- Provide troubleshooting guidance
- Give developer contact information
- Be friendly, concise, and supportive

Application features you know about:
- Real-time global chat with Socket.IO
- User profiles with customization
- Couple Mode with Love Meter and streaks
- Multiple themes and color customization
- Reactions and stickers
- Secret messages and scheduled messages
- Dark theme support
- OAuth authentication (Google, Facebook, GitHub, Instagram)

Guidelines:
- Keep responses under 500 characters when possible
- Use emojis appropriately
- Format lists with bullet points
- Always be helpful and encouraging
- Direct users to contact developer for bugs or advanced issues
- Focus on user experience and satisfaction

Developer contact info:
- Email: developer@chatsphere.com
- GitHub: github.com/developer
- Twitter: @chatsphere_dev
```

---

## Error Handling

### Implement Robust Error Handling

```javascript
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // Input validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ 
                error: 'Invalid message format' 
            });
        }

        if (message.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Message cannot be empty' 
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({ 
                error: 'Message too long (max 1000 chars)' 
            });
        }

        // Get AI response with timeout
        const aiReply = await Promise.race([
            getAIResponse(message, history),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('AI timeout')), 30000)
            )
        ]);

        res.json({
            reply: aiReply,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('AI endpoint error:', error);

        // Return appropriate error message
        if (error.message.includes('timeout')) {
            return res.status(504).json({ 
                error: 'AI response took too long. Try again.' 
            });
        }

        if (error.status === 429) {
            return res.status(429).json({ 
                error: 'Too many requests. Please wait.' 
            });
        }

        res.status(500).json({ 
            error: 'Server error. Please contact support.' 
        });
    }
});
```

---

## Rate Limiting

Prevent abuse with rate limiting:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many AI requests. Please wait a moment.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.post('/api/ai/chat', aiLimiter, async (req, res) => {
    // ... handler code
});
```

---

## Conversation Context

### Managing Long Conversations

```javascript
// Limit history to last 10 exchanges to manage tokens
function trimHistory(history, maxMessages = 10) {
    if (history.length <= maxMessages) {
        return history;
    }
    return history.slice(-maxMessages);
}

// Usage
const trimmedHistory = trimHistory(history);
const response = await getAIResponse(message, trimmedHistory);
```

---

## Testing

### Unit Tests

```javascript
// test/ai.test.js
const request = require('supertest');
const app = require('../server');

describe('AI Assistant API', () => {
    test('POST /api/ai/chat - valid message', async () => {
        const response = await request(app)
            .post('/api/ai/chat')
            .send({ message: 'What are features?' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('reply');
        expect(response.body.reply).toBeTruthy();
    });

    test('POST /api/ai/chat - empty message', async () => {
        const response = await request(app)
            .post('/api/ai/chat')
            .send({ message: '' });

        expect(response.status).toBe(400);
    });

    test('GET /api/ai/health - health check', async () => {
        const response = await request(app)
            .get('/api/ai/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('AI Assistant is running');
    });
});
```

---

## Deployment Checklist

- [ ] Choose AI provider (OpenAI, Claude, Gemini)
- [ ] Set up API keys securely
- [ ] Add to `.env` file (NOT version control)
- [ ] Configure `.gitignore` for `.env`
- [ ] Add rate limiting
- [ ] Add error handling
- [ ] Set up monitoring
- [ ] Add request logging
- [ ] Test thoroughly
- [ ] Deploy to production
- [ ] Monitor API usage and costs
- [ ] Set up alerts for errors

---

## Production Recommendations

### Security

- ✅ Never commit API keys
- ✅ Use environment variables
- ✅ Implement rate limiting
- ✅ Validate and sanitize inputs
- ✅ Log errors securely
- ✅ Use HTTPS only
- ✅ Monitor for abuse

### Performance

- ✅ Implement response caching
- ✅ Add request queuing
- ✅ Set request timeouts
- ✅ Monitor response times
- ✅ Use CDN for static assets
- ✅ Compress responses

### Monitoring

- ✅ Log all requests
- ✅ Track error rates
- ✅ Monitor API costs
- ✅ Alert on failures
- ✅ Track response times
- ✅ Monitor user satisfaction

---

## Costs

### Estimated Monthly Costs (100K users)

| Provider | Per 1K Requests | Est. Cost/Month |
|----------|-----------------|-----------------|
| OpenAI GPT-4 | $0.06 | $600 |
| Claude 3 | $0.01 | $100 |
| Gemini | $0.001 | $10 |

**Note:** Prices vary based on usage. Start small and scale.

---

## Support

For issues with AI integration:
1. Check provider documentation
2. Verify API keys and permissions
3. Check error logs
4. Test with Postman/cURL
5. Contact provider support

---

## Future Enhancements

- [ ] Custom training on ChatSphere docs
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Real-time learning
- [ ] Sentiment analysis
- [ ] User preference learning
- [ ] Integration with user actions
- [ ] Conversation analytics

---

**Ready to supercharge ChatSphere AI! 🚀**
