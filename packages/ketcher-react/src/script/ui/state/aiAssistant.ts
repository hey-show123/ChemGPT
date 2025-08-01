/****************************************************************************
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

export interface AIAssistantState {
  isOpen: boolean;
}

const initialState: AIAssistantState = {
  isOpen: false,
};

// Action types
const TOGGLE_AI_ASSISTANT = 'AI_ASSISTANT/TOGGLE';
const OPEN_AI_ASSISTANT = 'AI_ASSISTANT/OPEN';
const CLOSE_AI_ASSISTANT = 'AI_ASSISTANT/CLOSE';

// Action creators
export const toggleAIAssistant = () => ({
  type: TOGGLE_AI_ASSISTANT,
});

export const openAIAssistant = () => ({
  type: OPEN_AI_ASSISTANT,
});

export const closeAIAssistant = () => ({
  type: CLOSE_AI_ASSISTANT,
});

// Reducer
export default function aiAssistantReducer(
  state = initialState,
  action: { type: string },
): AIAssistantState {
  switch (action.type) {
    case TOGGLE_AI_ASSISTANT:
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    case OPEN_AI_ASSISTANT:
      return {
        ...state,
        isOpen: true,
      };
    case CLOSE_AI_ASSISTANT:
      return {
        ...state,
        isOpen: false,
      };
    default:
      return state;
  }
}
