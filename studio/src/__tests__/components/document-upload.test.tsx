import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentUpload } from '@/components/document-upload';
import React from 'react';

vi.mock('@/components/ui/card', () => {
  const Card = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
    React.createElement('div', props, children);
  const CardContent = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const CardHeader = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const CardTitle = ({ children }: { children: React.ReactNode }) =>
    React.createElement('h3', null, children);
  const CardDescription = ({ children }: { children: React.ReactNode }) =>
    React.createElement('p', null, children);
  return { Card, CardContent, CardHeader, CardTitle, CardDescription };
});

vi.mock('lucide-react', () => ({
  Upload: () => React.createElement('span', null, 'Upload'),
  File: () => React.createElement('span', null, 'File'),
  Loader2: () => React.createElement('span', null, 'Loader'),
  CheckCircle2: () => React.createElement('span', null, 'Check'),
}));

describe('DocumentUpload', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('renders upload area', () => {
    render(React.createElement(DocumentUpload, { projectId: 'proj-1' }));
    expect(screen.getByText('Documents')).toBeTruthy();
    expect(screen.getByText('Upload files related to this project.')).toBeTruthy();
  });

  it('shows drop zone text', () => {
    render(React.createElement(DocumentUpload, { projectId: 'proj-1' }));
    expect(screen.getByText(/Drop a file here/)).toBeTruthy();
  });

  it('uploads file and calls onUploadComplete', async () => {
    const onUploadComplete = vi.fn();
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: true, url: 'https://example.com/file.pdf', filename: 'file.pdf' }),
    });

    const { container } = render(React.createElement(DocumentUpload, { projectId: 'proj-1', onUploadComplete }));

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/upload', expect.any(Object));
      expect(onUploadComplete).toHaveBeenCalledWith('https://example.com/file.pdf', 'file.pdf');
    });
  });
});
