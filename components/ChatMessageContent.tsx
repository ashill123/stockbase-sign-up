import React from 'react';

type Token = {
  type: 'text' | 'bold';
  value: string;
};

const parseInline = (text: string): Token[] => {
  const tokens: Token[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    tokens.push({ type: 'bold', value: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
};

const renderInline = (text: string, keyPrefix: string) =>
  parseInline(text).map((token, index) =>
    token.type === 'bold' ? (
      <strong key={`${keyPrefix}-b-${index}`} className="font-semibold text-brand-light">
        {token.value}
      </strong>
    ) : (
      <React.Fragment key={`${keyPrefix}-t-${index}`}>{token.value}</React.Fragment>
    )
  );

const bulletRegex = /^[-*•]\s+(.*)$/;
const numberedRegex = /^\d+\.\s+(.*)$/;

export const ChatMessageContent = ({ text }: { text: string }) => {
  const lines = text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let keyIndex = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`ul-${keyIndex++}`} className="list-disc pl-5 space-y-1">
        {listItems}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    const bulletMatch = trimmed.match(bulletRegex) || trimmed.match(numberedRegex);
    if (bulletMatch) {
      listItems.push(<li key={`li-${keyIndex++}`}>{renderInline(bulletMatch[1], `li-${keyIndex}`)}</li>);
      return;
    }

    flushList();
    elements.push(
      <p key={`p-${keyIndex++}`} className="leading-relaxed">
        {renderInline(trimmed, `p-${keyIndex}`)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-2">{elements}</div>;
};
