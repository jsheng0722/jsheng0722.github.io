/**
 * Generic data export (CSV/Excel-compatible), import and print.
 * Props: data (rows), columns [{ key, label }], filename, onImport(parsedRows), printTitle, printRef (ref to printable div), scopeLabel
 */

import React, { useRef } from 'react';
import { FaFileExport, FaFileImport, FaPrint } from 'react-icons/fa';
import { exportToCSV, importFromCSV, printTable } from '../../../utils/dataExport';
import { useI18n } from '../../../context/I18nContext';

function DataExportImport({
  data = [],
  columns = [],
  filename = 'export.csv',
  onImport,
  printTitle = '',
  printRef,
  scopeLabel = '',
  exportLabel,
  importLabel,
  printLabel,
  className = '',
}) {
  const { t } = useI18n();
  const fileInputRef = useRef(null);
  const internalPrintRef = useRef(null);
  const rootRef = printRef || internalPrintRef;
  const expLabel = exportLabel ?? t('ExportExcel');
  const impLabel = importLabel ?? t('ImportExcel');
  const prtLabel = printLabel ?? t('PrintPdf');

  const handleExport = () => {
    if (data.length === 0) {
      window.alert(t('ExportNoData'));
      return;
    }
    exportToCSV(data, columns, filename);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importFromCSV(file)
      .then((rows) => {
        if (onImport) onImport(rows);
        e.target.value = '';
      })
      .catch((err) => {
        window.alert(t('ExportParseFailed') + (err?.message || String(err)));
        e.target.value = '';
      });
  };

  const handlePrint = () => {
    if (data.length === 0) {
      window.alert(t('ExportNoDataPrint'));
      return;
    }
    if (rootRef?.current) printTable(rootRef.current, printTitle);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleExport}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
      >
        <FaFileExport className="w-4 h-4" />
        {expLabel}
      </button>
      {onImport && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,application/csv"
            onChange={handleImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <FaFileImport className="w-4 h-4" />
            {impLabel}
          </button>
        </>
      )}
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <FaPrint className="w-4 h-4" />
        {prtLabel}
      </button>
      {scopeLabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{scopeLabel}</span>
      )}
    </div>
  );
}

export default DataExportImport;
