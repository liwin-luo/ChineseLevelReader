'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks';
import { useState } from 'react';

export default function TestPage() {
  const { success, error, warning, info } = useToast();
  const [inputValue, setInputValue] = useState('');

  const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        success('这是一个成功消息！');
        break;
      case 'error':
        error('这是一个错误消息！');
        break;
      case 'warning':
        warning('这是一个警告消息！');
        break;
      case 'info':
        info('这是一个信息消息！');
        break;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">UI组件测试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 按钮测试 */}
        <Card>
          <CardHeader>
            <CardTitle>按钮组件测试</CardTitle>
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
        
        {/* 输入框测试 */}
        <Card>
          <CardHeader>
            <CardTitle>输入框组件测试</CardTitle>
            <CardDescription>不同状态的输入框</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              type="text" 
              placeholder="默认输入框" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input type="text" placeholder="禁用输入框" disabled />
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">当前输入值: {inputValue}</p>
          </CardFooter>
        </Card>
        
        {/* Toast测试 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Toast消息测试</CardTitle>
            <CardDescription>点击按钮显示不同类型的消息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => showToast('success')}>显示成功消息</Button>
              <Button onClick={() => showToast('error')}>显示错误消息</Button>
              <Button onClick={() => showToast('warning')}>显示警告消息</Button>
              <Button onClick={() => showToast('info')}>显示信息消息</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}