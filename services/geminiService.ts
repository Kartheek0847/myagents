
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { NeuralNode } from "../types";
import { SYSTEM_INSTRUCTION, VISION_SCHEMA, COMMERCE_SCHEMA, BIO_SYNC_SCHEMA, EVOLUTION_SCHEMA, TELEMETRY_SCHEMA } from "../constants";

export interface PromptPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

// Function Declarations for Agent Tools
const TOOLS: FunctionDeclaration[] = [
  {
    name: 'send_email_draft',
    parameters: {
      type: Type.OBJECT,
      description: 'Prepares a B2B email draft for internal review.',
      properties: {
        to: { type: Type.STRING },
        subject: { type: Type.STRING },
        body: { type: Type.STRING }
      },
      required: ['to', 'subject', 'body']
    }
  },
  {
    name: 'schedule_analysis_sync',
    parameters: {
      type: Type.OBJECT,
      description: 'Schedules a synchronization meeting for data analysis.',
      properties: {
        topic: { type: Type.STRING },
        priority: { type: Type.STRING, enum: ['high', 'normal', 'low'] },
        timestamp: { type: Type.STRING }
      },
      required: ['topic', 'timestamp']
    }
  }
];

export async function processPrompt(
  prompt: string, 
  history: { role: 'user' | 'model', parts: PromptPart[] }[],
  imagePart?: { mimeType: string; data: string },
  forceJsonNode?: NeuralNode,
  enableGrounding: boolean = true
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const parts: PromptPart[] = [{ text: prompt }];
    if (imagePart) {
      parts.push({ inlineData: imagePart });
    }

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topP: 0.95,
      thinkingConfig: { thinkingBudget: 2000 },
    };

    if (enableGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    if (!forceJsonNode) {
      if (!config.tools) config.tools = [];
      config.tools.push({ functionDeclarations: TOOLS });
    }

    if (forceJsonNode === NeuralNode.VISION) {
      config.responseMimeType = "application/json";
      config.responseSchema = VISION_SCHEMA;
    } else if (forceJsonNode === NeuralNode.COMMERCE) {
      config.responseMimeType = "application/json";
      config.responseSchema = COMMERCE_SCHEMA;
    } else if (forceJsonNode === NeuralNode.BIO_SYNC) {
      config.responseMimeType = "application/json";
      config.responseSchema = BIO_SYNC_SCHEMA;
    } else if (forceJsonNode === NeuralNode.EVOLUTION) {
      config.responseMimeType = "application/json";
      config.responseSchema = EVOLUTION_SCHEMA;
    } else if (forceJsonNode === NeuralNode.TELEMETRY) {
      config.responseMimeType = "application/json";
      config.responseSchema = TELEMETRY_SCHEMA;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts }
      ],
      config,
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter(Boolean) || [];

    return {
      text: response.text || "",
      sources,
      toolCalls: response.functionCalls,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateNeuralAsset(prompt: string, type: 'image' | 'video') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (type === 'image') {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Futuristic enterprise infographic: ${prompt}`,
      config: { numberOfImages: 1, aspectRatio: '16:9' }
    });
    return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
  } else {
    // Veo generation requires specific config
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `3D neural visualization of: ${prompt}`,
      config: { 
        numberOfVideos: 1, 
        resolution: '720p', 
        aspectRatio: '16:9' 
      }
    });
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return `${downloadLink}&key=${process.env.API_KEY}`;
  }
}

export function detectNode(text: string): NeuralNode {
  const lowerText = text.toLowerCase();
  if (/\b(stock|image|vision|photo|see|look|chart|graph|inventory|count|analyze|generate image|create picture|draw)\b/.test(lowerText)) {
    return NeuralNode.VISION;
  }
  if (/\b(doctor|symptom|medicine|health|bio|pain|fever|medical|patient|clinic|sick|hurt|triage|hospital)\b/.test(lowerText)) {
    return NeuralNode.BIO_SYNC;
  }
  if (/\b(job|resume|career|hiring|talent|skill|promotion|interview|evolution|growth|apply|cv|ats|linkedin)\b/.test(lowerText)) {
    return NeuralNode.EVOLUTION;
  }
  if (/\b(price|negotiate|supplier|vendor|b2b|cost|deal|commerce|buy|sell|quote|email|draft|discount)\b/.test(lowerText)) {
    return NeuralNode.COMMERCE;
  }
  if (/\b(dashboard|data|telemetry|metric|graph|revenue|savings|roi|uptime|trend|analytics|stat)\b/.test(lowerText)) {
    return NeuralNode.TELEMETRY;
  }
  return NeuralNode.CORE;
}
