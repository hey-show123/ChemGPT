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

export interface ChemicalStructure {
  format: 'smiles' | 'ket' | 'inchi' | 'molfile';
  data: string;
  label?: string;
  action: 'add' | 'replace';
}

export type AIModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'o1-preview'
  | 'o1-mini'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-opus-20240229'
  | 'claude-3-haiku-20240307'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash';

export interface AIModelConfig {
  id: AIModel;
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  endpoint: string;
  description: string;
}

export interface AIResponse {
  message: string;
  structures?: ChemicalStructure[];
  suggestions?: string[];
  success: boolean;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  structures: ChemicalStructure[];
  timestamp: Date;
}

export class AIService {
  // eslint-disable-next-line no-use-before-define
  private static instance: AIService | undefined;
  private currentModel: AIModel = 'gpt-3.5-turbo';

  // AIモデル設定
  private readonly modelConfigs: Record<AIModel, AIModelConfig> = {
    'gpt-4o': {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      description: 'マルチモーダル対応、画像と化学構造の統合分析に最適',
    },
    'gpt-4o-mini': {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      description: '高速・低コスト、基本的な化学構造生成に最適',
    },
    'gpt-4-turbo': {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      description: '高性能で高速、複雑な化学分析に最適',
    },
    'gpt-3.5-turbo': {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      description: 'コスト効率が良く、日常的な化学構造生成に最適',
    },
    'o1-preview': {
      id: 'o1-preview',
      name: 'O1 Preview',
      provider: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      description: '推論特化モデル、複雑な化学反応メカニズム解析に特化',
    },
    'o1-mini': {
      id: 'o1-mini',
      name: 'O1 Mini',
      provider: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      description: '推論特化型コンパクト版、効率的な反応予測',
    },
    'claude-3-5-sonnet-20241022': {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      endpoint: 'https://api.anthropic.com/v1/messages',
      description: 'Anthropicの最新最高性能モデル、詳細な化学分析に最適',
    },
    'claude-3-opus-20240229': {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      endpoint: 'https://api.anthropic.com/v1/messages',
      description: '高性能モデル、複雑な化学構造解析に最適',
    },
    'claude-3-haiku-20240307': {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      endpoint: 'https://api.anthropic.com/v1/messages',
      description: '高速で効率的、基本的な化学タスクに最適',
    },
    'gemini-1.5-pro': {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      endpoint:
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent',
      description: 'Googleの高性能モデル、複雑な化学分析に最適',
    },
    'gemini-1.5-flash': {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'google',
      endpoint:
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
      description: '高速レスポンス、リアルタイム対話に最適',
    },
  };

  private constructor() {
    // デフォルトモデル設定
    console.log('AIService constructor - Environment variables:', {
      REACT_APP_DEFAULT_AI_MODEL: process.env.REACT_APP_DEFAULT_AI_MODEL,
      REACT_APP_USE_MOCK_AI: process.env.REACT_APP_USE_MOCK_AI,
      REACT_APP_OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY
        ? 'SET'
        : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      allEnvVars: Object.keys(process.env).filter((key) =>
        key.startsWith('REACT_APP_'),
      ),
    });

    const defaultModel =
      (process.env.REACT_APP_DEFAULT_AI_MODEL as AIModel) || 'gpt-3.5-turbo';
    this.currentModel = defaultModel;
    console.log('AIService initialized with model:', this.currentModel);
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * 利用可能なAIモデル一覧を取得
   */
  public getAvailableModels(): AIModelConfig[] {
    return Object.values(this.modelConfigs);
  }

  /**
   * 現在のAIモデルを取得
   */
  public getCurrentModel(): AIModel {
    return this.currentModel;
  }

  /**
   * AIモデルを設定
   */
  public setCurrentModel(model: AIModel): void {
    if (this.modelConfigs[model]) {
      this.currentModel = model;
    }
  }

  /**
   * 現在のモデル設定を取得
   */
  private getCurrentModelConfig(): AIModelConfig {
    return this.modelConfigs[this.currentModel];
  }

  /**
   * プロバイダー別のAPIキーを取得
   */
  private getApiKey(
    provider: 'openai' | 'anthropic' | 'google',
  ): string | undefined {
    switch (provider) {
      case 'openai':
        return process.env.REACT_APP_OPENAI_API_KEY;
      case 'anthropic':
        return process.env.REACT_APP_ANTHROPIC_API_KEY;
      case 'google':
        return process.env.REACT_APP_GOOGLE_API_KEY;
      default:
        return undefined;
    }
  }

  /**
   * テキストプロンプトから化学構造を生成
   */
  async generateStructure(prompt: string): Promise<AIResponse> {
    try {
      console.log('AIService.generateStructure called with prompt:', prompt);
      const response = await this.callAI({
        type: 'generate_structure',
        prompt,
      });
      console.log('AIService.generateStructure response:', response);

      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AIService.generateStructure error:', error);
      return this.createErrorResponse(error);
    }
  }

  /**
   * 現在の構造を解析してAI応答を生成
   */
  async analyzeStructure(
    structureData: string,
    question?: string,
  ): Promise<AIResponse> {
    try {
      const response = await this.callAI({
        type: 'analyze_structure',
        structure: structureData,
        question: question || 'この化合物について教えてください',
      });

      return this.parseAIResponse(response);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  /**
   * 一般的な化学質問への回答
   */
  async askQuestion(question: string, context?: string): Promise<AIResponse> {
    try {
      const response = await this.callAI({
        type: 'general_chemistry',
        question,
        context,
      });

      return this.parseAIResponse(response);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  /**
   * 反応予測
   */
  async predictReaction(
    reactants: string[],
    conditions?: string,
  ): Promise<AIResponse> {
    try {
      const response = await this.callAI({
        type: 'predict_reaction',
        reactants,
        conditions: conditions || '',
      });

      return this.parseAIResponse(response);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  /**
   * AI APIへの実際の呼び出し
   */
  private async callAI(
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    try {
      console.log('AIService.callAI START - payload:', payload);

      // 環境変数でモック使用を制御
      const useMock = String(process.env.REACT_APP_USE_MOCK_AI) === 'true';

      console.log('AIService.callAI - decision:', {
        useMock,
        payload,
        env: process.env.NODE_ENV,
        REACT_APP_USE_MOCK_AI: process.env.REACT_APP_USE_MOCK_AI,
      });

      if (useMock) {
        console.log('AIService.callAI - Using mock AI response');
        const mockResult = await this.getMockResponse(payload);
        console.log('AIService.callAI - Mock result:', mockResult);
        return mockResult;
      }

      console.log('AIService.callAI - Using real API');
      const modelConfig = this.getCurrentModelConfig();
      const apiKey = this.getApiKey(modelConfig.provider);

      if (!apiKey) {
        throw new Error(`API key not found for ${modelConfig.provider}`);
      }

      // プロバイダー別のリクエスト形式に変換
      const { headers, body, endpoint } = this.prepareApiRequest(
        modelConfig,
        apiKey,
        payload,
      );

      console.log('Making API request to:', endpoint);
      console.log('Request headers:', headers);
      console.log('Request body:', JSON.stringify(body, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        mode: 'cors',
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(
          `${modelConfig.provider} API error: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const apiResponse = (await response.json()) as Record<string, unknown>;
      return this.convertFromApiResponse(
        apiResponse,
        modelConfig.provider,
        payload,
      );
    } catch (error) {
      console.error('AIService.callAI ERROR:', error);
      throw error;
    }
  }

  /**
   * プロバイダー別のAPIリクエストを準備
   */
  private prepareApiRequest(
    modelConfig: AIModelConfig,
    apiKey: string,
    payload: Record<string, unknown>,
  ): {
    headers: Record<string, string>;
    body: Record<string, unknown>;
    endpoint: string;
  } {
    const systemPrompt = this.buildSystemPrompt(payload.type as string);
    const userMessage = this.buildUserMessage(payload);

    switch (modelConfig.provider) {
      case 'openai':
        return {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: {
            model: modelConfig.id,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          },
          endpoint: modelConfig.endpoint,
        };

      case 'anthropic':
        return {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: {
            model: modelConfig.id,
            max_tokens: 1000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
          },
          endpoint: modelConfig.endpoint,
        };

      case 'google':
        return {
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\n${userMessage}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          },
          endpoint: `${modelConfig.endpoint}?key=${apiKey}`,
        };

      default:
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
    }
  }

  /**
   * システムプロンプトを構築
   */
  private buildSystemPrompt(type: string): string {
    const basePrompt =
      'あなたは専門的な化学知識を持つChemGPTアシスタントです。化学構造の生成、分析、化学反応の予測を正確に行います。';

    switch (type) {
      case 'generate_structure':
        return (
          basePrompt +
          `
          
化合物名から化学構造を生成する際は、以下のフォーマットで回答してください：

1. 化合物の概要説明（50-100文字）
2. 必ずSMILES形式で構造を提供（「SMILES: 」の後に正確な構造式）
3. 化学的特徴（分子式、分子量、主要官能基、用途など）
4. 安全性や取り扱い注意点（該当する場合）

例：
アスピリン（アセチルサリチル酸）は解熱・鎮痛・抗炎症作用を持つ代表的なNSAIDです。

SMILES: CC(=O)OC1=CC=CC=C1C(=O)O

【化学的特徴】
- 分子式: C9H8O4
- 分子量: 180.16 g/mol
- 主要官能基: エステル基、カルボキシル基、ベンゼン環
- 用途: 解熱鎮痛薬、血栓予防

【注意点】
胃腸障害のリスクがあるため、食後服用が推奨されます。`
        );
      case 'analyze_structure':
        return (
          basePrompt +
          `
          
化学構造を分析する際は、以下の項目について詳しく説明してください：

1. 構造の概要と化合物名（既知の場合）
2. 分子式と分子量
3. 主要な官能基とその特徴
4. 化学的性質（極性、酸性・塩基性、反応性など）
5. 生物活性や用途（既知の場合）
6. 合成方法や前駆体化合物
7. 安全性情報`
        );
      default:
        return (
          basePrompt +
          `
          
化学に関する質問には以下の点を考慮して回答してください：
- 正確な科学的根拠に基づく情報
- 分かりやすい説明と具体例
- 安全性や取り扱い注意点
- 関連する化合物や反応の提示
- 実用的な応用例や背景知識`
        );
    }
  }

  /**
   * ユーザーメッセージを構築
   */
  private buildUserMessage(payload: Record<string, unknown>): string {
    switch (payload.type) {
      case 'generate_structure':
        return `以下の化合物について、詳細な情報とSMILES構造式を生成してください：

化合物名: ${payload.prompt as string}

上記のフォーマットに従って、化合物の概要、SMILES構造式、化学的特徴、安全性情報を含む包括的な回答をお願いします。`;
      case 'analyze_structure':
        return `以下の化学構造について詳細な分析を行ってください：

構造データ: ${payload.structure as string}
分析要求: ${payload.question as string}

構造の特徴、化学的性質、用途、安全性について包括的に分析してください。`;
      default:
        return `以下の化学に関する質問にお答えください：

質問: ${
          (payload.prompt as string) ||
          (payload.question as string) ||
          '化学に関する一般的な質問'
        }

科学的根拠に基づき、分かりやすく詳細な説明をお願いします。`;
    }
  }

  /**
   * プロバイダー別のAPIレスポンスを内部形式に変換
   */
  private convertFromApiResponse(
    apiResponse: Record<string, unknown>,
    provider: 'openai' | 'anthropic' | 'google',
    originalPayload: Record<string, unknown>,
  ): Record<string, unknown> {
    let content = '';

    // プロバイダー別にレスポンスから内容を抽出
    switch (provider) {
      case 'openai':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content = (apiResponse.choices as any)?.[0]?.message?.content || '';
        break;
      case 'anthropic':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content = (apiResponse.content as any)?.[0]?.text || '';
        break;
      case 'google':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (apiResponse.candidates as any)?.[0]?.content?.parts?.[0]?.text || '';
        break;
    }

    // SMILES形式の構造を抽出（改善版）
    const smilesMatches = content.match(
      /SMILES:\s*([A-Za-z0-9@+\-[\]()=#/.]+)/gi,
    );

    const structures: ChemicalStructure[] = [];
    if (
      smilesMatches &&
      (originalPayload.type as string) === 'generate_structure'
    ) {
      smilesMatches.forEach((match, index) => {
        const smilesData = match.replace(/SMILES:\s*/i, '').trim();
        if (smilesData) {
          structures.push({
            format: 'smiles',
            data: smilesData,
            label: (originalPayload.prompt as string) || `構造 ${index + 1}`,
            action: 'add',
          });
        }
      });
    }

    // 賢い提案を生成
    const suggestions = this.generateSmartSuggestions(
      content,
      originalPayload,
      structures,
    );

    return {
      message: content,
      structures,
      suggestions,
    };
  }

  /**
   * 文脈に応じた賢い提案を生成
   */
  private generateSmartSuggestions(
    content: string,
    originalPayload: Record<string, unknown>,
    structures: ChemicalStructure[],
  ): string[] {
    const payloadType = originalPayload.type as string;
    const prompt = (originalPayload.prompt as string) || '';

    // 基本的な提案
    const baseSuggestions: string[] = [];

    if (payloadType === 'generate_structure' && structures.length > 0) {
      const compoundName = structures[0].label || prompt;
      baseSuggestions.push(
        `${compoundName}の反応性について教えて`,
        `${compoundName}の合成方法は？`,
        `${compoundName}の類似化合物を表示`,
      );

      // 化合物の種類に応じた特定の提案
      if (
        content.toLowerCase().includes('薬') ||
        content.toLowerCase().includes('医薬')
      ) {
        baseSuggestions.push(
          `${compoundName}の副作用は？`,
          `${compoundName}の作用機序は？`,
        );
      }
      if (
        content.toLowerCase().includes('有機溶媒') ||
        content.toLowerCase().includes('溶媒')
      ) {
        baseSuggestions.push(
          `${compoundName}の沸点は？`,
          `${compoundName}の毒性について`,
        );
      }
      if (
        content.toLowerCase().includes('触媒') ||
        content.toLowerCase().includes('catalyst')
      ) {
        baseSuggestions.push(
          `${compoundName}を使った反応例`,
          `${compoundName}の触媒活性`,
        );
      }
    } else if (payloadType === 'analyze_structure') {
      baseSuggestions.push(
        '類似構造の化合物は？',
        'この構造の合成方法は？',
        'この化合物の用途は？',
      );
    } else {
      baseSuggestions.push(
        '関連する化合物を表示',
        'この内容について詳しく',
        '実例を教えて',
      );
    }

    // 内容から関連キーワードを抽出して追加提案
    const keywords = this.extractChemicalKeywords(content);
    keywords.forEach((keyword) => {
      if (baseSuggestions.length < 5) {
        baseSuggestions.push(`${keyword}について詳しく`);
      }
    });

    return baseSuggestions.slice(0, 4); // 最大4つの提案
  }

  /**
   * 化学関連キーワードを抽出
   */
  private extractChemicalKeywords(content: string): string[] {
    const chemicalTerms = [
      'ベンゼン環',
      'カルボニル基',
      'ヒドロキシ基',
      'アミノ基',
      'カルボキシル基',
      'エステル基',
      'エーテル基',
      'アルデヒド基',
      'ケトン基',
      'ニトロ基',
      '芳香族',
      '脂肪族',
      '不飽和',
      '立体異性体',
      'エナンチオマー',
      '酸化反応',
      '還元反応',
      '付加反応',
      '置換反応',
      '脱離反応',
    ];

    return chemicalTerms.filter((term) => content.includes(term)).slice(0, 2);
  }

  /**
   * 開発用モックレスポンス
   */
  private getMockResponse(
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    console.log('AIService.getMockResponse START - payload:', payload);
    return new Promise((resolve) => {
      console.log(
        'AIService.getMockResponse - Promise created, setting timeout...',
      );
      setTimeout(() => {
        try {
          console.log(
            'AIService.getMockResponse - Timeout executed, processing payload...',
          );
          let response;
          switch (payload.type) {
            case 'generate_structure':
              console.log(
                'AIService.getMockResponse - generate_structure case',
              );
              response = this.getMockStructureResponse(
                payload.prompt as string,
              );
              break;
            case 'analyze_structure':
              console.log('AIService.getMockResponse - analyze_structure case');
              response = this.getMockAnalysisResponse();
              break;
            case 'general_chemistry':
              console.log('AIService.getMockResponse - general_chemistry case');
              response = this.getMockGeneralResponse(
                payload.question as string,
              );
              break;
            case 'predict_reaction':
              console.log('AIService.getMockResponse - predict_reaction case');
              response = this.getMockReactionResponse();
              break;
            default:
              console.log('AIService.getMockResponse - default case');
              response = this.getMockGeneralResponse(
                (payload.prompt as string) ||
                  (payload.question as string) ||
                  '質問',
              );
          }

          // レスポンスの検証
          if (!response || typeof response.message !== 'string') {
            console.error('Invalid mock response:', response);
            response = {
              message: 'モックレスポンスでエラーが発生しました',
              structures: [],
              suggestions: [],
            };
          }

          console.log(
            'AIService.getMockResponse - Generated response:',
            response,
          );
          console.log('AIService.getMockResponse - About to resolve...');
          resolve(response);
        } catch (error) {
          console.error('AIService.getMockResponse - ERROR in timeout:', error);
          const fallbackResponse = {
            message:
              'モックレスポンス生成中にエラーが発生しました。もう一度お試しください。',
            structures: [],
            suggestions: ['再試行', 'サポートに連絡'],
          };
          console.log(
            'AIService.getMockResponse - Resolving with fallback:',
            fallbackResponse,
          );
          resolve(fallbackResponse);
        }
      }, 800); // 短縮してレスポンスを早く
    });
  }

  private getMockStructureResponse(prompt: string): Record<string, unknown> {
    const responses = {
      アスピリン: {
        message:
          'アスピリン（アセチルサリチル酸）の構造を生成しました。この化合物は解熱・鎮痛・抗炎症作用を持つ代表的なNSAIDです。',
        structures: [
          {
            format: 'smiles',
            data: 'CC(=O)OC1=CC=CC=C1C(=O)O',
            label: 'アスピリン',
            action: 'add',
          },
        ],
        suggestions: [
          'この化合物の作用機序は？',
          'アスピリンの副作用について',
          '類似化合物を表示',
        ],
      },
      カフェイン: {
        message:
          'カフェイン（1,3,7-トリメチルキサンチン）の構造を生成しました。中枢神経刺激作用を持つアルカロイドです。',
        structures: [
          {
            format: 'smiles',
            data: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
            label: 'カフェイン',
            action: 'add',
          },
        ],
        suggestions: [
          'カフェインの薬理作用',
          'プリン骨格について',
          'メチル化の意味',
        ],
      },
    };

    // プロンプトに含まれるキーワードで判定
    for (const [keyword, response] of Object.entries(responses)) {
      if (prompt && prompt.includes(keyword)) {
        return response;
      }
    }

    // デフォルトレスポンス
    return {
      message: `「${
        prompt || '不明'
      }」について化学構造を検索しています。具体的な化合物名を教えていただけますか？`,
      structures: [],
      suggestions: ['アスピリンの構造', 'カフェインの構造', 'ベンゼンの構造'],
    };
  }

  private getMockAnalysisResponse(): Record<string, unknown> {
    return {
      message:
        'この化合物はベンゼン環を含む芳香族化合物です。分子量は約180で、酸性の性質を示します。',
      structures: [],
      suggestions: ['物性値を詳しく', '反応性について', '類似化合物'],
    };
  }

  private getMockGeneralResponse(question: string): Record<string, unknown> {
    return {
      message: `「${
        question || '不明'
      }」についてお答えします。化学に関するご質問でしたら、より具体的にお聞かせください。`,
      structures: [],
      suggestions: ['化合物の構造生成', '反応予測', '物性予測'],
    };
  }

  private getMockReactionResponse(): Record<string, unknown> {
    return {
      message: '反応予測を実行しました。以下の生成物が予想されます：',
      structures: [
        {
          format: 'smiles',
          data: 'CC(=O)O',
          label: '生成物1',
          action: 'add',
        },
      ],
      suggestions: ['反応機構の詳細', '副生成物について', '反応条件の最適化'],
    };
  }

  /**
   * AI応答のパース
   */
  private parseAIResponse(response: Record<string, unknown>): AIResponse {
    console.log('parseAIResponse called with:', response);
    console.log('response.structures:', response.structures);
    console.log('response.structures type:', typeof response.structures);
    console.log(
      'response.structures is array:',
      Array.isArray(response.structures),
    );

    const result = {
      message: (response.message as string) || '',
      structures: (response.structures as ChemicalStructure[]) || [],
      suggestions: (response.suggestions as string[]) || [],
      success: true,
    };

    console.log('parseAIResponse result:', result);
    console.log('result.structures:', result.structures);
    console.log('result.structures length:', result.structures?.length);

    return result;
  }

  /**
   * エラーレスポンスの生成
   */
  private createErrorResponse(error: unknown): AIResponse {
    return {
      message:
        'AI サービスでエラーが発生しました。しばらくしてからもう一度お試しください。',
      structures: [],
      success: false,
      error: error instanceof Error ? error.message : String(error),
      suggestions: ['別の質問をする', 'サポートに連絡'],
    };
  }
}

export default AIService;
