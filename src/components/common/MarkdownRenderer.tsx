import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Простой и надежный парсер блоков Markdown
  const renderBlocks = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    let blockKey = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 1. Блок кода с тройными обратными кавычками
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim() || 'python';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // пропускаем закрывающий ```
        const codeText = codeLines.join('\n');
        const codeIndex = blockKey++;

        elements.push(
          <div
            key={`code-${codeIndex}`}
            className="my-4 rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-lg"
          >
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span className="text-indigo-400 font-semibold">{lang}</span>
              <button
                onClick={() => handleCopy(codeText, codeIndex)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="Скопировать код"
              >
                {copiedIndex === codeIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[10px]">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Копировать</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        continue;
      }

      // 2. Цитаты / Callout (> ...)
      if (line.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].startsWith('>')) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        elements.push(
          <div
            key={`quote-${blockKey++}`}
            className="my-3 pl-4 py-2 border-l-4 border-indigo-500 bg-indigo-950/20 text-indigo-200 text-xs rounded-r-lg italic"
          >
            {renderInline(quoteLines.join(' '))}
          </div>
        );
        continue;
      }

      // 3. Таблицы (| ... |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }

        const parseRow = (rowStr: string) =>
          rowStr
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());

        if (tableLines.length >= 2) {
          const header = parseRow(tableLines[0]);
          const rows = tableLines.slice(2).map(parseRow);

          elements.push(
            <div key={`table-${blockKey++}`} className="my-4 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                  <tr>
                    {header.map((col, cIdx) => (
                      <th key={cIdx} className="p-2.5 border-r border-slate-800/60 last:border-r-0">
                        {renderInline(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/30 transition">
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="p-2.5 text-slate-300 border-r border-slate-800/60 last:border-r-0"
                        >
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      // 4. Заголовки (#, ##, ###)
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${blockKey++}`} className="text-xl font-bold text-slate-100 mt-6 mb-3">
            {renderInline(line.slice(2))}
          </h1>
        );
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${blockKey++}`}
            className="text-lg font-bold text-slate-100 mt-5 mb-2.5 pb-1 border-b border-slate-800"
          >
            {renderInline(line.slice(3))}
          </h2>
        );
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${blockKey++}`} className="text-sm font-semibold text-indigo-300 mt-4 mb-2">
            {renderInline(line.slice(4))}
          </h3>
        );
        i++;
        continue;
      }

      // 5. Разделитель (---)
      if (line.trim() === '---') {
        elements.push(<hr key={`hr-${blockKey++}`} className="border-t border-slate-800 my-4" />);
        i++;
        continue;
      }

      // 6. Списки (- или * или 1.)
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listItems: string[] = [];
        while (
          i < lines.length &&
          (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))
        ) {
          listItems.push(lines[i].trim().slice(2));
          i++;
        }
        elements.push(
          <ul key={`ul-${blockKey++}`} className="my-2 space-y-1.5 pl-4 list-disc text-xs text-slate-300">
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // 7. Пустые строки
      if (!line.trim()) {
        i++;
        continue;
      }

      // 8. Обычный параграф
      elements.push(
        <p key={`p-${blockKey++}`} className="my-2 text-xs leading-relaxed text-slate-300">
          {renderInline(line)}
        </p>
      );
      i++;
    }

    return elements;
  };

  // Инлайн форматирование (**жирный**, `код`, математика/ссылки)
  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 bg-slate-950 text-indigo-300 border border-slate-800 rounded font-mono text-[11px] mx-0.5"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return <div className={`space-y-1 ${className}`}>{renderBlocks()}</div>;
};
