# shadcn/ui 组件使用指南

## 概述

本项目已集成 shadcn/ui 组件库，提供了一套美观且功能丰富的 React 组件。

## 已集成的组件

1. Button（按钮）
2. Card（卡片）
3. Input（输入框）

## 如何使用

### 导入组件

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

### 使用 Button 组件

```tsx
// 基本用法
<Button>默认按钮</Button>

// 不同变体
<Button variant="secondary">次要按钮</Button>
<Button variant="destructive">危险按钮</Button>
<Button variant="outline">轮廓按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="link">链接按钮</Button>

// 不同大小
<Button size="sm">小按钮</Button>
<Button size="default">默认按钮</Button>
<Button size="lg">大按钮</Button>
```

### 使用 Card 组件

```tsx
<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>卡片描述</CardDescription>
  </CardHeader>
  <CardContent>
    <p>卡片内容</p>
  </CardContent>
  <CardFooter>
    <Button>底部按钮</Button>
  </CardFooter>
</Card>
```

### 使用 Input 组件

```tsx
// 基本用法
<Input type="text" placeholder="请输入内容" />

// 禁用状态
<Input type="text" placeholder="禁用输入框" disabled />
```

## 添加新组件

要添加新的 shadcn/ui 组件，请使用以下命令：

```bash
npx shadcn-ui@latest add [component-name]
```

例如：

```bash
npx shadcn-ui@latest add dialog
```

## 自定义主题

本项目已配置 shadcn/ui 的 CSS 变量，可以在 [globals.css](file:///c%3A/Users/PC/Desktop/S01/ChineseLevelReader/src/app/globals.css) 文件中找到相关定义。您可以根据需要修改这些变量来自定义主题颜色。

## 注意事项

1. 所有使用 shadcn/ui 组件的文件都需要添加 `'use client'` 指令
2. 确保已安装所有必要的依赖项
3. 组件样式基于 Tailwind CSS，确保 Tailwind 配置正确