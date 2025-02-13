require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// Erweiterte CSP-Header
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self' https://api.openai.com; connect-src 'self' https://api.openai.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    );
    next();
});

app.use(express.json());
app.use(express.static(__dirname + '/../public'));

app.post('/api/chat', async (req, res) => {
    console.log('Chat request received');
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API Key fehlt');
        }

        console.log('Sending request to OpenAI...'); // Debug log

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Du bist ein KI-Nachhilfelehrer. Antworte klar, präzise und hilfreich."
                    },
                    ...req.body.messages
                ]
            })
        });
        
        const data = await response.json();
        console.log('OpenAI response:', data);
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        res.json(data);
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add health check endpoint
app.get('/health', (req, res) => {
    console.log('Health check requested'); // Debug log
    res.json({ 
        status: 'ok', 
        apiKey: !!process.env.OPENAI_API_KEY,
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
    console.log('API Key vorhanden:', !!process.env.OPENAI_API_KEY);
});