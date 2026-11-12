import { useState, useEffect } from 'react'
import type { SuyanRecharge } from './suyanApi'
import { fetchSuyanRecharges, revokeSuyanRecharges } from './suyanApi'

export function AdminSuyanRecharges() {
  const [recharges, setRecharges] = useState<SuyanRecharge[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [packType, setPackType] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [revoking, setRevoking] = useState(false)
  const [revokeResult, setRevokeResult] = useState<string | null>(null)
  const limit = 50

  useEffect(() => { loadRecharges() }, [page, packType])

  const loadRecharges = async () => {
    setLoading(true)
    try {
      const data = await fetchSuyanRecharges(page, limit, search, packType)
      setRecharges(data.recharges)
      setTotal(data.total)
      setSelectedIds(new Set())
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadRecharges()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === recharges.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(recharges.map(r => r.id)))
    }
  }

  const handleRevoke = async () => {
    setRevoking(true)
    setRevokeResult(null)
    try {
      const result = await revokeSuyanRecharges(Array.from(selectedIds))
      const lines = result.results.map(r => {
        if (r.skipped === 'not_found') return `记录 ${r.id.slice(0, 8)}：未找到`
        if (r.skipped === 'already_revoked') return `记录 ${r.id.slice(0, 8)}：已撤销过，跳过`
        if (r.skipped === 'no_balance') return `记录 ${r.id.slice(0, 8)}：用户余额为 0，无可收回`
        if (r.skipped === 'partial') return `记录 ${r.id.slice(0, 8)}：部分收回 ${formatTokens(r.revoked)} / ${formatTokens(r.tokens)}（余额不足）`
        return `记录 ${r.id.slice(0, 8)}：成功收回 ${formatTokens(r.revoked)} tokens`
      })
      setRevokeResult(`成功撤销 ${result.revokedCount}/${result.total} 笔\n\n${lines.join('\n')}`)
      setSelectedIds(new Set())
      await loadRecharges()
    } catch (err: any) {
      setRevokeResult('撤销失败：' + (err.message || '未知错误'))
    } finally {
      setRevoking(false)
    }
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleString('zh-CN') : '-'
  const totalPages = Math.ceil(total / limit)

  const formatTokens = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
    return String(n)
  }

  const pageYuan = recharges.reduce((s, r) => s + r.yuan, 0)
  const pageTokens = recharges.reduce((s, r) => s + r.tokens, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">加油包购买记录</h2>
        <span className="text-sm text-gray-500">共 {total} 笔</span>
      </div>

      <div className="flex gap-2 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索订单号、用户昵称或用户 ID..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">搜索</button>
        </form>
        <select
          value={packType}
          onChange={(e) => { setPage(1); setPackType(e.target.value) }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">全部类型</option>
          <option value="translate">翻译加油包</option>
          <option value="voice">语音加油包</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">加载中...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="pb-2 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={recharges.length > 0 && selectedIds.size === recharges.length}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="pb-2 pr-4">用户</th>
                  <th className="pb-2 pr-4">类型</th>
                  <th className="pb-2 pr-4">金额</th>
                  <th className="pb-2 pr-4">Token 数</th>
                  <th className="pb-2 pr-4">充值后余额</th>
                  <th className="pb-2 pr-4">当前余额/已用</th>
                  <th className="pb-2 pr-4">订单号 (ref_id)</th>
                  <th className="pb-2 pr-4">下单时间</th>
                  <th className="pb-2 pr-4">入账时间</th>
                </tr>
              </thead>
              <tbody>
                {recharges.map((r) => (
                  <tr key={r.id} className={`border-b border-gray-100 hover:bg-gray-50 ${selectedIds.has(r.id) ? 'bg-red-50' : ''}`}>
                    <td className="py-3 pr-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      {r.user ? (
                        <div>
                          <div className="font-medium text-gray-900">{r.user.displayName}</div>
                          <div className="text-xs text-gray-400 font-mono">{r.userId.slice(0, 8)}</div>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <div className="text-xs font-mono">{r.userId.slice(0, 8)}</div>
                          <div className="text-xs text-gray-400">已注销</div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {r.packType === 'voice' ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700">语音加油包</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700">翻译加油包</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-medium text-emerald-700">¥{r.yuan.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-gray-700">{formatTokens(r.tokens)}</td>
                    <td className="py-3 pr-4 text-gray-700">{formatTokens(r.balanceAfter)}</td>
                    <td className="py-3 pr-4 text-gray-700">
                      <div>余额 {r.currentBalance != null ? r.currentBalance.toLocaleString() : '-'}</div>
                      <div className="text-xs text-gray-400">已用 {r.consumeTokens.toLocaleString()} ({r.consumeCount} 次)</div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-500 font-mono break-all max-w-[200px]">{r.refId || '-'}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{formatDate(r.orderTime)}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
                {recharges.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-gray-500 py-8">暂无购买记录</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              本页合计：¥{pageYuan.toFixed(2)} / {formatTokens(pageTokens)} tokens
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600">已选 {selectedIds.size} 笔</span>
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                >{revoking ? '撤销中...' : '撤销选中（收回 token）'}</button>
              </div>
            )}
          </div>

          {revokeResult && (
            <div className="mt-3 bg-gray-50 border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap flex-1">{revokeResult}</pre>
                <button onClick={() => setRevokeResult(null)} className="text-gray-400 hover:text-gray-600 text-sm ml-2">关闭</button>
              </div>
            </div>
          )}
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">上一页</button>
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">下一页</button>
        </div>
      )}
    </div>
  )
}
