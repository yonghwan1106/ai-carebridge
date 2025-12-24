import Anthropic from '@anthropic-ai/sdk';
import { CARE_BRIDGE_SYSTEM_PROMPT } from '@/lib/ai-agent/system-prompt';
import { CARE_BRIDGE_TOOLS, TOOL_HANDLERS } from '@/lib/ai-agent/tools';
import type { CareState } from '@/types/care';

// Anthropic 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// 메시지 타입 정의
interface MessageContent {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | MessageContent[];
}

export async function POST(request: Request) {
  try {
    const { message, history, careState } = await request.json() as {
      message: string;
      history: ChatMessage[];
      careState: CareState;
    };

    // API 키 확인
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 대화 히스토리 구성
    const messages: ChatMessage[] = [
      ...history,
      { role: 'user', content: message }
    ];

    // Claude API 호출
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: CARE_BRIDGE_SYSTEM_PROMPT,
      tools: CARE_BRIDGE_TOOLS as Anthropic.Tool[],
      messages: messages as Anthropic.MessageParam[]
    });

    // Tool Use 처리
    const toolResults: Array<{
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
    }> = [];

    let updatedState = { ...careState };
    let finalText = '';

    // Tool Use가 있으면 처리
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      // 각 도구 실행
      const toolResultContents: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const handler = TOOL_HANDLERS[toolUse.name];

        if (handler) {
          try {
            const handlerResult = await handler(
              toolUse.input as Record<string, unknown>,
              updatedState
            );

            // 상태 업데이트
            if (handlerResult.stateUpdate) {
              updatedState = { ...updatedState, ...handlerResult.stateUpdate };
            }

            // 결과 저장
            toolResults.push({
              toolName: toolUse.name,
              result: handlerResult.result,
              displayData: handlerResult.displayData
            });

            toolResultContents.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify(handlerResult.result)
            });
          } catch (error) {
            toolResultContents.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              is_error: true
            });
          }
        } else {
          toolResultContents.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: `Error: Unknown tool "${toolUse.name}"`,
            is_error: true
          });
        }
      }

      // 도구 결과와 함께 재호출
      const newMessages: Anthropic.MessageParam[] = [
        ...messages as Anthropic.MessageParam[],
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResultContents }
      ];

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: CARE_BRIDGE_SYSTEM_PROMPT,
        tools: CARE_BRIDGE_TOOLS as Anthropic.Tool[],
        messages: newMessages
      });
    }

    // 최종 텍스트 추출
    for (const block of response.content) {
      if (block.type === 'text') {
        finalText += block.text;
      }
    }

    return Response.json({
      message: finalText,
      toolResults: toolResults.length > 0 ? toolResults : undefined,
      updatedState
    });

  } catch (error) {
    console.error('Chat API Error:', error);

    // 에러 타입에 따른 응답
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: `API 오류: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return Response.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
