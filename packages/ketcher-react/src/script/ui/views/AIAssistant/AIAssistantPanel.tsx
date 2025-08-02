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

import React, { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import { Icon } from '../../../../components';
import AIService, {
  ChatMessage,
  ChemicalStructure,
  AIModel,
  AIModelConfig,
} from '../../services/AIService';
import StructureGenerator from '../../services/StructureGenerator';

export interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: (action: any) => void;
}

// Remove overlay - not needed

const PanelContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 64px; /* Fixed height to avoid header overlap */
  left: 0;
  width: 400px;
  height: calc(100vh - 64px);
  background-color: #ffffff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transform: translateX(${(props) => (props.isOpen ? '0' : '-100%')});
  transition: transform 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  background-color: #f5f5f5;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ModelSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const PanelContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  margin-bottom: 16px;
`;

const Message = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  background-color: ${(props) => (props.isUser ? '#167782' : '#f0f0f0')};
  color: ${(props) => (props.isUser ? 'white' : '#333')};
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
`;

const StructurePreview = styled.div`
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
`;

const StructureButton = styled.button`
  margin-top: 4px;
  padding: 6px 12px;
  background-color: #167782;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #145a64;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const SuggestionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const SuggestionButton = styled.button`
  padding: 4px 8px;
  background-color: transparent;
  color: #167782;
  border: 1px solid #167782;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #167782;
    color: white;
  }
`;

const InputContainer = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
  background-color: #fafafa;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const TextInput = styled.textarea`
  flex: 1;
  min-height: 36px;
  max-height: 100px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 18px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;

  &:focus {
    border-color: #167782;
  }
`;

const SendButton = styled.button`
  padding: 8px 16px;
  background-color: #167782;
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #145a64;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  font-style: italic;
  margin-bottom: 16px;

  .dots {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  color: #666;
  margin-top: 40px;

  h4 {
    font-size: 20px;
    margin-bottom: 12px;
    color: #333;
  }

  p {
    font-size: 14px;
    line-height: 1.6;
    margin: 8px 0;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;

  li {
    padding: 8px 0;
    font-size: 14px;
    color: #555;
    display: flex;
    align-items: center;
    gap: 8px;

    &:before {
      content: '•';
      color: #167782;
      font-weight: bold;
      font-size: 18px;
    }
  }
`;

const ModelLabel = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: #555;
`;

const ModelDropdown = styled.select`
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #167782;
  }
`;

const ModelDescription = styled.div`
  font-size: 11px;
  color: #777;
  font-style: italic;
  margin-top: 2px;
`;

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  isOpen,
  onClose,
  dispatch,
}) => {
  console.log('🚀 AIAssistantPanel rendering with props:', { isOpen });
  console.log('🎯 AIAssistantPanel mounted!');

  // ページ読み込み時のテストログ
  React.useEffect(() => {
    console.log('✅ AIAssistantPanel useEffect triggered!');
    console.log('🌟 JavaScript is working correctly!');

    // グローバルテスト
    window.console.log('🔥 GLOBAL TEST LOG - AIAssistantPanel loaded!');
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiService] = useState(() => {
    console.log('Creating AIService instance...');
    try {
      const service = AIService.getInstance();
      console.log('AIService created successfully');
      return service;
    } catch (error) {
      console.error('Error creating AIService:', error);
      throw error;
    }
  });
  const [structureGenerator] = useState(() => {
    console.log('Creating StructureGenerator instance...');
    try {
      const generator = new StructureGenerator(dispatch);
      console.log('StructureGenerator created successfully');
      return generator;
    } catch (error) {
      console.error('Error creating StructureGenerator:', error);
      // Return a mock generator to avoid crashes
      return {
        addStructuresToCanvas: async () => ({
          success: false,
          error: 'StructureGenerator not available',
          addedStructures: 0,
        }),
        getCurrentStructureAsKet: () => null,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        setDispatch: () => {},
      } as unknown as StructureGenerator;
    }
  });
  const [availableModels, setAvailableModels] = useState<AIModelConfig[]>([]);
  const [currentModel, setCurrentModel] = useState<AIModel>('gpt-3.5-turbo');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // AIモデル一覧を初期化
  useEffect(() => {
    const models = aiService.getAvailableModels();
    setAvailableModels(models);
    setCurrentModel(aiService.getCurrentModel());
  }, [aiService]);

  // StructureGeneratorにdispatchを設定
  useEffect(() => {
    if (structureGenerator && dispatch) {
      structureGenerator.setDispatch(dispatch);
    }
  }, [structureGenerator, dispatch]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    // 新しいメッセージが追加されたら最下部にスクロール
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    console.log('handleSendMessage called with:', inputValue);

    if (!inputValue.trim() || isLoading) {
      console.log('Validation failed:', {
        inputValue: inputValue.trim(),
        isLoading,
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now() + '-user',
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      structures: [],
    };

    console.log('Created userMessage:', userMessage);

    setMessages((prev) => {
      console.log('Previous messages:', prev);
      const newMessages = [...prev, userMessage];
      console.log('New messages after adding user message:', newMessages);
      return newMessages;
    });

    setInputValue('');
    setIsLoading(true);

    try {
      console.log(
        'AIAssistantPanel: Sending message to AI:',
        userMessage.content,
      );

      // AI応答を取得
      let aiResponse;

      // 現在の構造を取得して文脈として提供
      const currentStructure = structureGenerator.getCurrentStructureAsKet();
      console.log('AIAssistantPanel: Current structure:', currentStructure);

      if (currentStructure) {
        aiResponse = await aiService.analyzeStructure(
          currentStructure,
          userMessage.content,
        );
      } else {
        aiResponse = await aiService.generateStructure(userMessage.content);
      }

      console.log('AIAssistantPanel: AI response received:', aiResponse);

      // レスポンスの検証
      if (!aiResponse || typeof aiResponse.message !== 'string') {
        throw new Error('Invalid AI response format');
      }

      const assistantMessage: ChatMessage = {
        id: Date.now() + '-assistant',
        role: 'assistant',
        content: aiResponse.message,
        structures: aiResponse.structures || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AIAssistantPanel: Error occurred:', error);
      const errorMessage: ChatMessage = {
        id: Date.now() + '-error',
        role: 'assistant',
        content: `エラーが発生しました: ${
          error instanceof Error ? error.message : 'Unknown error'
        }\nしばらくしてからもう一度お試しください。`,
        timestamp: new Date(),
        structures: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    console.log('handleSuggestionClick called with:', suggestion);
    setInputValue(suggestion);

    // 自動的にメッセージを送信
    if (!isLoading) {
      const userMessage: ChatMessage = {
        id: Date.now() + '-user',
        role: 'user',
        content: suggestion,
        timestamp: new Date(),
        structures: [],
      };

      console.log('Adding user message:', userMessage);
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        console.log('AIAssistantPanel: Calling AI service...');
        let aiResponse;
        if (suggestion.includes('分析')) {
          const currentStructure =
            structureGenerator.getCurrentStructureAsKet();
          aiResponse = await aiService.analyzeStructure(
            currentStructure || '',
            suggestion,
          );
        } else {
          aiResponse = await aiService.generateStructure(suggestion);
        }

        console.log('AIAssistantPanel: AI response received:', aiResponse);

        if (!aiResponse || typeof aiResponse.message !== 'string') {
          throw new Error('Invalid AI response format');
        }

        const assistantMessage: ChatMessage = {
          id: Date.now() + '-assistant',
          role: 'assistant',
          content: aiResponse.message,
          structures: aiResponse.structures || [],
          timestamp: new Date(),
        };

        console.log('Adding assistant message:', assistantMessage);
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('AIAssistantPanel: Error occurred:', error);
        const errorMessage: ChatMessage = {
          id: Date.now() + '-error',
          role: 'assistant',
          content: `エラーが発生しました: ${
            error instanceof Error ? error.message : 'Unknown error'
          }\nしばらくしてからもう一度お試しください。`,
          timestamp: new Date(),
          structures: [],
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = event.target.value as AIModel;
    setCurrentModel(newModel);
    aiService.setCurrentModel(newModel);
  };

  const handleAddStructure = async (structure: ChemicalStructure) => {
    try {
      console.log('handleAddStructure called with:', structure);

      const result = await structureGenerator.addStructuresToCanvas([
        structure,
      ]);
      console.log('addStructuresToCanvas result:', result);

      if (result.success) {
        console.log(
          `構造を追加しました: ${structure.label || structure.format}`,
        );

        // 成功メッセージをチャットに追加
        const successMessage: ChatMessage = {
          id: Date.now() + '-success',
          role: 'assistant',
          content: `✅ 構造「${
            structure.label || '化学構造'
          }」をキャンバスに追加しました！`,
          structures: [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
      } else {
        console.error('構造の追加に失敗:', result.error);

        // エラーメッセージをチャットに追加
        const errorMessage: ChatMessage = {
          id: Date.now() + '-error',
          role: 'assistant',
          content: `❌ 構造の追加に失敗しました: ${
            result.error || '不明なエラー'
          }`,
          structures: [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('構造追加エラー:', error);

      // エラーメッセージをチャットに追加
      const errorMessage: ChatMessage = {
        id: Date.now() + '-error',
        role: 'assistant',
        content: `❌ エラーが発生しました: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        structures: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const renderMessage = (message: ChatMessage) => {
    console.log('renderMessage called with:', message);
    console.log('message.structures:', message.structures);
    console.log('message.structures type:', typeof message.structures);
    console.log(
      'message.structures is array:',
      Array.isArray(message.structures),
    );

    return (
      <MessageContainer key={message.id} isUser={message.role === 'user'}>
        <Message isUser={message.role === 'user'}>
          {message.content}

          {message.role === 'assistant' &&
            message.structures &&
            Array.isArray(message.structures) &&
            message.structures.length > 0 && (
              <>
                {message.structures.map((structure, index) => (
                  <StructurePreview key={index}>
                    <div>
                      <strong>{structure.label || `構造 ${index + 1}`}</strong>
                    </div>
                    <div>
                      {structure.format.toUpperCase()}: {structure.data}
                    </div>
                    <StructureButton
                      onClick={() => handleAddStructure(structure)}
                    >
                      キャンバスに追加
                    </StructureButton>
                  </StructurePreview>
                ))}
              </>
            )}
        </Message>
      </MessageContainer>
    );
  };

  const showWelcome = messages.length === 0 && !isLoading;

  const selectedModelConfig = availableModels.find(
    (model) => model.id === currentModel,
  );

  console.log(
    '📋 AIAssistantPanel rendering UI, isOpen:',
    isOpen,
    'messages count:',
    messages.length,
  );

  // AI Assistant panel initialization
  React.useEffect(() => {
    if (isOpen) {
      console.log('🎯 AI Assistant panel opened successfully');
    }
  }, [isOpen]);

  return (
    <>
      <PanelContainer isOpen={isOpen}>
        <PanelHeader>
          <HeaderRow>
            <PanelTitle>
              <Icon name="ai-assistant" />
              ChemGPT AI アシスタント
            </PanelTitle>
            <CloseButton onClick={onClose} title="閉じる">
              <Icon name="close" />
            </CloseButton>
          </HeaderRow>
          <ModelSelector>
            <ModelLabel>AI モデル:</ModelLabel>
            <div>
              <ModelDropdown value={currentModel} onChange={handleModelChange}>
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </ModelDropdown>
              {selectedModelConfig && (
                <ModelDescription>
                  {selectedModelConfig.description}
                </ModelDescription>
              )}
            </div>
          </ModelSelector>
        </PanelHeader>
        <PanelContent>
          <ChatContainer ref={chatContainerRef}>
            {showWelcome && (
              <WelcomeMessage>
                <h4>ChemGPT AI アシスタントへようこそ</h4>
                <p>化学構造の描画と分析をAIがサポートします</p>

                <FeatureList>
                  <li>構造式の自動生成</li>
                  <li>化合物の性質予測</li>
                  <li>反応経路の提案</li>
                  <li>SMILES/IUPACの変換</li>
                  <li>構造の最適化</li>
                </FeatureList>

                <SuggestionContainer>
                  <SuggestionButton
                    onClick={() =>
                      handleSuggestionClick('アスピリンの構造を描いて')
                    }
                  >
                    アスピリンの構造
                  </SuggestionButton>
                  <SuggestionButton
                    onClick={() =>
                      handleSuggestionClick('カフェインの構造を描いて')
                    }
                  >
                    カフェインの構造
                  </SuggestionButton>
                  <SuggestionButton
                    onClick={() =>
                      handleSuggestionClick('現在の構造を分析して')
                    }
                  >
                    構造解析
                  </SuggestionButton>
                </SuggestionContainer>
              </WelcomeMessage>
            )}

            {messages.map(renderMessage)}

            {isLoading && (
              <LoadingIndicator>
                <span>AI が応答を生成中</span>
                <span className="dots">...</span>
              </LoadingIndicator>
            )}
          </ChatContainer>

          <InputContainer>
            <InputWrapper>
              <TextInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="化学に関する質問をどうぞ... (例: アスピリンの構造を描いて)"
                disabled={isLoading}
              />
              <SendButton
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                送信
              </SendButton>
            </InputWrapper>
          </InputContainer>
        </PanelContent>
      </PanelContainer>
    </>
  );
};
