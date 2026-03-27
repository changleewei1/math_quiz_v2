import type { LineFlexMessage } from '@/lib/types/line';

function buildSimpleFlex(title: string, body: string): LineFlexMessage {
  return {
    type: 'flex',
    altText: title,
    contents: {
      type: 'bubble',
      size: 'mega',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: title,
            weight: 'bold',
            size: 'lg',
            color: '#111827',
          },
          {
            type: 'text',
            text: body,
            size: 'sm',
            color: '#374151',
            wrap: true,
          },
        ],
      },
    },
  };
}

export function buildFollowUpReminderMessage(args: {
  studentName: string;
  parentName?: string | null;
  statusLabel?: string;
}) {
  const text = `【跟進提醒】${args.studentName}${args.parentName ? `（家長：${args.parentName}）` : ''}今日需要追蹤，狀態：${args.statusLabel ?? '待跟進'}。`;
  return {
    message: buildSimpleFlex('跟進提醒', text),
    text,
  };
}

export function buildTrialReminderMessage(args: {
  studentName: string;
  courseName: string;
  trialDateTime: string;
  isParent?: boolean;
}) {
  const text = args.isParent
    ? `提醒您，孩子明天將參加「${args.courseName}」試聽（${args.trialDateTime}）。若需協助可直接與我們聯繫。`
    : `【試聽提醒】${args.studentName}將於明天 ${args.trialDateTime} 參加${args.courseName}試聽，請提前確認出席。`;

  return {
    message: buildSimpleFlex('試聽提醒', text),
    text,
  };
}

export function buildPostTrialReminderMessage(args: {
  studentName: string;
  daysAfter: number;
}) {
  const text = `【試聽後跟進】${args.studentName}已完成試聽，已超過 ${args.daysAfter} 天尚未報名，建議今日安排追蹤。`;
  return {
    message: buildSimpleFlex('試聽後跟進', text),
    text,
  };
}

export function buildQuizCompletionReminderMessage(args: { count: number }) {
  const text = `【名單提醒】有 ${args.count} 位學生已完成弱點分析但尚未聯絡，建議優先追蹤。`;
  return {
    message: buildSimpleFlex('名單提醒', text),
    text,
  };
}

export function buildCustomMessage(body: string) {
  return {
    message: buildSimpleFlex('訊息通知', body),
    text: body,
  };
}

export function buildWelcomeMessage() {
  const text = '歡迎加入！請輸入綁定碼完成綁定。';
  return { message: buildSimpleFlex('歡迎加入', text), text };
}

export function buildBindSuccessMessage() {
  const text = '綁定成功！之後將收到重要提醒。';
  return { message: buildSimpleFlex('綁定完成', text), text };
}

export function buildBindErrorMessage(errorText: string) {
  const text = errorText;
  return { message: buildSimpleFlex('綁定失敗', text), text };
}

