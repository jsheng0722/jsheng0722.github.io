import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaTrash, FaWallet, FaArrowDown, FaArrowUp, FaCalendarAlt, FaExpandAlt, FaCompressAlt } from 'react-icons/fa';
import PageLayout from '../../components/Layout/PageLayout';
import { Card, Pagination, StatCard, EmptyState, Loading } from '../../components/UI';
import { addEntry, getEntriesByMonth, deleteEntry } from '../../utils/accountingDB';

const INCOME_CATEGORIES = ['工资', '奖金', '兼职', '理财', '其他'];
const EXPENSE_CATEGORIES = ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '其他'];
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

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
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().slice(0, 10),
    note: '',
  });

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

  const calendarDays = getCalendarDays(yearMonth);
  const [calYear, calMonth] = yearMonth.split('-').map(Number);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      type: form.type,
      amount: form.amount,
      category: form.category,
      date: form.date,
      note: form.note.trim(),
    };
    if (!payload.amount || Number(payload.amount) <= 0) return;
    const addedDate = payload.date;
    const addedYearMonth = addedDate.slice(0, 7);
    addEntry(payload)
      .then(() => {
        setForm((f) => ({ ...f, amount: '', note: '' }));
        setYearMonth(addedYearMonth);
        setSelectedDate(addedDate);
        setLoading(true);
        return getEntriesByMonth(addedYearMonth);
      })
      .then((list) => {
        setEntries(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('确定删除这条记录？')) return;
    deleteEntry(id).then(loadEntries).catch(console.error);
  };

  const setFormType = (type) => {
    setForm((f) => ({
      ...f,
      type,
      category: type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <PageLayout className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: main content */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
              <FaWallet className="text-emerald-500" />
              记账
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              数据保存在本机 IndexedDB，仅前端存储，不上传服务器
            </p>
          </div>

          {/* Month selector */}
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">月份</label>
<input
          type="month"
          value={yearMonth}
          onChange={(e) => {
            setYearMonth(e.target.value);
            setSelectedDate(null);
          }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2"
        />
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard
              icon={<FaArrowDown />}
              label="收入"
              value={`¥${summary.income.toFixed(2)}`}
              borderVariant="emerald"
              valueVariant="emerald"
              size="compact"
            />
            <StatCard
              icon={<FaArrowUp />}
              label="支出"
              value={`¥${summary.expense.toFixed(2)}`}
              borderVariant="red"
              valueVariant="red"
              size="compact"
            />
            <StatCard
              icon={<FaWallet />}
              label="结余"
              value={`¥${summary.balance.toFixed(2)}`}
              borderVariant="blue"
              valueVariant={summary.balance >= 0 ? 'blue' : 'red'}
              size="compact"
            />
          </div>

          {/* Add form */}
          <Card className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <FaPlus className="w-4 h-4" />
              记一笔
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('income')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      form.type === 'income'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    收入
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('expense')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      form.type === 'expense'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    支出
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="金额"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
                  />
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
<input
                type="date"
                value={form.date}
                onChange={(e) => {
                  const d = e.target.value;
                  setForm((f) => ({ ...f, date: d }));
                  setSelectedDate(d);
                  if (d) {
                    const ym = d.slice(0, 7);
                    if (ym !== yearMonth) setYearMonth(ym);
                  }
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
              />
                  <input
                    type="text"
                    placeholder="备注"
                    value={form.note}
                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                    className="flex-1 min-w-[80px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>
            </form>
          </Card>

          {/* Entry list */}
          <Card>
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {selectedDate ? `${selectedDate} 当日收支` : `${yearMonth} 明细`}
              </h2>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  查看整月
                </button>
              )}
            </div>
            {loading ? (
              <Loading text="加载中…" size="small" className="py-6" />
            ) : displayEntries.length === 0 ? (
              <EmptyState
                size="small"
                title={selectedDate ? '当天暂无记录' : '本月暂无记录'}
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
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="删除"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
</button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination
            total={displayEntries.length}
            pageSize={PAGE_SIZE}
            currentPage={page}
            onPageChange={setPage}
            itemLabel="条"
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
                日历
              </h2>
              <button
                type="button"
                onClick={() => setCalendarExpanded(!calendarExpanded)}
                className="p-1.5 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={calendarExpanded ? '缩小' : '放大'}
              >
                {calendarExpanded ? <FaCompressAlt className="w-3.5 h-3.5" /> : <FaExpandAlt className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">点击日期查看当日收支</p>
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
                      setForm((f) => ({ ...f, date: dateStr }));
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
