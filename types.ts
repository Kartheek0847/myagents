
export enum NeuralNode {
  CORE = 'Vyapar Flow Neural Core',
  VISION = 'Vision Node',
  COMMERCE = 'Commerce Engine',
  BIO_SYNC = 'Bio-Sync Protocol',
  EVOLUTION = 'Evolution Matrix',
  TELEMETRY = 'System Telemetry'
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  verified: boolean;
  credits: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface VisionReport {
  detected_items: string[];
  estimated_count: number;
  stock_status: 'CRITICAL' | 'LOW' | 'HEALTHY';
  anomaly_detected: boolean;
  action_required: string;
}

export interface CommerceNegotiation {
  email_subject: string;
  email_body: string;
  leverage_used: string[];
  win_probability: number;
  margin_impact_estimate: string;
}

export interface SocialPresence {
  platform: 'LinkedIn' | 'X' | 'Instagram';
  status: 'connected' | 'disconnected';
  reach_estimate: string;
}

export interface ResumeData {
  header: { name: string; title: string; contact: string };
  summary: string;
  experience: { company: string; role: string; period: string; bullets: string[] }[];
  skills: string[];
  education: string[];
}

export interface BioSyncAppointment {
  resourceType: "Appointment";
  status: "proposed" | "pending" | "booked";
  serviceType: string;
  description: string;
  priority: "urgent" | "routine";
  requestedPeriod: string;
}

export interface EvolutionMatrixOptimization {
  optimized_bullet_points: string[];
  keywords_added: string[];
  impact_metrics: string[];
  career_advice: string;
  ats_score: number;
  resume_draft?: ResumeData;
}

export interface SystemTelemetry {
  x_axis: string[];
  y_axis: number[];
  metric_name: string;
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  node: NeuralNode;
  timestamp: Date;
  isImage?: boolean;
  isVideo?: boolean;
  thought?: string;
  groundingSources?: GroundingSource[];
  metadata?: {
    vision_report?: VisionReport;
    commerce_negotiation?: CommerceNegotiation;
    bio_sync_appointment?: BioSyncAppointment;
    evolution_matrix?: EvolutionMatrixOptimization;
    system_telemetry?: SystemTelemetry;
    tool_calls?: any[];
    social_links?: SocialPresence[];
  };
}

export interface NodeConfig {
  id: NeuralNode;
  color: string;
  accent: string;
  description: string;
  icon: string;
}
