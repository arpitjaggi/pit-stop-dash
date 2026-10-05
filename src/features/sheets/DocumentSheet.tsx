import { useEffect, useRef, useState } from 'react';
import { useAddDocument, useDeleteDocument, useGarage, useUpdateDocument } from '@/data/hooks';
import { DOC_TYPES, type DocType } from '@/data/types';
import { todayISO } from '@/lib/dates';
import { formatBytes } from '@/lib/format';
import { DOCUMENT_SPEC, isImage, isPdf, prepareImage } from '@/lib/image';
import { guessDocType } from '@/lib/status';
import { Button, Choice, Field, Input, Notice, TextArea, friendlyError } from '@/ui/atoms';
import { Camera, FilePdf, UploadSimple } from '@/ui/icons';
import { rememberVehicle, useSheet, useToast } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { useNavigate } from 'react-router-dom';
import { useActiveVehicle } from './common';

const MAX_BYTES = 15 * 1024 * 1024;
const NAMED: DocType[] = ['warranty', 'extended_warranty', 'accessory_warranty', 'other'];
const DATE_HINT: Partial<Record<DocType, string>> = {
  insurance: 'Use the "valid till" date on the policy.',
  puc: 'Use the "valid upto" date on the certificate.',
  cng_certificate: 'Use the validity date on the certificate.',
};

/** Upload a document, or edit the details of one already in the Glovebox. */
export function DocumentSheet({ editing }: { editing?: boolean }) {
  const { vehicles, bundles } = useGarage();
  const v = useActiveVehicle(vehicles);
  const sheet = useSheet();
  const navigate = useNavigate();
  const toast = useToast();
  const add = useAddDocument();
  const update = useUpdateDocument();
  const del = useDeleteDocument();
  const existing = editing && v ? bundles.get(v.id)?.documents.find((d) => d.id === sheet.id) : undefined;
  const preType = !editing && sheet.id && DOC_TYPES.some((t) => t.value === sheet.id) ? (sheet.id as DocType) : null;

  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<DocType | null>(existing?.doc_type ?? preType);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [issuer, setIssuer] = useState(existing?.issuer ?? '');
  const [reference, setReference] = useState(existing?.reference_number ?? '');
  const [issued, setIssued] = useState(existing?.issued_on ?? '');
  const [expires, setExpires] = useState(existing?.expires_on ?? '');
  const [hasExpiry, setHasExpiry] = useState(existing ? Boolean(existing.expires_on) || existing.doc_type !== 'rc' : true);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const camera = useRef<HTMLInputElement>(null);
  const files = useRef<HTMLInputElement>(null);
  const today = todayISO();

  useEffect(() => {
    if (type === 'rc' && !existing) setHasExpiry(false);
    else if (type && type !== 'rc' && !existing) setHasExpiry(true);
  }, [type, existing]);

  if (!v) return null;

  function choose(f: File | undefined) {
    if (!f) return;
    setError(null);
    if (!isImage(f) && !isPdf(f)) return setError('Choose a photo or a PDF.');
    if (f.size > MAX_BYTES && isPdf(f)) return setError(`That PDF is ${formatBytes(f.size)}. The limit is 15 MB.`);
    setFile(f);
    if (!type) setType(guessDocType(f.name));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!existing && !file) return setError('Choose a photo or PDF first.');
    if (!type) return setError('What kind of document is it?');
    if (hasExpiry && issued && expires && expires < issued) return setError('The expiry date is before the issue date.');
    setError(null);
    setBusy(true);
    rememberVehicle(v!.id);
    const meta = {
      title: NAMED.includes(type) ? title.trim() || null : null,
      issuer: issuer.trim() || null,
      reference_number: reference.trim() || null,
      issued_on: issued || null,
      expires_on: hasExpiry && expires ? expires : null,
      notes: notes.trim() || null,
    };
    try {
      if (existing) {
        await update.mutateAsync({ id: existing.id, patch: { doc_type: type, ...meta } });
        toast('Saved.');
      } else {
        let blob: Blob = file!;
        let thumb: Blob | null = null;
        let mime = file!.type || 'application/pdf';
        let name = file!.name;
        if (isImage(file!)) {
          const img = await prepareImage(file!, DOCUMENT_SPEC);
          blob = img.full;
          thumb = img.thumb;
          mime = img.full.type;
          name = name.replace(/\.[^.]+$/, '') + (img.ext === 'webp' ? '.webp' : '.jpg');
        }
        await add.mutateAsync({ vehicle_id: v!.id, doc_type: type, ...meta, file: blob, file_name: name, mime_type: mime, thumb });
        toast('Filed in the Glovebox.');
      }
      sheet.close();
      if (!existing) window.setTimeout(() => navigate(`/vehicles/${v!.id}/glovebox`), 0);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      title={existing ? 'Document details' : 'Upload a document'}
      tall
      footer={
        <>
          <Button variant="primary" block type="submit" form="doc-form" busy={busy}>
            {existing ? 'Save changes' : 'Save to Glovebox'}
          </Button>
          {existing && (
            <Button
              variant="ghost"
              block
              onClick={async () => {
                await del.mutateAsync(existing.id);
                toast('Document removed.');
                sheet.close();
                navigate(`/vehicles/${v.id}/glovebox`, { replace: true });
              }}
            >
              Remove this document
            </Button>
          )}
        </>
      }
    >
      <form id="doc-form" className="stack" onSubmit={save} noValidate>
        <p className="t-ink-2">{v.make} {v.model}</p>

        {!existing && (
          <div className="filepick">
            {file ? (
              <div className="filepick__chosen">
                {isPdf(file) ? <FilePdf size={28} aria-hidden /> : <Camera size={28} aria-hidden />}
                <span className="filepick__name">
                  <span className="t-title">{file.name}</span>
                  <span className="t-ink-3">{formatBytes(file.size)}</span>
                </span>
                <Button variant="ghost" onClick={() => files.current?.click()}>Change</Button>
              </div>
            ) : (
              <div className="filepick__choices">
                <Button variant="primary" onClick={() => camera.current?.click()}>
                  <Camera size={20} aria-hidden /> Take a photo
                </Button>
                <Button variant="secondary" onClick={() => files.current?.click()}>
                  <UploadSimple size={20} aria-hidden /> Choose a file
                </Button>
              </div>
            )}
            <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { choose(e.target.files?.[0]); e.target.value = ''; }} />
            <input ref={files} type="file" accept="image/*,application/pdf" hidden onChange={(e) => { choose(e.target.files?.[0]); e.target.value = ''; }} />
          </div>
        )}

        <Choice legend="What is it?" value={(type ?? '') as DocType} onChange={setType} options={DOC_TYPES.map((t) => ({ value: t.value, label: t.label }))} />

        {type && NAMED.includes(type) && (
          <Field label={type === 'other' ? 'Name' : 'What does it cover?'} hint={type === 'accessory_warranty' ? 'For example: alloy wheels, music system.' : undefined}>
            {(p) => <Input {...p} placeholder={type === 'other' ? 'Pollution receipt, AMC, fitness certificate' : 'Optional'} value={title} onChange={(e) => setTitle(e.target.value)} />}
          </Field>
        )}
        <Field label="Issued by (optional)">{(p) => <Input {...p} placeholder="Insurer, RTO, test centre, dealer" value={issuer} onChange={(e) => setIssuer(e.target.value)} />}</Field>
        <Field label={type === 'insurance' ? 'Policy number (optional)' : 'Reference number (optional)'}>{(p) => <Input {...p} autoCapitalize="characters" value={reference} onChange={(e) => setReference(e.target.value)} />}</Field>
        <div className="field-row">
          <Field label="Issue date">{(p) => <Input {...p} type="date" max={today} value={issued} onChange={(e) => setIssued(e.target.value)} />}</Field>
          {hasExpiry && <Field label="Expiry date" hint={type ? DATE_HINT[type] : undefined}>{(p) => <Input {...p} type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />}</Field>}
        </div>
        {type === 'rc' && (
          <label className="check">
            <input type="checkbox" checked={hasExpiry} onChange={(e) => setHasExpiry(e.target.checked)} />
            <span>This RC shows a validity date</span>
          </label>
        )}
        <Field label="Notes (optional)">{(p) => <TextArea {...p} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />}</Field>
        {error && <Notice tone="error">{error}</Notice>}
      </form>
    </Sheet>
  );
}
