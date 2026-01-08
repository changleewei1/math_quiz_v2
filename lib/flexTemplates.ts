/**
 * LINE Flex Message 模板
 */

const BASE_URL = process.env.APP_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '') || '';

export interface ReportData {
  sessionId: string;
  chapterTitle: string;
  date: string;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
  imageUrl: string;
  topWeaknesses: Array<{
    typeCode: string;
    typeName: string;
    accuracy: number;
    recommendation: string;
    practiceUrl: string;
  }>;
}

/**
 * 生成弱點分析報告的 Flex Message
 */
export function createDiagnosticReportFlex(data: ReportData): any {
  const { sessionId, chapterTitle, date, totalQuestions, correctQuestions, accuracy, imageUrl, topWeaknesses } = data;

  // 格式化正確率
  const accuracyText = `${accuracy.toFixed(1)}%`;
  const accuracyColor = accuracy >= 80 ? '#00C851' : accuracy >= 60 ? '#FFBB33' : '#FF4444';

  // 生成弱點列表
  const weaknessBubbles = topWeaknesses.slice(0, 3).map((weakness) => ({
    type: 'box',
    layout: 'vertical',
    spacing: 'sm',
    contents: [
      {
        type: 'box',
        layout: 'baseline',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: weakness.typeCode,
            color: '#666666',
            size: 'sm',
            flex: 1,
          },
          {
            type: 'text',
            text: `${weakness.accuracy.toFixed(1)}%`,
            color: accuracyColor,
            size: 'sm',
            align: 'end',
          },
        ],
      },
      {
        type: 'text',
        text: weakness.typeName,
        wrap: true,
        color: '#333333',
        size: 'sm',
        weight: 'bold',
      },
      {
        type: 'text',
        text: weakness.recommendation,
        wrap: true,
        color: '#666666',
        size: 'xs',
        margin: 'sm',
      },
    ],
    margin: 'sm',
  }));

  return {
    type: 'flex',
    altText: `弱點分析報告 - ${chapterTitle}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '弱點分析報告',
            weight: 'bold',
            size: 'xl',
            color: '#FFFFFF',
          },
          {
            type: 'text',
            text: chapterTitle,
            size: 'sm',
            color: '#FFFFFF',
            margin: 'sm',
          },
          {
            type: 'text',
            text: date,
            size: 'xs',
            color: '#FFFFFFCC',
            margin: 'sm',
          },
        ],
        backgroundColor: '#1DB446',
        paddingAll: '20px',
      },
      hero: {
        type: 'image',
        url: imageUrl,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
        action: {
          type: 'uri',
          uri: `${BASE_URL}/report/${sessionId}`,
        },
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '總題數',
                    color: '#666666',
                    size: 'sm',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: `${totalQuestions} 題`,
                    color: '#333333',
                    size: 'sm',
                    align: 'end',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '正確題數',
                    color: '#666666',
                    size: 'sm',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: `${correctQuestions} 題`,
                    color: '#333333',
                    size: 'sm',
                    align: 'end',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '總正確率',
                    color: '#666666',
                    size: 'sm',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: accuracyText,
                    color: accuracyColor,
                    size: 'sm',
                    weight: 'bold',
                    align: 'end',
                  },
                ],
              },
            ],
            margin: 'lg',
          },
          {
            type: 'separator',
            margin: 'xl',
          },
          {
            type: 'text',
            text: '主要弱點',
            weight: 'bold',
            size: 'md',
            color: '#333333',
            margin: 'xl',
          },
          ...weaknessBubbles,
        ],
        paddingAll: '20px',
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          ...topWeaknesses.slice(0, 3).map((weakness) => ({
            type: 'button',
            style: 'link',
            height: 'sm',
            action: {
              type: 'uri',
              label: `練習 ${weakness.typeCode}`,
              uri: weakness.practiceUrl,
            },
          })),
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '查看完整報告',
              uri: `${BASE_URL}/report/${sessionId}`,
            },
            color: '#1DB446',
          },
        ],
        paddingAll: '20px',
      },
    },
  };
}

