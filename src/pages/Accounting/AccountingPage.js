import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaWallet, FaArrowDown, FaArrowUp, FaCalendarAlt, FaExpandAlt, FaCompressAlt } from 'react-icons/fa';
import PageLayout from '../../components/Layout/PageLayout';
import { Card, Pagination, StatCard, EmptyState, Loading, DataExportImport } from '../../components/UI';
import { getEntriesByMonth, getEntriesByYear } from '../../utils/accountingDB';
import { useI18n } from '../../context/I18nContext';

function getCurrentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getCalendarDays(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const firstWeekday = first.getDay();
  const lastDate = last.getDate();
  const days = [];
  for (let i = 0; i < firstWeekday; i++) days.push(null);
  for (let d = 1; d <= lastDate; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function AccountingPage() {
  const { t } = useI18n();
  const ACCOUNTING_COLUMNS = useMemo(() => [
    { key: 'type', label: t('AccType') },
    { key: 'amount', label: t('AccAmount') },
    { key: 'category', label: t('AccCategory') },
    { key: 'date', label: t('AccDate') },
    { key: 'note', label: t('AccNote') },
  ], [t]);
  const WEEKDAYS = useMemo(() => [t('AccWeekday0'), t('AccWeekday1'), t('AccWeekday2'), t('AccWeekday3'), t('AccWeekday4'), t('AccWeekday5'), t('AccWeekday6')], [t]);
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [entries, setEntries] = useState([]);
  const [entriesYear, setEntriesYear] = useState([]);
  const [exportScope, setExportScope] = useState('month');
  const [loading, setLoading] = useState(true);
  const printRef = React.useRef(null);

  const [calYear, calMonth] = yearMonth.split('-').map(Number);

  const loadEntries = useCallback(() => {
    setLoading(true);
    getEntriesByMonth(yearMonth)
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [yearMonth]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    if (exportScope !== 'year') return;
    getEntriesByYear(calYear).then(setEntriesYear).catch(console.error);
  }, [exportScope, calYear]);

  const summary = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    entries.forEach((e) => {
      const a = Number(e.amount) || 0;
      if (e.type === 'income') income += a;
      else expense += a;
    });
    return { income, expense, balance: income - expense };
  }, [entries]);

  const daySummaries = React.useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      const d = e.date;
      if (!d) return;
      if (!map[d]) map[d] = { income: 0, expense: 0 };
      const a = Number(e.amount) || 0;
      if (e.type === 'income') map[d].income += a;
      else map[d].expense += a;
    });
    return map;
  }, [entries]);

  const displayEntries = selectedDate
    ? entries.filter((e) => e.date === selectedDate)
    : entries;

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(displayEntries.length / PAGE_SIZE));
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [selectedDate, yearMonth]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const paginatedEntries = displayEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportData = React.useMemo(() => {
    if (exportScope === 'day') {
      const d = selectedDate || new Date().toISOString().slice(0, 10);
      return d ? entries.filter((e) => e.date === d) : [];
    }
    if (exportScope === 'year') return entriesYear;
    return entries;
  }, [exportScope, selectedDate, entries, entriesYear]);

  const exportDataForCSV = React.useMemo(
    () => exportData.map((e) => ({ type: e.type === 'income' ? '收入' : '支出', amount: e.amount, category: e.category, date: e.date, note: e.note || '' })),
    [exportData]
  );

  const exportScopeLabel = exportScope === 'day' ? (selectedDate || new Date().toISOString().slice(0, 10)) + ' 当天' : exportScope === 'month' ? yearMonth + ' 当月' : calYear + ' 当年';
  const exportFilename = `记账-${exportScope === 'day' ? selectedDate || new Date().toISOString().slice(0, 10) : exportScope === 'month' ? yearMonth : calYear}.csv`;

  const calendarDays = getCalendarDays(yearMonth);

  return (
    <PageLayout className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: main content */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
              <FaWallet className="text-emerald-500" />
              {t('AccTitle')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('AccStorageDesc')}
            </p>
          </div>

          {/* Month selector */}
          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('AccMonth')}</label>
            <input
              type="month"
              value={yearMonth}
              onChange={(e) => {
                setYearMonth(e.target.value);
                setSelectedDate(null);
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('AccExportScope')}</span>
            <div className="flex gap-2">
              {['day', 'month', 'year'].map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setExportScope(scope)}
                  className={`px-3 py-1 rounded text-sm ${exportScope === scope ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                >
                  {scope === 'day' ? t('AccToday') : scope === 'month' ? t('AccThisMonth') : t('AccThisYear')}
                </button>
              ))}
            </div>
          </div>

          {/* Export / Import / Print */}
          <div className="mb-4">
            <DataExportImport
              data={exportDataForCSV}
              columns={ACCOUNTING_COLUMNS}
              filename={exportFilename}
              printTitle={`记账 ${exportScopeLabel}`}
              printRef={printRef}
              scopeLabel={exportScopeLabel}
            />
          </div>

          {/* Printable area (off-screen, used for print/PDF) */}
          <div
            ref={printRef}
            className="absolute -left-[9999px] w-[800px] p-6 bg-white text-black"
            aria-hidden="true"
          >
            <h2 className="text-lg font-bold mb-4">{t('AccTitle')} {exportScopeLabel}</h2>
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr>
                  {ACCOUNTING_COLUMNS.map((c) => (
                    <th key={c.key} className="border border-gray-300 p-2 text-left">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exportDataForCSV.map((row, i) => (
                  <tr key={i}>
                    {ACCOUNTING_COLUMNS.map((c) => (
                      <td key={c.key} className="border border-gray-300 p-2">
                        {row[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard
              icon={<FaArrowDown />}
              label={t('AccIncome')}
              value={`¥${summary.income.toFixed(2)}`}
              borderVariant="emerald"
              valueVariant="emerald"
              size="compact"
            />
            <StatCard
              icon={<FaArrowUp />}
              label={t('AccExpense')}
              value={`¥${summary.expense.toFixed(2)}`}
              borderVariant="red"
              valueVariant="red"
              size="compact"
            />
            <StatCard
              icon={<FaWallet />}
              label={t('AccBalance')}
              value={`¥${summary.balance.toFixed(2)}`}
              borderVariant="blue"
              valueVariant={summary.balance >= 0 ? 'blue' : 'red'}
              size="compact"
            />
          </div>

          {/* Entry list */}
          <Card>
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {selectedDate ? `${selectedDate} ${t('AccDaySummary')}` : `${yearMonth} ${t('AccMonthDetail')}`}
              </h2>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('AccViewMonth')}
                </button>
              )}
            </div>
            {loading ? (
              <Loading text={t('Loading')} size="small" className="py-6" />
            ) : displayEntries.length === 0 ? (
              <EmptyState
                size="small"
                title={selectedDate ? t('AccNoRecordToday') : t('AccNoRecordMonth')}
              />
            ) : (
          <>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between py-2 first:pt-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          entry.type === 'income'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {entry.type === 'income' ? (
                          <FaArrowDown className="w-2.5 h-2.5" />
                        ) : (
                          <FaArrowUp className="w-2.5 h-2.5" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                          {entry.category}
                          {entry.note ? ` · ${entry.note}` : ''}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{entry.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={
                          entry.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold text-sm'
                            : 'text-red-600 dark:text-red-400 font-semibold text-sm'
                        }
                      >
                        {entry.type === 'income' ? '+' : '-'}¥{Number(entry.amount).toFixed(2)}
                      </span>
                </div>
              </li>
            ))}
          </ul>
          <Pagination
            total={displayEntries.length}
            pageSize={PAGE_SIZE}
            currentPage={page}
            onPageChange={setPage}
            itemLabel={t('PaginationItemLabel')}
            className="mt-3"
          />
          </>
        )}
      </Card>
        </div>

        {/* Right: calendar sidebar */}
        <div className={`flex-shrink-0 ${calendarExpanded ? 'w-[300px]' : 'w-[200px]'} lg:sticky lg:top-4 lg:self-start`}>
          <Card className="p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <FaCalendarAlt className="w-3.5 h-3.5" />
                {t('SidebarCalendar')}
              </h2>
              <button
                type="button"
                onClick={() => setCalendarExpanded(!calendarExpanded)}
                className="p-1.5 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={calendarExpanded ? t('AccCollapse') : t('AccExpand')}
              >
                {calendarExpanded ? <FaCompressAlt className="w-3.5 h-3.5" /> : <FaExpandAlt className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('AccClickDateHint')}</p>
            <div className="grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 py-0.5">
                  {w}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`e-${idx}`} className={calendarExpanded ? 'aspect-square' : 'h-6'} />;
                }
                const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const ds = daySummaries[dateStr] || { income: 0, expense: 0 };
                const hasData = ds.income > 0 || ds.expense > 0;
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dateStr);
                    }}
                    className={`rounded flex flex-col items-center justify-start text-left w-full transition-colors ${
                      calendarExpanded ? 'aspect-square p-0.5 min-h-[36px]' : 'h-6 min-h-[24px] justify-center'
                    } ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : hasData
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={`font-medium ${calendarExpanded ? 'text-sm' : 'text-xs'}`}>{day}</span>
                    {calendarExpanded && (
                      <span className="mt-auto ml-auto flex flex-col items-end justify-end text-[9px] leading-tight">
                        {ds.income > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400">+{ds.income.toFixed(0)}</span>
                        )}
                        {ds.expense > 0 && (
                          <span className="text-red-600 dark:text-red-400">−{ds.expense.toFixed(0)}</span>
                        )}
                      </span>
                    )}
                    {!calendarExpanded && hasData && (
                      <span className="flex gap-0.5">
                        {ds.income > 0 && <span className="text-[8px] text-emerald-500">+</span>}
                        {ds.expense > 0 && <span className="text-[8px] text-red-500">−</span>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

export default AccountingPage;
