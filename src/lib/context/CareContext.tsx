'use client';

import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import type { CareState, AgentMessage } from '@/types/care';
import { INITIAL_GREETING } from '@/lib/ai-agent/system-prompt';

// 초기 상태
const initialCareState: CareState = {
  discoveredBenefits: [],
  nearbyFacilities: [],
  appointments: [],
  familyEvents: [],
  currentStep: 'initial',
  completedSteps: [],
  favoriteFacilities: [],
  compareFacilities: [],
  selectedFacility: undefined
};

// 초기 대화
const initialMessages: AgentMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: INITIAL_GREETING,
    timestamp: new Date()
  }
];

// 전체 앱 상태
interface AppState {
  careState: CareState;
  messages: AgentMessage[];
  isLoading: boolean;
  error: string | null;
}

const initialAppState: AppState = {
  careState: initialCareState,
  messages: initialMessages,
  isLoading: false,
  error: null
};

// 액션 타입
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_USER_MESSAGE'; payload: string }
  | { type: 'ADD_AGENT_MESSAGE'; payload: { content: string; toolResults?: AgentMessage['toolResults'] } }
  | { type: 'UPDATE_CARE_STATE'; payload: Partial<CareState> }
  | { type: 'RESET_CONVERSATION' }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'TOGGLE_COMPARE'; payload: string }
  | { type: 'CLEAR_COMPARE' }
  | { type: 'SELECT_FACILITY'; payload: CareState['selectedFacility'] };

// 리듀서
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: `user-${Date.now()}`,
            role: 'user',
            content: action.payload,
            timestamp: new Date()
          }
        ]
      };

    case 'ADD_AGENT_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: `agent-${Date.now()}`,
            role: 'assistant',
            content: action.payload.content,
            timestamp: new Date(),
            toolResults: action.payload.toolResults
          }
        ],
        isLoading: false
      };

    case 'UPDATE_CARE_STATE':
      return {
        ...state,
        careState: { ...state.careState, ...action.payload }
      };

    case 'RESET_CONVERSATION':
      return {
        ...initialAppState,
        messages: [
          {
            id: 'welcome-reset',
            role: 'assistant',
            content: INITIAL_GREETING,
            timestamp: new Date()
          }
        ]
      };

    case 'TOGGLE_FAVORITE': {
      const facilityId = action.payload;
      const currentFavorites = state.careState.favoriteFacilities || [];
      const isFavorite = currentFavorites.includes(facilityId);
      return {
        ...state,
        careState: {
          ...state.careState,
          favoriteFacilities: isFavorite
            ? currentFavorites.filter(id => id !== facilityId)
            : [...currentFavorites, facilityId]
        }
      };
    }

    case 'TOGGLE_COMPARE': {
      const facilityId = action.payload;
      const currentCompare = state.careState.compareFacilities || [];
      const isComparing = currentCompare.includes(facilityId);
      // 최대 3개까지만 비교 가능
      if (!isComparing && currentCompare.length >= 3) {
        return state;
      }
      return {
        ...state,
        careState: {
          ...state.careState,
          compareFacilities: isComparing
            ? currentCompare.filter(id => id !== facilityId)
            : [...currentCompare, facilityId]
        }
      };
    }

    case 'CLEAR_COMPARE':
      return {
        ...state,
        careState: {
          ...state.careState,
          compareFacilities: []
        }
      };

    case 'SELECT_FACILITY':
      return {
        ...state,
        careState: {
          ...state.careState,
          selectedFacility: action.payload
        }
      };

    default:
      return state;
  }
}

// Context 생성
const CareContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
  sendMessage: (message: string) => Promise<void>;
  resetConversation: () => void;
  toggleFavorite: (facilityId: string) => void;
  toggleCompare: (facilityId: string) => void;
  clearCompare: () => void;
  selectFacility: (facility: CareState['selectedFacility']) => void;
} | null>(null);

// Provider 컴포넌트
export function CareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  // 메시지 전송 함수
  const sendMessage = async (message: string) => {
    if (!message.trim() || state.isLoading) return;

    // 사용자 메시지 추가
    dispatch({ type: 'ADD_USER_MESSAGE', payload: message });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // API 호출용 히스토리 구성
      const apiHistory = state.messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: apiHistory,
          careState: state.careState
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '응답을 받지 못했습니다.');
      }

      const data = await response.json();

      // 에이전트 응답 추가
      dispatch({
        type: 'ADD_AGENT_MESSAGE',
        payload: {
          content: data.message,
          toolResults: data.toolResults
        }
      });

      // 상태 업데이트
      if (data.updatedState) {
        dispatch({ type: 'UPDATE_CARE_STATE', payload: data.updatedState });
      }

    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 대화 초기화
  const resetConversation = () => {
    dispatch({ type: 'RESET_CONVERSATION' });
  };

  // 즐겨찾기 토글
  const toggleFavorite = (facilityId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: facilityId });
  };

  // 비교 토글
  const toggleCompare = (facilityId: string) => {
    dispatch({ type: 'TOGGLE_COMPARE', payload: facilityId });
  };

  // 비교 목록 초기화
  const clearCompare = () => {
    dispatch({ type: 'CLEAR_COMPARE' });
  };

  // 시설 선택 (상세 보기)
  const selectFacility = (facility: CareState['selectedFacility']) => {
    dispatch({ type: 'SELECT_FACILITY', payload: facility });
  };

  return (
    <CareContext.Provider value={{
      state,
      dispatch,
      sendMessage,
      resetConversation,
      toggleFavorite,
      toggleCompare,
      clearCompare,
      selectFacility
    }}>
      {children}
    </CareContext.Provider>
  );
}

// Hook
export function useCare() {
  const context = useContext(CareContext);
  if (!context) {
    throw new Error('useCare must be used within a CareProvider');
  }
  return context;
}
