// ============================================
// User Types
// ============================================

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  pointsBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscription?: Subscription;
  settings?: UserSettings;
}

// ============================================
// Subscription & Plans
// ============================================

export type PlanType = 'FIXED' | 'CUSTOM' | 'PAY_AS_YOU_GO';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'INCOMPLETE' | 'TRIALING';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  type: PlanType;
  priceMonthly: number;
  priceYearly: number | null;
  pointsIncluded: number;
  features: string[];
  arenaModules?: ArenaModule[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  plan?: Plan;
}

// ============================================
// Points & Transactions
// ============================================

export type TransactionType = 
  | 'SUBSCRIPTION_CREDIT'
  | 'PURCHASE_POINTS'
  | 'USAGE_DEDUCTION'
  | 'REFUND'
  | 'BONUS'
  | 'EXPIRATION';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  pointsAmount: number;
  moneyAmount: number | null;
  description: string;
  stripePaymentId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface PointPackage {
  id: string;
  name: string;
  points: number;
  price: number;
  bonusPoints: number;
  isPopular: boolean;
}

// ============================================
// Chat & Messages
// ============================================

export type ArenaType = 'TEXT' | 'CODE' | 'IMAGE' | 'VIDEO' | 'AUDIO';
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface ChatSession {
  id: string;
  userId: string;
  arenaType: ArenaType;
  title: string | null;
  modelUsed: string;
  skillMode: string | null;
  systemPrompt: string | null;
  totalTokensUsed: number;
  totalPointsSpent: number;
  contextData: ContextData | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  tokensUsed: number;
  pointsCost: number;
  modelUsed?: string | null;
  metadata?: MessageMetadata | null;
  createdAt: Date;
}

export interface ContextData {
  messages: Array<{ role: string; content: string }>;
  totalTokens: number;
  lastUpdated: Date;
}

export interface MessageMetadata {
  imageUrls?: string[];
  codeBlocks?: Array<{ language: string; code: string }>;
  finishReason?: string;
  modelVersion?: string;
}

// ============================================
// AI Models
// ============================================

export type AIProvider =
  | 'OPENAI'
  | 'ANTHROPIC'
  | 'GOOGLE'
  | 'META'
  | 'MISTRAL'
  | 'COHERE'
  | 'GROQ'
  | 'CUSTOM';

export interface AIModel {
  id: string;
  name: string;
  slug: string;
  provider: AIProvider;
  contextWindow: number;
  inputPrice1K: number;
  outputPrice1K: number;
  inputPoints1K: number;
  outputPoints1K: number;
  capabilities: ModelCapabilities | null;
  isActive: boolean;
  isAvailable: boolean;
}

export interface ModelCapabilities {
  chat: boolean;
  code: boolean;
  image: boolean;
  video: boolean;
  audio: boolean;
  functionCalling: boolean;
  streaming: boolean;
}

// ============================================
// Skills
// ============================================

export interface Skill {
  id: string;
  name: string;
  slug: string;
  arenaType: ArenaType;
  description: string | null;
  systemPrompt: string;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
}

// ============================================
// User Settings
// ============================================

export interface UserSettings {
  id: string;
  userId: string;
  dailyPointsLimit: number;
  sessionTokensLimit: number;
  preferredModel: string | null;
  preferredArena: string | null;
  notificationsEmail: boolean;
  notificationsPush: boolean;
  arenaPreferences: ArenaPreferences | null;
  theme: 'dark' | 'light' | 'system';
  language: string;
}

export interface ArenaPreferences {
  text?: {
    defaultModel?: string;
    defaultSkill?: string;
  };
  code?: {
    defaultModel?: string;
    defaultSkill?: string;
    editorTheme?: string;
  };
  image?: {
    defaultAspectRatio?: string;
    defaultStyle?: string;
  };
}

// ============================================
// Telemetry
// ============================================

export interface SessionTelemetry {
  contextUsed: number;
  contextLimit: number;
  contextPercentage: number;
  lastRequestCost: number;
  lastRequestTokens: number;
  totalSessionCost: number;
  totalSessionTokens: number;
  currentModel: string;
  currentSkill: string;
  contextStatus: ContextStatus;
}

export type ContextStatus = 'normal' | 'warning' | 'critical';

// ============================================
// API Types
// ============================================

export interface ChatCompletionRequest {
  messages: Array<{ role: MessageRole; content: string }>;
  model: string;
  skill?: string;
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatCompletionResponse {
  success: boolean;
  id: string;
  sessionId: string;
  message: {
    role: 'assistant';
    content: string;
  };
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: {
    points: number;
    usd: number;
  };
  telemetry: SessionTelemetry;
}

export interface PointsBalanceResponse {
  balance: number;
  dailyUsage: number;
  dailyLimit: number;
  remainingToday: number;
}

// ============================================
// Pricing Calculator
// ============================================

export interface PricingCalculatorInput {
  modules: ArenaModule[];
  estimatedUsage: {
    text: number;
    code: number;
    image: number;
  };
}

export interface ArenaModule {
  type: ArenaType;
  enabled: boolean;
  models: string[];
}

export interface PricingCalculatorOutput {
  monthlyPrice: number;
  yearlyPrice: number;
  pointsIncluded: number;
  breakdown: {
    module: string;
    price: number;
    points: number;
  }[];
}
