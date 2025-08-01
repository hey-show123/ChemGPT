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

import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { Icon } from '../../../../components';

export interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
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
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  background-color: #f5f5f5;
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
  padding: 20px;
  overflow-y: auto;
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

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  return (
    <>
      <PanelContainer isOpen={isOpen}>
        <PanelHeader>
          <PanelTitle>
            <Icon name="ai-assistant" />
            AI アシスタント
          </PanelTitle>
          <CloseButton onClick={onClose} title="閉じる">
            <Icon name="close" />
          </CloseButton>
        </PanelHeader>
        <PanelContent>
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

            <p style={{ marginTop: '30px', color: '#999' }}>
              まもなくAI機能が利用可能になります
            </p>
          </WelcomeMessage>
        </PanelContent>
      </PanelContainer>
    </>
  );
};
