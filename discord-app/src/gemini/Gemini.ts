const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();

/**
 * Geminiを使ってチャット機能を実装するためのクラス
 */
export default class Gemini {
  private readonly geminiApiKey = process.env.GEMINI_API_KEY;

  private genAI;

  private model;

  constructor() {
    this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * 235bot宛に来た質問に対してGeminiを使って回答文を生成
   *
   * @param {string} question 質問文
   * @param {string} introductionData geminiに読み込ませるための追加情報
   *
   * @throws {Error} Gemini APIの呼び出しに失敗した場合
   *
   * @return {Promise<string>} 回答文
   */
  async generateResponseForGemini(question: string, introductionData: string): Promise<string> {
    const prompt = `
    特定の人物の趣味や担当アイドルなどについての質問があった場合は、【自己紹介】の情報を参考にして回答してください。
    それ以外の質問については、あなたの知識を元に回答してください。
    最後に、回答する際は、1000文字以内で、できるだけ分かりやすく、かつ親しみやすい雰囲気で回答してください。

    自己紹介: ${introductionData}

    質問: ${question}
    `;

    try {
      const result = await this.model.generateContent(prompt);

      return result.response.text();
    } catch (error: any) {
      if (error.response?.status === 429) {
        return 'Gemini APIの利用上限に達してしまいました...orz\nしばらく時間を置いてから再度お試しください！';
      }

      throw new Error(`Gemini APIの呼び出しに失敗しました: ${error.message}`);
    }
  }
}
