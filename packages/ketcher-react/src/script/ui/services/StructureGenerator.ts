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

import { ChemicalStructure } from './AIService';
import { load } from '../state/shared';
import { ketcherProvider, ChemicalMimeType } from 'ketcher-core';

export interface StructureGenerationResult {
  success: boolean;
  error?: string;
  addedStructures?: number;
}

/**
 * AI生成構造をエディタに描画するためのユーティリティクラス
 * KetcherのOpen Structure機能と同様の実装
 */
export class StructureGenerator {
  constructor() {
    console.log('StructureGenerator created with Ketcher integration');
  }

  private getKetcherInstance() {
    try {
      // 毎回最新のKetcherインスタンスを取得
      const ketcher = ketcherProvider.getKetcher();
      console.log('Ketcher instance obtained:', !!ketcher);
      return ketcher;
    } catch (error) {
      console.error('Failed to get Ketcher instance:', error);
      return null;
    }
  }

  /**
   * AI応答から構造データを抽出してキャンバスに追加
   * Open StructureのAdd to Canvasボタンと完全に同じ実装
   */
  async addStructuresToCanvas(
    structures: ChemicalStructure[],
  ): Promise<StructureGenerationResult> {
    console.log('addStructuresToCanvas called with structures:', structures);

    if (!structures || structures.length === 0) {
      return { success: true, addedStructures: 0 };
    }

    // Redux stateを取得
    const state = (global as { currentState?: unknown }).currentState;
    if (!state) {
      console.error('Redux state not available');
      return {
        success: false,
        error: 'Redux state not available',
        addedStructures: 0,
      };
    }

    try {
      let addedCount = 0;

      for (const structure of structures) {
        console.log(`Adding structure: ${structure.label || 'Unnamed'}`, {
          format: structure.format,
          data: structure.data,
        });

        try {
          // フォーマットからMIMEタイプへの変換（Open.tsxと同じ）
          const inputFormat = this.getFormatMimeType(structure.format);

          console.log(`Using format: ${inputFormat}`);

          // Open StructureのcopyHandlerと完全に同じロジック
          // load(structStr, { fragment: true, 'input-format': format })
          // loadは文字列を受け取り、thunk関数を返す
          const loadAction = load(structure.data as unknown as any, {
            fragment: true,
            'input-format': inputFormat,
          });

          // Redux dispatchを模倣
          if (typeof loadAction === 'function') {
            await loadAction(
              (action: {
                type: string;
                action?: { tool: string; opts: unknown };
              }) => {
                console.log('StructureGenerator: Dispatching action:', action);
                // 実際のdispatch処理をここで行う
                if (
                  action.type === 'ACTION' &&
                  action.action?.tool === 'paste'
                ) {
                  console.log(
                    'StructureGenerator: Paste action detected',
                    action.action.opts,
                  );
                  // paste toolを実行
                  this.executePasteAction(action.action);
                }
              },
              () => state,
            );

            addedCount++;
            console.log(`Successfully added structure: ${structure.label}`);
          }
        } catch (structError) {
          console.error(
            `Failed to add structure ${structure.label}:`,
            structError,
          );
        }
      }

      return {
        success: addedCount > 0,
        addedStructures: addedCount,
        error: addedCount === 0 ? 'No structures could be added' : undefined,
      };
    } catch (error) {
      console.error('Error in addStructuresToCanvas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        addedStructures: 0,
      };
    }
  }

  private getFormatMimeType(format: string): string {
    // getFormatMimeTypeByFileName と同様のマッピング
    const formatMap: Record<string, string> = {
      smiles: ChemicalMimeType.DaylightSmiles,
      mol: ChemicalMimeType.Mol,
      sdf: ChemicalMimeType.SDF,
      rxn: ChemicalMimeType.Rxn,
      ket: ChemicalMimeType.KET,
      cml: ChemicalMimeType.CML,
      inchi: ChemicalMimeType.InChI,
    };

    return formatMap[format.toLowerCase()] || ChemicalMimeType.DaylightSmiles;
  }

  private executePasteAction(action: { tool: string; opts: unknown }) {
    try {
      const ketcher = this.getKetcherInstance();
      if (!ketcher) return;

      // pasteツールのアクションを実行
      const editor = (ketcher as unknown as any).editor;
      if (editor && action.opts) {
        console.log('Executing paste action with opts:', action.opts);
        // paste toolと同じ方法で構造を追加
        editor.selection(null); // 選択をクリア

        // ここでpasteツールの実際の処理を呼び出す
        // tools/paste.jsのactionと同じ処理
        const pasteAction = {
          tool: 'paste',
          opts: action.opts,
        };

        // toolのactionを実行
        editor.tool(pasteAction.tool, pasteAction.opts);
      }
    } catch (error) {
      console.error('Error executing paste action:', error);
    }
  }

  /**
   * 現在のキャンバス上の構造をKET形式で取得
   * AI分析のために使用
   */
  getCurrentStructureAsKet(): string | null {
    console.log('getCurrentStructureAsKet called');

    const ketcher = this.getKetcherInstance();
    if (!ketcher) {
      console.error('Ketcher instance not available');
      return null;
    }

    try {
      // 現在の構造をKET形式で取得
      const ketPromise = (ketcher as unknown as any).getKet();
      console.log('Retrieved KET structure promise:', ketPromise);

      // getKetは非同期の場合があるので適切に処理
      if (ketPromise && typeof ketPromise.then === 'function') {
        // Promiseの場合は同期処理では扱えないため、ここでは null を返す
        console.log('getKet returned a Promise, cannot handle synchronously');
        return null;
      }

      const ketString = ketPromise as string;
      console.log('Retrieved KET structure:', ketString ? 'success' : 'empty');
      return ketString || null;
    } catch (error) {
      console.error('Error getting current structure:', error);
      return null;
    }
  }
}

export default StructureGenerator;
