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
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
`;

const StructureImage = styled.div`
  width: 200px;
  height: 150px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #167782;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #999;
  font-style: italic;
  font-size: 11px;
  text-align: center;
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

// Component for rendering chemical structure from SMILES
const StructureRenderer: React.FC<{ smiles: string; label: string }> = ({
  smiles,
  label,
}) => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const generateStructureImage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create a simple SVG representation for the SMILES structure
        // This provides a visual representation without relying on external APIs
        const createStructureSVG = (smilesData: string) => {
          // Enhanced SMILES parsing for better chemical structure representation
          let structureElements = '';

          // Specific compound detection for common molecules
          if (smilesData.includes('CC(=O)OC1=CC=CC=C1C(=O)O')) {
            // Aspirin structure - Ketcher style
            structureElements = `
              <!-- Benzene ring -->
              <line x1="120" y1="75" x2="140" y2="87" stroke="#000" stroke-width="1"/>
              <line x1="140" y1="87" x2="140" y2="113" stroke="#000" stroke-width="1"/>
              <line x1="140" y1="113" x2="120" y2="125" stroke="#000" stroke-width="1"/>
              <line x1="120" y1="125" x2="100" y2="113" stroke="#000" stroke-width="1"/>
              <line x1="100" y1="113" x2="100" y2="87" stroke="#000" stroke-width="1"/>
              <line x1="100" y1="87" x2="120" y2="75" stroke="#000" stroke-width="1"/>
              <!-- Double bonds in benzene (inner) -->
              <line x1="110" y1="82" x2="125" y2="92" stroke="#000" stroke-width="1"/>
              <line x1="125" y1="108" x2="110" y2="118" stroke="#000" stroke-width="1"/>
              <line x1="110" y1="95" x2="110" y2="105" stroke="#000" stroke-width="1"/>
              
              <!-- Ester linkage -->
              <line x1="100" y1="87" x2="85" y2="75" stroke="#000" stroke-width="1"/>
              <text x="80" y="80" font-family="Arial" font-size="12" fill="#d00">O</text>
              
              <!-- Acetyl group -->
              <line x1="85" y1="75" x2="70" y2="63" stroke="#000" stroke-width="1"/>
              <line x1="70" y1="63" x2="70" y2="48" stroke="#000" stroke-width="1"/>
              <line x1="72" y1="63" x2="72" y2="48" stroke="#000" stroke-width="1"/>
              <text x="60" y="46" font-family="Arial" font-size="12" fill="#d00">O</text>
              <line x1="70" y1="63" x2="55" y2="68" stroke="#000" stroke-width="1"/>
              
              <!-- Carboxyl group -->
              <line x1="140" y1="113" x2="155" y2="125" stroke="#000" stroke-width="1"/>
              <line x1="155" y1="125" x2="170" y2="113" stroke="#000" stroke-width="1"/>
              <line x1="157" y1="123" x2="167" y2="115" stroke="#000" stroke-width="1"/>
              <text x="165" y="118" font-family="Arial" font-size="12" fill="#d00">O</text>
              <line x1="170" y1="113" x2="185" y2="125" stroke="#000" stroke-width="1"/>
              <text x="185" y="130" font-family="Arial" font-size="12" fill="#d00">OH</text>
            `;
          } else if (smilesData.includes('CN1C=NC2=C1C(=O)N(C(=O)N2C)C')) {
            // Caffeine structure - Ketcher style
            structureElements = `
              <!-- Five-membered ring -->
              <line x1="100" y1="80" x2="85" y2="92" stroke="#000" stroke-width="1"/>
              <line x1="85" y1="92" x2="100" y2="110" stroke="#000" stroke-width="1"/>
              <line x1="100" y1="110" x2="115" y2="95" stroke="#000" stroke-width="1"/>
              <line x1="115" y1="95" x2="100" y2="80" stroke="#000" stroke-width="1"/>
              
              <!-- Six-membered ring -->
              <line x1="100" y1="110" x2="130" y2="110" stroke="#000" stroke-width="1"/>
              <line x1="130" y1="110" x2="145" y2="95" stroke="#000" stroke-width="1"/>
              <line x1="145" y1="95" x2="130" y2="80" stroke="#000" stroke-width="1"/>
              <line x1="130" y1="80" x2="115" y2="95" stroke="#000" stroke-width="1"/>
              
              <!-- Nitrogen atoms -->
              <text x="82" y="97" font-family="Arial" font-size="11" fill="#00f">N</text>
              <text x="112" y="100" font-family="Arial" font-size="11" fill="#00f">N</text>
              <text x="127" y="115" font-family="Arial" font-size="11" fill="#00f">N</text>
              <text x="142" y="82" font-family="Arial" font-size="11" fill="#00f">N</text>
              
              <!-- Oxygen atoms -->
              <text x="90" y="75" font-family="Arial" font-size="11" fill="#d00">O</text>
              <text x="150" y="105" font-family="Arial" font-size="11" fill="#d00">O</text>
              
              <!-- Methyl groups -->
              <line x1="75" y1="85" x2="60" y2="75" stroke="#000" stroke-width="1"/>
              <line x1="130" y1="120" x2="130" y2="135" stroke="#000" stroke-width="1"/>
              <line x1="155" y1="85" x2="170" y2="75" stroke="#000" stroke-width="1"/>
            `;
          } else {
            // Generic structure detection
            const isAromatic =
              smilesData.includes('c') || /C1=CC=CC=C1/i.test(smilesData);
            const hasRings = /\d/.test(smilesData);
            const hasBranches =
              smilesData.includes('(') && smilesData.includes(')');
            const hasOxygen = smilesData.includes('O');
            const hasNitrogen = smilesData.includes('N');
            const hasCarboxyl = /C\(=O\)O/i.test(smilesData);

            if (isAromatic) {
              // Benzene ring - Ketcher style
              structureElements += `
                <line x1="100" y1="55" x2="118" y2="65" stroke="#000" stroke-width="1"/>
                <line x1="118" y1="65" x2="118" y2="95" stroke="#000" stroke-width="1"/>
                <line x1="118" y1="95" x2="100" y2="105" stroke="#000" stroke-width="1"/>
                <line x1="100" y1="105" x2="82" y2="95" stroke="#000" stroke-width="1"/>
                <line x1="82" y1="95" x2="82" y2="65" stroke="#000" stroke-width="1"/>
                <line x1="82" y1="65" x2="100" y2="55" stroke="#000" stroke-width="1"/>
                <!-- Inner double bonds -->
                <line x1="91" y1="62" x2="106" y2="71" stroke="#000" stroke-width="1"/>
                <line x1="109" y1="89" x2="91" y2="98" stroke="#000" stroke-width="1"/>
                <line x1="91" y1="75" x2="91" y2="85" stroke="#000" stroke-width="1"/>
              `;
            } else if (hasRings) {
              // Cyclic structure - Ketcher style
              structureElements += `
                <line x1="100" y1="55" x2="120" y2="75" stroke="#000" stroke-width="1"/>
                <line x1="120" y1="75" x2="100" y2="95" stroke="#000" stroke-width="1"/>
                <line x1="100" y1="95" x2="80" y2="75" stroke="#000" stroke-width="1"/>
                <line x1="80" y1="75" x2="100" y2="55" stroke="#000" stroke-width="1"/>
              `;
            } else {
              // Linear structure - Ketcher style
              structureElements += `
                <line x1="60" y1="75" x2="100" y2="75" stroke="#000" stroke-width="1"/>
                <line x1="100" y1="75" x2="140" y2="75" stroke="#000" stroke-width="1"/>
              `;
            }

            // Add functional groups - Ketcher style
            if (hasCarboxyl) {
              structureElements += `
                <line x1="140" y1="75" x2="155" y2="85" stroke="#000" stroke-width="1"/>
                <line x1="155" y1="85" x2="170" y2="75" stroke="#000" stroke-width="1"/>
                <line x1="154" y1="75" x2="154" y2="75" stroke="#000" stroke-width="2"/>
                <text x="165" y="80" font-family="Arial" font-size="11" fill="#d00">O</text>
                <line x1="170" y1="75" x2="185" y2="85" stroke="#000" stroke-width="1"/>
                <text x="180" y="90" font-family="Arial" font-size="11" fill="#d00">OH</text>
              `;
            } else if (hasOxygen) {
              structureElements += `
                <text x="145" y="80" font-family="Arial" font-size="11" fill="#d00">O</text>
              `;
            }

            if (hasNitrogen) {
              structureElements += `
                <text x="85" y="65" font-family="Arial" font-size="11" fill="#00f">N</text>
              `;
            }

            if (hasBranches) {
              structureElements += `
                <line x1="100" y1="75" x2="100" y2="55" stroke="#000" stroke-width="1"/>
              `;
            }
          }

          return `
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
              <rect width="200" height="150" fill="white" stroke="#e0e0e0" stroke-width="1" rx="4"/>
              ${structureElements}
              <text x="100" y="130" font-family="monospace" font-size="9" text-anchor="middle" fill="#888">
                ${
                  smilesData.length > 25
                    ? smilesData.substring(0, 25) + '...'
                    : smilesData
                }
              </text>
            </svg>
          `;
        };

        const structureSVG = createStructureSVG(smiles);
        const svgUrl = `data:image/svg+xml;base64,${btoa(structureSVG)}`;

        setImageUrl(svgUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error generating structure image:', err);
        setError('画像生成に失敗しました');
        setLoading(false);
      }
    };

    if (smiles) {
      generateStructureImage();
    }
  }, [smiles]);

  if (loading) {
    return (
      <StructureImage>
        <LoadingSpinner />
      </StructureImage>
    );
  }

  if (error) {
    return (
      <StructureImage>
        <ErrorMessage>{error}</ErrorMessage>
      </StructureImage>
    );
  }

  return (
    <StructureImage>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`Chemical structure of ${label}`}
          title={`SMILES: ${smiles}`}
        />
      )}
    </StructureImage>
  );
};

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
                    {structure.format === 'smiles' && (
                      <StructureRenderer
                        smiles={structure.data}
                        label={structure.label || `構造 ${index + 1}`}
                      />
                    )}
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
