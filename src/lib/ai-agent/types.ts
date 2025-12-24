// AI 에이전트 관련 타입 정의

import type { CareState, AgentMessage } from '@/types/care';

// Claude API 메시지 형식
export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ClaudeContentBlock[];
}

export interface ClaudeContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

// Claude Tool 정의
export interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      items?: { type: string };
    }>;
    required: string[];
  };
}

// 에이전트 요청
export interface AgentRequest {
  message: string;
  history: AgentMessage[];
  careState: CareState;
}

// 에이전트 응답
export interface AgentResponse {
  message: string;
  toolResults?: Array<{
    toolName: string;
    result: unknown;
    displayData?: {
      type: string;
      title: string;
      items: Array<{
        icon: string;
        label: string;
        value: string;
        highlight?: boolean;
      }>;
    };
  }>;
  updatedState?: Partial<CareState>;
}

// Tool 핸들러 함수 타입
export type ToolHandler = (
  input: Record<string, unknown>,
  state: CareState
) => Promise<{
  result: unknown;
  stateUpdate?: Partial<CareState>;
  displayData?: {
    type: string;
    title: string;
    items: Array<{
      icon: string;
      label: string;
      value: string;
      highlight?: boolean;
    }>;
  };
}>;

// Tool Registry
export interface ToolRegistry {
  [toolName: string]: {
    definition: ClaudeTool;
    handler: ToolHandler;
  };
}
