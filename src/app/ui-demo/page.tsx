'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function UIDemoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">shadcn/ui 组件演示</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 按钮示例 */}
        <Card>
          <CardHeader>
            <CardTitle>按钮组件</CardTitle>
            <CardDescription>不同样式和大小的按钮</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>默认按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="destructive">危险按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
              <Button variant="link">链接按钮</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">小按钮</Button>
              <Button size="default">默认按钮</Button>
              <Button size="lg">大按钮</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* 输入框示例 */}
        <Card>
          <CardHeader>
            <CardTitle>输入框组件</CardTitle>
            <CardDescription>不同状态的输入框</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="text" placeholder="默认输入框" />
            <Input type="text" placeholder="禁用输入框" disabled />
          </CardContent>
        </Card>
        
        {/* 卡片示例 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>卡片组件</CardTitle>
            <CardDescription>包含标题、内容和底部的卡片</CardDescription>
          </CardHeader>
          <CardContent>
            <p>这是一个卡片内容示例。卡片组件可以包含标题、描述、内容和底部区域。</p>
          </CardContent>
          <CardFooter>
            <Button>卡片底部按钮</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}