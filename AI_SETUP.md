# ChemGPT 多モデル AI 設定ガイド

## 🔧 複数AI APIの設定方法

### 1. 環境変数ファイルの編集

`/packages/ketcher-react/.env` ファイルを編集してください：

```bash
# ChemGPT Multi-AI Configuration

# デフォルト AI モデル
REACT_APP_DEFAULT_AI_MODEL=gpt-4o

# OpenAI API キー (ChatGPT)
REACT_APP_OPENAI_API_KEY=sk-proj-your-openai-key-here

# Anthropic API キー (Claude)
REACT_APP_ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Google API キー (Gemini)
REACT_APP_GOOGLE_API_KEY=your-google-api-key-here

# 開発中はモックを使う (true: モック, false: 実際のAPI)
REACT_APP_USE_MOCK_AI=false
```

### 2. 対応AI モデル

#### 🤖 OpenAI
- **GPT-4o**: マルチモーダル対応、画像と化学構造の統合分析に最適
- **GPT-4o Mini**: 高速・低コスト、基本的な化学構造生成に最適
- **GPT-4.1**: 最新最高性能モデル、化学分析に最適
- **GPT-4.1 Mini**: 高速で効率的、日常的な化学構造生成に最適
- **O3**: 最高レベル推論モデル、複雑な化学反応メカニズム解析に特化
- **O3-Mini**: 推論特化型、複雑な化学反応予測に特化

#### 🧠 Anthropic Claude
- **Claude Opus 4**: 最高性能モデル、詳細な化学分析
- **Claude Sonnet 4**: バランス型、汎用的な化学タスクに最適
- **Claude 3.7 Sonnet**: 高性能で実用的、構造解析に強い

#### 🔍 Google Gemini  
- **Gemini 2.5 Pro**: 最新プロモデル、マルチモーダル対応
- **Gemini 2.0 Flash**: 超高速レスポンス、リアルタイム対話に最適

### 3. UI でのモデル選択

AIパネル上部のドロップダウンからリアルタイムでモデルを切り替え可能：
- モデル名と説明が表示される
- 会話中でもモデル変更可能
- 各プロバイダーのAPIキーが自動で使用される

### 3. セキュリティ設定

- ✅ `.env`ファイルは`.gitignore`に含まれています
- ✅ APIキーがGitにコミットされることはありません
- ⚠️ APIキーはビルド後のJSファイルに含まれます（フロントエンド制限）

### 4. 使用方法

1. **開発モード** (モック使用):
   ```bash
   REACT_APP_USE_MOCK_AI=true
   npm run serve:standalone
   ```

2. **本番モード** (実際のAPI使用):
   ```bash
   REACT_APP_USE_MOCK_AI=false
   npm run build
   npm run serve:standalone
   ```

### 5. API形式

ChemGPTは以下の形式でAIと通信します：

#### 送信データ (OpenAI形式に自動変換)
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {"role": "system", "content": "化学の専門家として..."},
    {"role": "user", "content": "アスピリンの構造を教えて"}
  ]
}
```

#### 受信データ (内部形式に自動変換)
```json
{
  "message": "アスピリンの化学構造は...",
  "structures": [{
    "format": "smiles",
    "data": "CC(=O)OC1=CC=CC=C1C(=O)O",
    "label": "アスピリン",
    "action": "add"
  }]
}
```

### 6. トラブルシューティング

- **APIキーエラー**: `.env`ファイルのAPIキーを確認
- **CORS エラー**: APIエンドポイントのCORS設定を確認
- **レート制限**: API使用量制限に達していないか確認

### 7. より安全な設定 (推奨)

本格的な本番環境では、バックエンドサーバーを経由する方法を推奨：

```
フロントエンド → バックエンドサーバー → AI API
```

この場合、APIキーはサーバーサイドでのみ管理されます。