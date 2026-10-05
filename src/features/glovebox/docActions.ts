import type { Api } from '@/data/api';
import type { VDocument } from '@/data/types';

async function fetchBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not fetch the file.');
  return res.blob();
}

export async function downloadDocument(api: Api, doc: VDocument) {
  const url = await api.signedUrl('documents', doc.file_path);
  const blob = await fetchBlob(url);
  const local = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = local;
  a.download = doc.file_name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(local), 10_000);
}

/** Shares the file itself where the device allows it (WhatsApp, email), otherwise downloads it. */
export async function shareDocument(api: Api, doc: VDocument, title: string): Promise<'shared' | 'downloaded'> {
  const url = await api.signedUrl('documents', doc.file_path);
  const blob = await fetchBlob(url);
  const file = new File([blob], doc.file_name, { type: doc.mime_type });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'shared';
    }
  }
  await downloadDocument(api, doc);
  return 'downloaded';
}

export async function openDocument(api: Api, doc: VDocument) {
  const url = await api.signedUrl('documents', doc.file_path);
  window.open(url, '_blank', 'noopener');
}
