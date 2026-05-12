import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FaDownload } from 'react-icons/fa';
import { useI18n } from '../../context/I18nContext';

function ExcelViewer({ filePath }) {
  const { t } = useI18n();
  const [data, setData] = useState([]);
  const [sheetNames, setSheetNames] = useState([]);
  const [currentSheet, setCurrentSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExcel = async () => {
      try {
        setLoading(true);
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        setSheetNames(workbook.SheetNames);

        const sheetData = workbook.Sheets[workbook.SheetNames[currentSheet]];
        const jsonData = XLSX.utils.sheet_to_json(sheetData, { header: 1 });
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading Excel:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (filePath) {
      loadExcel();
    }
  }, [filePath, currentSheet]);

  const handleSheetChange = (index) => {
    setCurrentSheet(index);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop() || 'spreadsheet';
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">{t('UniversalViewerLoading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">{t('UniversalViewerEmpty')}</div>
      </div>
    );
  }

  return (
    <div className="excel-viewer">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {sheetNames.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('UniversalViewerSheet')}:
              </span>
              {sheetNames.map((name, index) => (
                <button
                  key={name}
                  onClick={() => handleSheetChange(index)}
                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                    currentSheet === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleDownload}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2"
          title={t('UniversalViewerDownload')}
        >
          <FaDownload className="w-4 h-4" />
          <span className="text-sm">{t('UniversalViewerDownload')}</span>
        </button>
      </div>

      <div className="overflow-auto max-h-[500px] rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                #
              </th>
              {data[0]?.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {header !== undefined ? String(header) : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {rowIndex + 1}
                </td>
                {data[0]?.map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                  >
                    {row[colIndex] !== undefined ? String(row[colIndex]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExcelViewer;
