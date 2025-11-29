'use client';

import { useMemo } from 'react';
import { Project } from '@/types';
import { calculateMonthlyRevenueData, formatCurrency, MonthlyRevenueData } from '@/lib/utils';
import { XIcon } from './Icons';

interface RevenueChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

export default function RevenueChartModal({ isOpen, onClose, projects }: RevenueChartModalProps) {
  const monthlyData = useMemo(() => calculateMonthlyRevenueData(projects), [projects]);
  
  // 最大値を計算（グラフのスケール用）
  const maxTotal = useMemo(() => {
    return Math.max(...monthlyData.map(d => d.total), 1);
  }, [monthlyData]);
  
  // 合計を計算
  const totals = useMemo(() => {
    return monthlyData.reduce((acc, d) => ({
      confirmed: acc.confirmed + d.confirmed,
      expected: acc.expected + d.expected,
      total: acc.total + d.total,
      grossConfirmed: acc.grossConfirmed + d.grossConfirmed,
      grossExpected: acc.grossExpected + d.grossExpected,
    }), { confirmed: 0, expected: 0, total: 0, grossConfirmed: 0, grossExpected: 0 });
  }, [monthlyData]);

  if (!isOpen) return null;

  // 現在の月を取得
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* モーダル */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              売上推移グラフ
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              過去6ヶ月〜未来6ヶ月の売上見込み（手数料差し引き後）
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* コンテンツ */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* サマリー */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-5">
              <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">確定売上合計</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totals.confirmed)}
              </div>
              <div className="text-xs text-green-500 dark:text-green-500 mt-1">
                手数料前: {formatCurrency(totals.grossConfirmed)}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">見込み売上合計</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(totals.expected)}
              </div>
              <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                手数料前: {formatCurrency(totals.grossExpected)}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-5">
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">総合計</div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {formatCurrency(totals.total)}
              </div>
              <div className="text-xs text-purple-500 dark:text-purple-500 mt-1">
                手数料前: {formatCurrency(totals.grossConfirmed + totals.grossExpected)}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">月平均</div>
              <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                {formatCurrency(Math.round(totals.total / monthlyData.length))}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {monthlyData.length}ヶ月間
              </div>
            </div>
          </div>
          
          {/* グラフ */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6">
            <div className="flex items-end gap-2 h-80">
              {monthlyData.map((data) => {
                const confirmedHeight = maxTotal > 0 ? (data.confirmed / maxTotal) * 100 : 0;
                const expectedHeight = maxTotal > 0 ? (data.expected / maxTotal) * 100 : 0;
                const isCurrentMonth = data.month === currentMonth;
                
                return (
                  <div 
                    key={data.month}
                    className="flex-1 flex flex-col items-center group"
                  >
                    {/* バー */}
                    <div className="w-full flex flex-col items-center justify-end h-64 relative">
                      {/* ツールチップ */}
                      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        <div className="font-semibold mb-1">{data.monthLabel}</div>
                        <div className="text-green-300">確定: {formatCurrency(data.confirmed)}</div>
                        <div className="text-blue-300">見込み: {formatCurrency(data.expected)}</div>
                        <div className="text-white font-semibold mt-1 pt-1 border-t border-slate-600">
                          合計: {formatCurrency(data.total)}
                        </div>
                      </div>
                      
                      {/* 見込み（上） */}
                      <div 
                        className="w-full bg-blue-400 dark:bg-blue-500 rounded-t-lg transition-all duration-300 group-hover:bg-blue-500 dark:group-hover:bg-blue-400"
                        style={{ height: `${expectedHeight}%`, minHeight: data.expected > 0 ? '4px' : '0' }}
                      />
                      {/* 確定（下） */}
                      <div 
                        className={`w-full bg-green-500 dark:bg-green-400 transition-all duration-300 group-hover:bg-green-600 dark:group-hover:bg-green-300 ${data.expected > 0 ? '' : 'rounded-t-lg'}`}
                        style={{ height: `${confirmedHeight}%`, minHeight: data.confirmed > 0 ? '4px' : '0' }}
                      />
                    </div>
                    
                    {/* ラベル - 高さを固定 */}
                    <div className="mt-3 h-8 flex flex-col items-center">
                      <div className={`text-xs font-medium text-center ${
                        isCurrentMonth 
                          ? 'text-blue-600 dark:text-blue-400 font-bold' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {data.monthLabel.replace(/^\d+年/, '')}
                      </div>
                      {isCurrentMonth && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 凡例 */}
            <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-sm text-slate-600 dark:text-slate-400">確定売上</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded" />
                <span className="text-sm text-slate-600 dark:text-slate-400">見込み売上</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm text-slate-600 dark:text-slate-400">今月</span>
              </div>
            </div>
          </div>
          
          {/* 月別詳細テーブル */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">月別詳細</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">月</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">確定売上</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">見込み売上</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">合計</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">手数料前合計</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {monthlyData.map((data) => {
                    const isCurrentMonth = data.month === currentMonth;
                    return (
                      <tr 
                        key={data.month}
                        className={`${isCurrentMonth ? 'bg-blue-50 dark:bg-blue-900/20' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/50`}
                      >
                        <td className={`px-4 py-3 text-sm ${isCurrentMonth ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {data.monthLabel}
                          {isCurrentMonth && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">今月</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-green-600 dark:text-green-400">
                          {data.confirmed > 0 ? formatCurrency(data.confirmed) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-blue-600 dark:text-blue-400">
                          {data.expected > 0 ? formatCurrency(data.expected) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-slate-800 dark:text-white">
                          {data.total > 0 ? formatCurrency(data.total) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-500 dark:text-slate-400">
                          {(data.grossConfirmed + data.grossExpected) > 0 
                            ? formatCurrency(data.grossConfirmed + data.grossExpected) 
                            : '-'
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 dark:bg-slate-700 font-bold">
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">合計</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                      {formatCurrency(totals.confirmed)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600 dark:text-blue-400">
                      {formatCurrency(totals.expected)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-800 dark:text-white">
                      {formatCurrency(totals.total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-500 dark:text-slate-400">
                      {formatCurrency(totals.grossConfirmed + totals.grossExpected)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

