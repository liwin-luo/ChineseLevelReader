import { RSSFeed } from '@/types';
import { parseStringPromise } from 'xml2js';

// RSS服务类
export class RSSService {
  private readonly rssUrl: string;

  constructor(rssUrl: string = 'https://www.geekpark.net/rss') {
    this.rssUrl = rssUrl;
  }

  /**
   * 获取RSS feed数据
   */
  async fetchRSSFeed(): Promise<RSSFeed[]> {
    try {
      // 在开发环境中，我们模拟RSS数据，因为直接请求可能会遇到CORS问题
      if (process.env.NODE_ENV === 'development') {
        return this.getMockRSSData();
      }

      // 生产环境中的实际RSS获取逻辑
      const response = await fetch(this.rssUrl, {
        headers: {
          'User-Agent': 'Chinese Level Reader Bot 1.0',
        },
        next: { revalidate: 3600 }, // 1小时缓存
      });

      if (!response.ok) {
        throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`);
      }

      const xmlData = await response.text();
      return this.parseRSSXML(xmlData);
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      // 发生错误时返回模拟数据
      return this.getMockRSSData();
    }
  }

  /**
   * 解析RSS XML数据
   */
  private async parseRSSXML(xmlData: string): Promise<RSSFeed[]> {
    try {
      const result = await parseStringPromise(xmlData);
      const items = result.rss?.channel?.[0]?.item || [];

      return items.map((item: any) => ({
        title: this.cleanText(item.title?.[0] || ''),
        description: this.cleanText(item.description?.[0] || ''),
        link: item.link?.[0] || '',
        pubDate: item.pubDate?.[0] || '',
        content: this.extractContent(item),
        guid: item.guid?.[0]?._ || item.guid?.[0] || item.link?.[0] || '',
      }));
    } catch (error) {
      console.error('Error parsing RSS XML:', error);
      throw new Error('Failed to parse RSS XML');
    }
  }

  /**
   * 提取文章内容
   */
  private extractContent(item: any): string {
    // 尝试从多个可能的字段获取内容
    const contentFields = [
      item['content:encoded']?.[0],
      item.description?.[0],
      item.summary?.[0],
      item.content?.[0]
    ];

    for (const field of contentFields) {
      if (field && typeof field === 'string' && field.length > 50) {
        return this.cleanContent(field);
      }
    }

    return this.cleanText(item.title?.[0] || '');
  }

  /**
   * 清理HTML标签和特殊字符
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .replace(/&[a-zA-Z0-9#]+;/g, ' ') // 移除HTML实体
      .replace(/\\s+/g, ' ') // 合并多余空格
      .trim();
  }

  /**
   * 清理文章内容
   */
  private cleanContent(content: string): string {
    return content
      .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '') // 移除script标签
      .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, '') // 移除style标签
      .replace(/<[^>]*>/g, ' ') // 移除其他HTML标签
      .replace(/&[a-zA-Z0-9#]+;/g, ' ') // 移除HTML实体
      .replace(/\\s+/g, ' ') // 合并多余空格
      .replace(/\n\\s*\n/g, '\n') // 合并多余换行
      .trim()
      .substring(0, 2000); // 限制长度
  }

  /**
   * 模拟RSS数据（用于开发和测试）
   */
  private getMockRSSData(): RSSFeed[] {
    return [
      {
        title: \"ChatGPT推出新功能：支持实时语音对话\",
        description: \"OpenAI宣布ChatGPT新增实时语音对话功能，用户可以通过语音与AI进行自然对话，这标志着人工智能交互方式的重大突破。\",
        link: \"https://www.geekpark.net/news/334567\",
        pubDate: new Date().toISOString(),
        content: \"OpenAI今日宣布，ChatGPT新增了实时语音对话功能，这一突破性功能允许用户通过语音与AI进行自然、流畅的对话。新功能采用了最新的语音识别和生成技术，能够实现低延迟的实时交互。用户只需点击麦克风按钮，就可以开始语音对话，ChatGPT会实时理解用户的语音输入并给出相应的语音回复。这项技术的推出，标志着人工智能交互方式从文本向更自然的语音交互的重大转变。据OpenAI透露，该功能将首先向ChatGPT Plus用户开放，随后逐步向所有用户推广。\",
        guid: \"geekpark-334567\"
      },
      {
        title: \"苹果发布iOS 18：AI功能全面升级\",
        description: \"苹果在WWDC上发布了iOS 18，其中AI功能得到全面升级，包括更智能的Siri、个人化助手功能等。\",
        link: \"https://www.geekpark.net/news/334568\",
        pubDate: new Date(Date.now() - 86400000).toISOString(), // 1天前
        content: \"在今年的WWDC大会上，苹果正式发布了iOS 18，这是iPhone操作系统的又一次重大更新。本次更新的最大亮点是AI功能的全面升级。新版Siri变得更加智能，能够理解更复杂的语音指令，并且支持跨应用操作。个人化助手功能可以根据用户的日常习惯和偏好，主动提供相关建议和提醒。此外，iOS 18还新增了智能写作助手，可以帮助用户改善文本表达，支持多种语言的语法检查和风格优化。苹果表示，所有AI功能都在设备本地运行，确保用户隐私安全。iOS 18预计将在今年秋季正式推送给用户。\",
        guid: \"geekpark-334568\"
      },
      {
        title: \"特斯拉机器人Optimus最新进展：已能完成复杂任务\",
        description: \"特斯拉展示了其人形机器人Optimus的最新进展，机器人已经能够完成折叠衣物、整理物品等复杂任务。\",
        link: \"https://www.geekpark.net/news/334569\",
        pubDate: new Date(Date.now() - 172800000).toISOString(), // 2天前
        content: \"特斯拉CEO埃隆·马斯克在社交媒体上分享了人形机器人Optimus的最新演示视频。视频显示，Optimus已经能够独立完成折叠衣物、整理桌面物品、甚至是简单的烹饪准备工作等复杂任务。相比早期只能进行简单动作的版本，当前的Optimus在动作精确度、平衡能力和任务理解方面都有了显著提升。马斯克表示，Optimus采用了与特斯拉自动驾驶相同的AI技术栈，通过大量的视觉数据训练，使机器人能够理解和适应复杂的环境。特斯拉计划在2025年开始小规模生产Optimus，初期主要用于工厂自动化，未来将逐步进入家庭服务领域。预计售价将控制在2万美元左右。\",
        guid: \"geekpark-334569\"
      },
      {
        title: \"微软Azure AI服务新突破：多模态理解能力大幅提升\",
        description: \"微软宣布Azure AI服务在多模态理解方面取得重大突破，能够同时处理文本、图像、音频等多种数据类型。\",
        link: \"https://www.geekpark.net/news/334570\",
        pubDate: new Date(Date.now() - 259200000).toISOString(), // 3天前
        content: \"微软在Build 2024开发者大会上宣布，Azure AI服务在多模态理解能力方面取得了重大突破。新的AI模型能够同时处理文本、图像、音频、视频等多种数据类型，并理解它们之间的关联关系。这意味着开发者可以构建更加智能的应用，比如能够理解视频内容并生成文字描述的应用，或者能够根据图片和文字描述生成相应音频解说的系统。微软表示，这项技术基于Transformer架构的最新发展，通过大规模的多模态数据训练实现。新服务已经在Azure平台上线，开发者可以通过API接口调用。微软还展示了几个应用案例，包括智能客服机器人、内容创作助手和教育辅助工具等。\",
        guid: \"geekpark-334570\"
      },
      {
        title: \"字节跳动发布AI绘画工具：挑战Midjourney和DALL-E\",
        description: \"字节跳动推出了自主研发的AI绘画工具，在图像生成质量和中文理解能力方面表现出色，直接挑战国外同类产品。\",
        link: \"https://www.geekpark.net/news/334571\",
        pubDate: new Date(Date.now() - 345600000).toISOString(), // 4天前
        content: \"字节跳动正式发布了其自主研发的AI绘画工具——PixelDance，这是一款基于扩散模型的图像生成工具。PixelDance在图像生成质量、中文提示词理解能力以及亚洲人物面孔生成方面表现出色，被认为是对Midjourney、DALL-E等国外产品的有力挑战。该工具支持多种艺术风格，包括写实、动漫、水彩、油画等，用户可以通过中文描述快速生成高质量图像。字节跳动表示，PixelDance采用了自研的多尺度扩散网络架构，在保证生成质量的同时大幅提升了生成速度。目前，PixelDance已经集成到字节旗下多个产品中，包括剪映、懂车帝等，为用户提供AI辅助创作功能。公司计划在未来几个月内向更多开发者开放API接口。\",
        guid: \"geekpark-334571\"
      }
    ];
  }

  /**
   * 获取最新的RSS条目
   */
  async getLatestItems(limit: number = 10): Promise<RSSFeed[]> {
    const allItems = await this.fetchRSSFeed();
    return allItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, limit);
  }

  /**
   * 根据关键词搜索RSS条目
   */
  async searchItems(keyword: string): Promise<RSSFeed[]> {
    const allItems = await this.fetchRSSFeed();
    const lowerKeyword = keyword.toLowerCase();
    
    return allItems.filter(item => 
      item.title.toLowerCase().includes(lowerKeyword) ||
      item.description.toLowerCase().includes(lowerKeyword) ||
      item.content.toLowerCase().includes(lowerKeyword)
    );
  }
}

// 创建全局RSS服务实例
export const rssService = new RSSService();