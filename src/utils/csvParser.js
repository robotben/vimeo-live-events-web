import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function rowsToEvents(rows) {
  if (!rows.length) throw new Error('File is empty');
  const keys = Object.keys(rows[0]).map(k => k.toLowerCase().trim());
  if (!keys.includes('title')) throw new Error('File must have a "title" column');
  const events = rows
    .map(row => {
      const normalised = Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), String(v ?? '').trim()])
      );
      return { title: normalised.title, description: normalised.description || '' };
    })
    .filter(r => r.title);
  if (!events.length) throw new Error('No valid rows found in file');
  return events;
}

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) return reject(new Error(errors[0].message));
        try { resolve(rowsToEvents(data)); } catch (e) { reject(e); }
      },
      error: err => reject(new Error(err.message)),
    });
  });
}

export function parseXLSX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        resolve(rowsToEvents(rows));
      } catch (err) {
        reject(new Error(err.message || 'Failed to parse XLSX file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function exportResultsCSV(results) {
  const rows = [
    ['Title', 'Status', 'Management URL', 'Stream URL', 'Stream Key', 'Error'],
    ...results.map(r => [
      r.title,
      r.status,
      r.managementUrl || '',
      r.streamUrl || '',
      r.streamKey || '',
      r.error || '',
    ]),
  ];
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vimeo-events-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
