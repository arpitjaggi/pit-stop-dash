import { useCallback, useRef, useState } from 'react';
import { readDocument } from '@/lib/docread/read';

export type ReaderState =
  | { phase: 'idle' }
  | { phase: 'reading'; fraction: number; stage: string }
  | { phase: 'password'; wrong: boolean }
  | { phase: 'done'; method: 'pdf' | 'ocr'; text: string }
  | { phase: 'failed'; reason: string };

/** Reads a picked file on this device and reports how it is going. */
export function useDocumentReader() {
  const [state, setState] = useState<ReaderState>({ phase: 'idle' });
  const run = useRef(0);

  const read = useCallback(async (file: File, password?: string) => {
    const id = ++run.current;
    setState({ phase: 'reading', fraction: 0, stage: 'Opening the file' });
    const result = await readDocument(file, {
      password,
      onProgress: (fraction, stage) => id === run.current && setState({ phase: 'reading', fraction, stage }),
    });
    if (id !== run.current) return;
    if (result.status === 'ok') setState({ phase: 'done', method: result.method, text: result.text });
    else if (result.status === 'password') setState({ phase: 'password', wrong: result.wrong });
    else setState({ phase: 'failed', reason: result.reason });
  }, []);

  const reset = useCallback(() => {
    run.current++;
    setState({ phase: 'idle' });
  }, []);

  return { state, read, reset };
}
