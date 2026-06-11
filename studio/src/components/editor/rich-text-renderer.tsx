function renderNode(node: Record<string, any>): string {
  const { type, content, text, marks, attrs } = node;

  switch (type) {
    case "doc":
      return (content || []).map(renderNode).join("");

    case "paragraph": {
      const inner = (content || []).map(renderNode).join("");
      return inner ? `<p class="mb-4">${inner}</p>` : "<p class=\"mb-4\">&nbsp;</p>";
    }

    case "text": {
      let result = escapeHtml(text || "");
      if (marks) {
        for (const mark of marks) {
          switch (mark.type) {
            case "bold":
              result = `<strong>${result}</strong>`;
              break;
            case "italic":
              result = `<em>${result}</em>`;
              break;
            case "underline":
              result = `<u>${result}</u>`;
              break;
            case "strike":
              result = `<s>${result}</s>`;
              break;
            case "code":
              result = `<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">${result}</code>`;
              break;
            case "link":
              result = `<a href="${escapeAttr(mark.attrs?.href || "")}" class="text-primary underline underline-offset-2">${result}</a>`;
              break;
          }
        }
      }
      return result;
    }

    case "heading": {
      const level = attrs?.level || 2;
      const tag = `h${level}`;
      const sizes: Record<number, string> = {
        2: "font-headline text-2xl font-bold mt-10 mb-4",
        3: "font-headline text-xl font-semibold mt-8 mb-3",
        4: "font-headline text-lg font-semibold mt-6 mb-2",
      };
      const cls = sizes[level] || sizes[2];
      return `<${tag} class="${cls}">${(content || []).map(renderNode).join("")}</${tag}>`;
    }

    case "bulletList":
      return `<ul class="list-disc pl-6 mb-4 space-y-1">${(content || []).map(renderNode).join("")}</ul>`;

    case "orderedList":
      return `<ol class="list-decimal pl-6 mb-4 space-y-1">${(content || []).map(renderNode).join("")}</ol>`;

    case "listItem":
      return `<li>${(content || []).map(renderNode).join("")}</li>`;

    case "blockquote":
      return `<blockquote class="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground">${(content || []).map(renderNode).join("")}</blockquote>`;

    case "codeBlock": {
      const lang = attrs?.language ? ` lang="${escapeAttr(attrs.language)}"` : "";
      const code = (content || []).map(renderNode).join("");
      return `<pre class="bg-muted rounded-xl p-4 overflow-x-auto mb-4"><code${lang}>${code}</code></pre>`;
    }

    case "horizontalRule":
      return `<hr class="my-8 border-border/50" />`;

    case "image": {
      const src = escapeAttr(attrs?.src || "");
      const alt = escapeAttr(attrs?.alt || "");
      return `<img src="${src}" alt="${alt}" loading="lazy" class="rounded-xl w-full my-6" />`;
    }

    case "hardBreak":
      return "<br />";

    case "table":
      return `<table class="w-full border-collapse mb-4">${(content || []).map(renderNode).join("")}</table>`;

    case "tableRow":
      return `<tr>${(content || []).map(renderNode).join("")}</tr>`;

    case "tableHeader": {
      const align = attrs?.textAlign ? ` style="text-align:${escapeAttr(attrs.textAlign)}"` : "";
      return `<th class="border border-border/50 bg-muted/50 px-3 py-2 font-medium text-left"${align}>${(content || []).map(renderNode).join("")}</th>`;
    }

    case "tableCell": {
      const align = attrs?.textAlign ? ` style="text-align:${escapeAttr(attrs.textAlign)}"` : "";
      return `<td class="border border-border/50 px-3 py-2"${align}>${(content || []).map(renderNode).join("")}</td>`;
    }

    default:
      return (content || []).map(renderNode).join("");
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface RichTextRendererProps {
  content: Record<string, unknown> | null;
  className?: string;
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  if (!content) return null;

  let html: string;
  try {
    html = renderNode(content as Record<string, any>);
  } catch {
    return null;
  }

  return (
    <div
      className={`prose prose-neutral dark:prose-invert max-w-none ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
