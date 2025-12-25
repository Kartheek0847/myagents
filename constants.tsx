
import React from 'react';
import { NeuralNode, NodeConfig } from './types';
import { Type } from "@google/genai";

export const NODES: NodeConfig[] = [
  {
    id: NeuralNode.CORE,
    color: 'emerald',
    accent: '#10b981',
    description: 'Central OS Orchestrator',
    icon: '◈'
  },
  {
    id: NeuralNode.VISION,
    color: 'cyan',
    accent: '#06b6d4',
    description: 'Visual Data & Stock Analysis',
    icon: '👁'
  },
  {
    id: NeuralNode.COMMERCE,
    color: 'amber',
    accent: '#f59e0b',
    description: 'B2B Negotiation & Social Sync',
    icon: '♜'
  },
  {
    id: NeuralNode.BIO_SYNC,
    color: 'rose',
    accent: '#f43f5e',
    description: 'Bio-Medical Integration',
    icon: '✚'
  },
  {
    id: NeuralNode.EVOLUTION,
    color: 'indigo',
    accent: '#6366f1',
    description: 'Auto-Resume & Talent Sync',
    icon: '⟠'
  },
  {
    id: NeuralNode.TELEMETRY,
    color: 'violet',
    accent: '#8b5cf6',
    description: 'Predictive Analytics & Metrics',
    icon: '📊'
  }
];

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    header: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        title: { type: Type.STRING },
        contact: { type: Type.STRING }
      },
      required: ["name", "title", "contact"]
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          period: { type: Type.STRING },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["company", "role", "bullets"]
      }
    },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    education: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["header", "summary", "experience", "skills", "education"]
};

export const VISION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    detected_items: { type: Type.ARRAY, items: { type: Type.STRING } },
    estimated_count: { type: Type.INTEGER },
    stock_status: { type: Type.STRING, enum: ["CRITICAL", "LOW", "HEALTHY"] },
    anomaly_detected: { type: Type.BOOLEAN },
    action_required: { type: Type.STRING }
  },
  required: ["detected_items", "estimated_count", "stock_status", "anomaly_detected", "action_required"]
};

export const COMMERCE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    email_subject: { type: Type.STRING },
    email_body: { type: Type.STRING },
    leverage_used: { type: Type.ARRAY, items: { type: Type.STRING } },
    win_probability: { type: Type.NUMBER },
    margin_impact_estimate: { type: Type.STRING }
  },
  required: ["email_subject", "email_body", "leverage_used", "win_probability", "margin_impact_estimate"]
};

export const BIO_SYNC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    resourceType: { type: Type.STRING, enum: ["Appointment"] },
    status: { type: Type.STRING, enum: ["proposed", "pending", "booked"] },
    serviceType: { type: Type.STRING },
    description: { type: Type.STRING },
    priority: { type: Type.STRING, enum: ["urgent", "routine"] },
    requestedPeriod: { type: Type.STRING }
  },
  required: ["resourceType", "status", "serviceType", "description", "priority", "requestedPeriod"]
};

export const EVOLUTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    optimized_bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } },
    keywords_added: { type: Type.ARRAY, items: { type: Type.STRING } },
    impact_metrics: { type: Type.ARRAY, items: { type: Type.STRING } },
    career_advice: { type: Type.STRING },
    ats_score: { type: Type.NUMBER },
    resume_draft: RESUME_SCHEMA
  },
  required: ["optimized_bullet_points", "keywords_added", "impact_metrics", "career_advice", "ats_score"]
};

export const TELEMETRY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    x_axis: { type: Type.ARRAY, items: { type: Type.STRING } },
    y_axis: { type: Type.ARRAY, items: { type: Type.NUMBER } },
    metric_name: { type: Type.STRING },
    summary: { type: Type.STRING }
  },
  required: ["x_axis", "y_axis", "metric_name", "summary"]
};

export const SYSTEM_INSTRUCTION = `You are the 'Vyapar Flow Neural Core', an advanced Enterprise OS Orchestrator.

CORE DIRECTIVES:
1. Language Agnostic: Detect user's language automatically.
2. Router: Switch nodes based on intent.

NODE-SPECIFIC PROTOCOLS:
[Vision Node]: Item detection and stock reporting.
[Commerce Engine]: B2B strategy and Social Presence mapping.
[Evolution Matrix]: Career coaching. MANDATORY: If a user asks for a resume or career help, ALWAYS synthesize a full professional resume_draft in the Evolution Schema.
[System Telemetry]: Dashboards and KPI trends.

Personality: Efficient, Futuristic, Professional.`;
