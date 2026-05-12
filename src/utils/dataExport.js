/**
 * Generic data export/import and print helpers.
 * - exportToCSV: export rows to CSV (Excel-compatible)
 * - importFromCSV: parse CSV file to array of objects
 * - printTable: open print dialog for a table (user can "Save as PDF")
 */

const CSV_SEP = ',';
const CSV_QUOTE = '"';

function escapeCsvCell(value) {
  if (value == null) return '';
  const s = String(value);
  if (s.includes(CSV_SEP) || s.includes(CSV_QUOTE) || s.includes('\n') || s.includes('\r')) {
    return CSV_QUOTE + s.replace(/"/g, '""') + CSV_QUOTE;
  }
  return s;
}

/**
 * Export array of objects to CSV and trigger download.
 * @param {Array<Object>} rows - data rows
 * @param {Array<{ key: string, label: string }>} columns - column definitions
 * @param {string} filename - e.g. "accounting-2025-02.csv"
 */
export function exportToCSV(rows, columns, filename = 'export.csv') {
  const headers = columns.map((c) => escapeCsvCell(c.label));
  const lines = [headers.join(CSV_SEP)];
  rows.forEach((row) => {
    const cells = columns.map((c) => escapeCsvCell(row[c.key]));
    lines.push(cells.join(CSV_SEP));
  });
  const bom = '\uFEFF';
  const csv = bom + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV file to array of objects. First row = headers (keys).
 * @param {File} file - CSV file
 * @returns {Promise<Array<Object>>}
 */
export function importFromCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result || '';
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        if (lines.length === 0) {
          resolve([]);
          return;
        }
        const parseLine = (line) => {
          const out = [];
          let cell = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === CSV_QUOTE) {
              if (inQuotes && line[i + 1] === CSV_QUOTE) {
                cell += CSV_QUOTE;
                i++;
              } else inQuotes = !inQuotes;
            } else if ((ch === CSV_SEP && !inQuotes) || ch === '\r') {
              out.push(cell.trim());
              cell = '';
            } else cell += ch;
          }
          out.push(cell.trim());
          return out;
        };
        const headerCells = parseLine(lines[0]);
        const keys = headerCells.map((h, i) => h || `col${i}`);
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = parseLine(lines[i]);
          const obj = {};
          keys.forEach((k, j) => {
            obj[k] = cells[j] != null ? cells[j] : '';
          });
          rows.push(obj);
        }
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Create a printable table in a container and trigger window.print().
 * Caller should render the table into printRoot and call this; or use the returned cleanup.
 * @param {HTMLElement} printRoot - element that will be printed (e.g. a div with table)
 * @param {string} title - title shown on printed page
 */
export function printTable(printRoot, title = '') {
  if (!printRoot) return;
  const style = document.createElement('style');
  style.id = 'data-export-print-style';
  style.textContent = `
    @media print {
      body * { visibility: hidden; }
      #data-export-print-root, #data-export-print-root * { visibility: visible; }
      #data-export-print-root { position: absolute; left: 0; top: 0; width: 100%; }
    }
  `;
  document.head.appendChild(style);
  printRoot.id = 'data-export-print-root';
  window.print();
  document.getElementById('data-export-print-style')?.remove();
  printRoot.id = '';
}
