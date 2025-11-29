'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Proposal } from '@/types';

interface ProposalListProps {
  projectId: string;
}

export default function ProposalList({ projectId }: ProposalListProps) {
  const { projects, addProposal, deleteProposal } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newProposal, setNewProposal] = useState({
    description: '',
    amount: 0,
    estimateDeadline: '',
    status: 'pending' as Proposal['status'],
  });

  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const handleAddProposal = () => {
    if (!newProposal.description.trim()) return;

    addProposal(projectId, {
      description: newProposal.description,
      amount: newProposal.amount,
      estimateDeadline: newProposal.estimateDeadline ? new Date(newProposal.estimateDeadline) : null,
      status: newProposal.status,
    });

    setNewProposal({
      description: '',
      amount: 0,
      estimateDeadline: '',
      status: 'pending',
    });
    setIsAdding(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">提案・見積もり</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + 追加
        </button>
      </div>

      {/* 提案追加フォーム */}
      {isAdding && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <input
            type="text"
            placeholder="提案内容"
            value={newProposal.description}
            onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="number"
              placeholder="金額"
              value={newProposal.amount || ''}
              onChange={(e) => setNewProposal({ ...newProposal, amount: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="date"
              placeholder="見積もり期限"
              value={newProposal.estimateDeadline}
              onChange={(e) => setNewProposal({ ...newProposal, estimateDeadline: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddProposal}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              追加
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewProposal({
                  description: '',
                  amount: 0,
                  estimateDeadline: '',
                  status: 'pending',
                });
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 提案リスト */}
      {project.proposals.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">提案がありません</p>
      ) : (
        <div className="space-y-2">
          {project.proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    {proposal.description}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {formatCurrency(proposal.amount)}
                  </div>
                  {proposal.estimateDeadline && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      見積もり期限: {formatDate(proposal.estimateDeadline)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm('この提案を削除しますか？')) {
                      deleteProposal(projectId, proposal.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  削除
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ステータス: {proposal.status === 'pending' ? '保留中' : 
                            proposal.status === 'submitted' ? '提出済み' :
                            proposal.status === 'accepted' ? '承認済み' : '却下'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

