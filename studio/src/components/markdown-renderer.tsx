
"use client";

import ReactMarkdown from 'react-markdown';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground">
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2" {...props} />,
          p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="my-1" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 pl-4 italic my-4" {...props} />,
          table: ({node, ...props}) => <Table className="my-4" {...props} />,
          thead: ({node, ...props}) => <TableHeader {...props} />,
          tbody: ({node, ...props}) => <TableBody {...props} />,
          tr: ({node, ...props}) => <TableRow {...props} />,
          th: ({node, ...props}) => <TableHead className="font-semibold" {...props} />,
          td: ({node, ...props}) => <TableCell {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
