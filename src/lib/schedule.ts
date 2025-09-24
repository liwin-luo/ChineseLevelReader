import { rssToArticleService } from '@/lib/rssProcessor';
import { prismaStorage } from '@/lib/prisma';

// 定时任务服务
export class ScheduleService {
  private static instance: ScheduleService;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService();
    }
    return ScheduleService.instance;
  }

  /**
   * 启动定时任务
   */
  start(): void {
    if (this.isRunning) {
      console.log('Schedule service is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting schedule service...');
    
    // 立即执行一次
    this.executeRSSSync();
    
    // 设置每小时执行一次（生产环境可以改为每日）
    // 在实际生产环境中，建议设置为每日执行：24 * 60 * 60 * 1000
    const interval = 60 * 60 * 1000; // 1小时
    
    this.intervalId = setInterval(() => {
      this.executeRSSSync();
    }, interval);
    
    console.log(`Scheduled RSS sync to run every ${interval / 1000 / 60} minutes`);
  }

  /**
   * 停止定时任务
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Schedule service is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('Schedule service stopped');
  }

  /**
   * 执行RSS同步任务
   */
  private async executeRSSSync(): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Starting RSS sync task`);
      
      const startTime = Date.now();
      const newArticles = await rssToArticleService.processRSSFeed();
      const duration = Date.now() - startTime;
      
      console.log(
        `[${new Date().toISOString()}] RSS sync completed: ` +
        `${newArticles.length} new articles processed in ${duration}ms`
      );
      
      // 获取统计信息
      const stats = await prismaStorage.getStatistics();
      console.log(
        `Total articles: ${stats.totalArticles}, ` +
        `Easy: ${stats.articlesByDifficulty.easy}, ` +
        `Medium: ${stats.articlesByDifficulty.medium}, ` +
        `Hard: ${stats.articlesByDifficulty.hard}`
      );
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] RSS sync task failed:`, error);
    }
  }

  /**
   * 手动触发RSS同步
   */
  async triggerRSSSync(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      console.log('Manual RSS sync triggered');
      const newArticles = await rssToArticleService.processRSSFeed();
      
      return {
        success: true,
        count: newArticles.length
      };
    } catch (error) {
      console.error('Manual RSS sync failed:', error);
      return {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 获取服务状态
   */
  getStatus(): {
    isRunning: boolean;
    nextRun?: string;
    uptime?: number;
  } {
    return {
      isRunning: this.isRunning,
      nextRun: this.isRunning && this.intervalId ? 
        new Date(Date.now() + 60 * 60 * 1000).toISOString() : undefined,
      uptime: this.isRunning ? Date.now() : undefined
    };
  }

  /**
   * 清理历史数据（可选功能）
   */
  async cleanupOldArticles(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const allArticles = await prismaStorage.getAllArticles();
      const articlesToDelete = allArticles.filter(
        article => new Date(article.publishDate) < cutoffDate
      );
      
      let deletedCount = 0;
      for (const article of articlesToDelete) {
        const success = await prismaStorage.deleteArticle(article.id);
        if (success) {
          deletedCount++;
        }
      }
      
      console.log(
        `Cleanup completed: ${deletedCount} old articles deleted ` +
        `(older than ${daysToKeep} days)`
      );
      
      return deletedCount;
    } catch (error) {
      console.error('Cleanup failed:', error);
      return 0;
    }
  }
}

// 导出单例实例
export const scheduleService = ScheduleService.getInstance();

// 在服务器启动时自动启动定时任务（仅在服务器环境）
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // 延迟启动，给应用初始化时间
  setTimeout(() => {
    scheduleService.start();
  }, 10000); // 10秒后启动
}

// 简单的Cron表达式解析器（用于更复杂的调度）
export class SimpleCron {
  /**
   * 解析简单的Cron表达式
   * 支持格式：\"* * * * *\" (分 时 日 月 周)
   * 示例：\"0 9 * * *\" = 每天上午9点
   */
  static parse(cronExpression: string): {
    minute: number;
    hour: number;
    day: number;
    month: number;
    weekday: number;
  } | null {
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) {
      return null;
    }
    
    return {
      minute: parts[0] === '*' ? -1 : parseInt(parts[0]),
      hour: parts[1] === '*' ? -1 : parseInt(parts[1]),
      day: parts[2] === '*' ? -1 : parseInt(parts[2]),
      month: parts[3] === '*' ? -1 : parseInt(parts[3]),
      weekday: parts[4] === '*' ? -1 : parseInt(parts[4])
    };
  }
  
  /**
   * 检查当前时间是否匹配Cron表达式
   */
  static shouldRun(cronExpression: string, now: Date = new Date()): boolean {
    const cron = this.parse(cronExpression);
    if (!cron) return false;
    
    const minute = now.getMinutes();
    const hour = now.getHours();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const weekday = now.getDay();
    
    return (
      (cron.minute === -1 || cron.minute === minute) &&
      (cron.hour === -1 || cron.hour === hour) &&
      (cron.day === -1 || cron.day === day) &&
      (cron.month === -1 || cron.month === month) &&
      (cron.weekday === -1 || cron.weekday === weekday)
    );
  }
  
  /**
   * 计算下次运行时间
   */
  static getNextRunTime(cronExpression: string, from: Date = new Date()): Date | null {
    const cron = this.parse(cronExpression);
    if (!cron) return null;
    
    // 简化实现：只处理每日任务
    if (cron.hour !== -1 && cron.minute !== -1) {
      const next = new Date(from);
      next.setHours(cron.hour, cron.minute, 0, 0);
      
      // 如果时间已过，推到明天
      if (next <= from) {
        next.setDate(next.getDate() + 1);
      }
      
      return next;
    }
    
    return null;
  }
}