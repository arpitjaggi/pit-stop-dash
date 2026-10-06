import { useEffect, useMemo, useRef, useState } from 'react';
import { useAddDocument, useDeleteDocument, useGarage, useUpdateDocument, useUpdateVehicle } from '@/data/hooks';
import { DOC_TYPES, docTypeLabel, type DocType, type VehiclePatch } from '@/data/types';
import { todayISO } from '@/lib/dates';
import { vehicleFindings } from '@/lib/docread/findings';
import { parseDocument, type ParsedDocument } from '@/lib/docread/parse';
import { formatBytes } from '@/lib/format';
import { isImage, isPdf, prepareDocumentUpload } from '@/lib/image';
import { formatRegistration } from '@/lib/plate';
import { guessDocType } from '@/lib/status';
import { Button, Choice, Field, Input, Notice, TextArea, friendlyError } from '@/ui/atoms';
import { Camera, FilePdf, UploadSimple } from '@/ui/icons';
import { rememberVehicle, useSheet, useToast } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { useNavigate } from 'react-router-dom';
import { ReaderPanel } from '../shared/ReaderPanel';
import { useDocumentReader } from '../shared/useDocumentReader';
import { useActiveVehicle } from './common';

const MAX_BYTES = 15 * 1024 * 1024;
const NAMED: DocType[] = ['warranty', 'extended_warranty', 'accessory_warranty', 'other'];
const DATE_HINT: Partial<Record<DocType, string>> = {
  insurance: 'Use the "valid till" date on the policy.',
  puc: 'Use the "valid upto" date on the certificate.',
  cng_certificate: 'Use the validity date on the certificate.',
};
type FieldKey = 'issuer' | 'reference_number' | 'issued_on' | 'expires_on';
const READ_NOTE = 'Read from the file. Check it.';

/** Upload a document, or edit the details of one already in the Glovebox. */
export function DocumentSheet({ editing }: { editing?: boolean }) {
  const { vehicles, bundles } = useGarage();
  const v = useActiveVehicle(vehicles);
  const sheet = useSheet();
  const navigate = useNavigate();
  const toast = useToast();
  const add = useAddDocument();
  const update = useUpdateDocument();
  const updateVehicle = useUpdateVehicle();
  const del = useDeleteDocument();
  const reader = useDocumentReader();
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
  // What the reader found, and which fields the owner has since typed over.
  const [parsed, setParsed] = useState<ParsedDocument | null>(null);
  const touched = useRef(new Set<FieldKey>());
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const camera = useRef<HTMLInputElement>(null);
  const files = useRef<HTMLInputElement>(null);
  const today = todayISO();

  const text = reader.state.phase === 'done' ? reader.state.text : null;

  useEffect(() => {
    if (type === 'rc' && !existing) setHasExpiry(false);
    else if (type && type !== 'rc' && !existing) setHasExpiry(true);
  }, [type, existing]);

  // Whenever the words or the chosen kind change, read them again and fill what the owner has not typed.
  useEffect(() => {
    if (text == null || existing) return;
    const p = parseDocument(text, type);
    setParsed(p);
    if (!type && p.doc_type) setType(p.doc_type.value);
    const fill = (k: FieldKey, set: (s: string) => void) => {
      if (touched.current.has(k)) return;
      set(p[k]?.value ?? '');
    };
    fill('issuer', setIssuer);
    fill('reference_number', setReference);
    fill('issued_on', setIssued);
    fill('expires_on', setExpires);
  }, [text, type, existing]);

  const findings = useMemo(() => (parsed && v && type === 'rc' ? vehicleFindings(v, parsed.vehicle) : []), [parsed, v, type]);
  useEffect(() => {
    setAccepted(Object.fromEntries(findings.map((f) => [f.key, f.defaultOn])));
  }, [findings]);

  if (!v) return null;

  const detectedElsewhere = parsed?.doc_type && type && parsed.doc_type.confidence === 'high' && parsed.doc_type.value !== type ? parsed.doc_type.value : null;
  const otherPlate =
    parsed?.registration_number && v.registration_number && parsed.registration_number.value !== v.registration_number ? parsed.registration_number.value : null;
  const fromFile = (k: FieldKey, value: string) => Boolean(parsed?.[k] && !touched.current.has(k) && parsed[k]!.value === value && value);

  function choose(f: File | undefined) {
    if (!f) return;
    setError(null);
    if (!isImage(f) && !isPdf(f)) return setError('Choose a photo or a PDF.');
    if (f.size > MAX_BYTES && isPdf(f)) return setError(`That PDF is ${formatBytes(f.size)}. The limit is 15 MB.`);
    setFile(f);
    setParsed(null);
    touched.current.clear();
    if (!type) setType(guessDocType(f.name));
    void reader.read(f);
  }

  const edit = (k: FieldKey, set: (s: string) => void) => (e: { target: { value: string } }) => {
    touched.current.add(k);
    set(e.target.value);
  };

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
        const up = await prepareDocumentUpload(file!);
        const values: Record<FieldKey, string> = { issuer, reference_number: reference, issued_on: issued, expires_on: hasExpiry ? expires : '' };
        const extracted = (Object.keys(values) as FieldKey[]).filter((k) => fromFile(k, values[k]));
        await add.mutateAsync({
          vehicle_id: v!.id, doc_type: type, ...meta, file: up.blob, file_name: up.name, mime_type: up.mime, thumb: up.thumb,
          extracted_fields: extracted,
        });
        const patch: VehiclePatch = Object.assign({}, ...findings.filter((f) => accepted[f.key]).map((f) => f.patch));
        if (Object.keys(patch).length) {
          try {
            await updateVehicle.mutateAsync({ id: v!.id, patch });
            toast('Filed in the Glovebox, and the vehicle details updated.');
          } catch (err) {
            toast(`Filed, but the vehicle was not updated: ${friendlyError(err)}`);
          }
        } else toast('Filed in the Glovebox.');
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
          <Button variant="primary" block type="submit" form="doc-form" busy={busy} disabled={reader.state.phase === 'reading'}>
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

        {!existing && <ReaderPanel state={reader.state} onPassword={(pw) => file && reader.read(file, pw)} />}
        {!existing && reader.state.phase === 'done' && (
          <Notice>
            {parsed && (parsed.issuer || parsed.reference_number || parsed.issued_on || parsed.expires_on || findings.length)
              ? `Read from the ${reader.state.method === 'pdf' ? 'PDF text' : 'photo'}. Check each detail before saving.`
              : 'Nothing could be picked out of this file. Fill the details in by hand.'}
          </Notice>
        )}
        {otherPlate && (
          <Notice tone="error">
            This looks like it belongs to {formatRegistration(otherPlate)}, but this vehicle is {formatRegistration(v.registration_number!)}. Check you chose the right vehicle.
          </Notice>
        )}
        {detectedElsewhere && (
          <Notice>
            This reads like {docTypeLabel(detectedElsewhere).toLowerCase() === 'rc' ? 'an RC' : `a ${docTypeLabel(detectedElsewhere)}`}, not a {docTypeLabel(type!)}.{' '}
            <button type="button" className="linkbtn" onClick={() => setType(detectedElsewhere)}>Change it to {docTypeLabel(detectedElsewhere)}</button>
          </Notice>
        )}

        <Choice legend="What is it?" value={(type ?? '') as DocType} onChange={setType} options={DOC_TYPES.map((t) => ({ value: t.value, label: t.label }))} />

        {type && NAMED.includes(type) && (
          <Field label={type === 'other' ? 'Name' : 'What does it cover?'} hint={type === 'accessory_warranty' ? 'For example: alloy wheels, music system.' : undefined}>
            {(p) => <Input {...p} placeholder={type === 'other' ? 'Pollution receipt, AMC, fitness certificate' : 'Optional'} value={title} onChange={(e) => setTitle(e.target.value)} />}
          </Field>
        )}
        <div className="field-row">
          <Field label="Issue date" hint={fromFile('issued_on', issued) ? READ_NOTE : undefined}>
            {(p) => <Input {...p} type="date" max={today} value={issued} onChange={edit('issued_on', setIssued)} />}
          </Field>
          {hasExpiry && (
            <Field label="Expiry date" hint={fromFile('expires_on', expires) ? (parsed?.expires_on?.note ?? READ_NOTE) : type ? DATE_HINT[type] : undefined}>
              {(p) => <Input {...p} type="date" value={expires} onChange={edit('expires_on', setExpires)} />}
            </Field>
          )}
        </div>
        {type === 'rc' && (
          <label className="check">
            <input type="checkbox" checked={hasExpiry} onChange={(e) => setHasExpiry(e.target.checked)} />
            <span>This RC shows a validity date</span>
          </label>
        )}
        <details className="vform__more" open={Boolean(existing && (existing.issuer || existing.reference_number || existing.notes)) || Boolean(!existing && (issuer || reference))}>
          <summary className="t-title">More details (issuer, number, notes)</summary>
          <div className="vform__morebody">
            <Field label="Issued by" hint={fromFile('issuer', issuer) ? READ_NOTE : undefined}>
              {(p) => <Input {...p} placeholder="Insurer, RTO, test centre, dealer" value={issuer} onChange={edit('issuer', setIssuer)} />}
            </Field>
            <Field label={type === 'insurance' ? 'Policy number' : 'Reference number'} hint={fromFile('reference_number', reference) ? READ_NOTE : undefined}>
              {(p) => <Input {...p} autoCapitalize="characters" value={reference} onChange={edit('reference_number', setReference)} />}
            </Field>
            <Field label="Notes">{(p) => <TextArea {...p} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />}</Field>
          </div>
        </details>

        {findings.length > 0 && (
          <section className="findings" aria-labelledby="findings-h">
            <h3 className="field__label" id="findings-h">Update the vehicle from this RC</h3>
            <ul className="findings__list">
              {findings.map((f) => (
                <li key={f.key}>
                  <label className="findings__row">
                    <input type="checkbox" checked={Boolean(accepted[f.key])} onChange={(e) => setAccepted((a) => ({ ...a, [f.key]: e.target.checked }))} />
                    <span className="findings__text">
                      <span className="findings__label">{f.label}</span>
                      <span className="findings__change">
                        {f.current ? <><s className="t-ink-3">{f.current}</s> → </> : null}
                        <strong>{f.next}</strong>
                      </span>
                      {f.low && <span className="t-ink-3 findings__note">{f.note ?? 'Check this one.'}</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}
        {error && <Notice tone="error">{error}</Notice>}
      </form>
    </Sheet>
  );
}
