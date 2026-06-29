import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Server-side secure API for Logistical AI Copilot
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const contents: any[] = [
        {
          role: 'user',
          parts: [{ text: "You are the expert lead AI Logistical Assistant for Tushar Enterprises. You are highly intelligent, practical, and possess deep supply chain knowledge (safety stocks, FIFO, FIFO buffers, carrying costs, spatial zone planning, and bulk freight). Please keep your answers professional, direct, concise, and focused on operational advice." }]
        }
      ];

      // Append past session chat history if present
      if (history && Array.isArray(history)) {
        history.forEach((h: any) => {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
          });
        });
      }

      // Append current user message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error('Gemini Call Failure:', err);
      res.status(500).json({ error: err.message || 'Error compiling Gemini response' });
    }
  });

  if (!isProd) {
    // DEV MODE: Mount Vite dev server middleware
    console.log("Configuring development environment via Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // PROD MODE: Serve built static bundles
    console.log("Serving production build assets...");
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Enterprise Supply Chain Node.js Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error("Critical: Failed to boot central backend server.", err);
  process.exit(1);
});
