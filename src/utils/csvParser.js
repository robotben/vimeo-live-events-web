import Papa from 'papaparse';

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) return reject(new Error(errors[0].message));
        if (!data.length) return reject(new Error('CSV is empty'));
        const keys = Object.keys(data[0]).map(k => k.toLowerCase().trim());
        if (!keys.includes('title')) return reject(new Error('CSV must have a "title" column'));
        const events = data
          .map(row => {
            const normalised = Object.fromEntries(
              Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v?.trim() ?? ''])
            );
            return { title: normalised.title, description: normalised.description || '' };
          })
          .filter(r => r.title);
        if (!events.length) return reject(new Error('No valid rows found in CSV'));
        resolve(events);
      },
      error: err => reject(new Error(err.message)),
    });
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
