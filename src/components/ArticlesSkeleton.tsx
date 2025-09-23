import { Card, CardContent } from '@/components/ui/card';

export default function ArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-6">
            {/* 头部信息骨架 */}
            <div className="flex items-center justify-between mb-3">
              <div className="w-16 h-5 bg-gray-200 rounded"></div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>

            {/* 标题骨架 */}
            <div className="space-y-2 mb-3">
              <div className="w-full h-5 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
            </div>

            {/* 内容摘要骨架 */}
            <div className="space-y-2 mb-4">
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
            </div>

            {/* 标签骨架 */}
            <div className="flex gap-1 mb-4">
              <div className="w-12 h-6 bg-gray-200 rounded"></div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
              <div className="w-14 h-6 bg-gray-200 rounded"></div>
            </div>

            {/* 底部信息骨架 */}
            <div className="flex items-center justify-between">
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}