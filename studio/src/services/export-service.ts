import jsPDF from 'jspdf';

interface ExportOptions {
  title: string;
  content: string;
  format: 'pdf' | 'docx' | 'md';
}

function stripMarkdown(md: string): string {
  return md
    .replace(/^###\s+(.*)$/gm, '$1\n' + '-'.repeat(40))
    .replace(/^##\s+(.*)$/gm, '$1\n' + '-'.repeat(40))
    .replace(/^#\s+(.*)$/gm, '$1\n' + '-'.repeat(40))
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '  ')
    .replace(/\|{2,}/g, '')
    .replace(/^[\s]*\|[\s]*[-:]+\|.*$/gm, '')
    .replace(/^[\s]*\|/gm, '')
    .replace(/\|[\s]*$/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .split('\n')
    .filter(line => line.trim() || line === '')
    .join('\n');
}

function splitIntoLines(text: string, maxWidth: number, charWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push('');
      continue;
    }
    const charsPerLine = Math.floor(maxWidth / charWidth);
    let remaining = para;
    while (remaining.length > charsPerLine) {
      let breakPoint = remaining.lastIndexOf(' ', charsPerLine);
      if (breakPoint < 0) breakPoint = charsPerLine;
      lines.push(remaining.slice(0, breakPoint));
      remaining = remaining.slice(breakPoint).trim();
    }
    if (remaining) lines.push(remaining);
  }
  return lines;
}

function exportPdf(title: string, content: string): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  const charWidth = 2.5;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const titleLines = splitIntoLines(title, maxWidth, 4);
  for (const line of titleLines) {
    doc.text(line, margin, y);
    y += 8;
  }
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const plain = stripMarkdown(content);
  const bodyLines = splitIntoLines(plain, maxWidth, charWidth);

  for (const line of bodyLines) {
    if (y > 280) {
      doc.addPage();
      y = margin;
    }
    if (line === '') {
      y += 4;
    } else if (line.startsWith('-'.repeat(10))) {
      doc.setFont('helvetica', 'bold');
      doc.text(line, margin, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
    } else {
      doc.text(line, margin, y);
      y += 5;
    }
  }

  doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.pdf`);
}

async function exportDocx(title: string, content: string): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import('docx');
  const plain = stripMarkdown(content);
  const paragraphs: any[] = [];

  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  );

  const lines = plain.split('\n');
  for (const line of lines) {
    if (line.startsWith('-'.repeat(10))) {
      continue;
    }
    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
      continue;
    }
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: line, size: 22 })],
        spacing: { after: 120 },
      }),
    );
  }

  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportMd(title: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportContent(options: ExportOptions): Promise<void> {
  switch (options.format) {
    case 'pdf':
      exportPdf(options.title, options.content);
      break;
    case 'docx':
      await exportDocx(options.title, options.content);
      break;
    case 'md':
      exportMd(options.title, options.content);
      break;
  }
}
