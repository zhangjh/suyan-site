import { useState, useEffect, useMemo } from 'react'
import type { SuyanSubscriptionOrder } from './suyanApi'
import { fetchSuyanSubscriptionOrders, revokeSuyanSubscriptions } from './suyanApi'

/**
 * 素言云同步订阅 —— 订单流水视图。
 *
 * 以「一笔支付一行」展示，续费不再覆盖上一条记录；「当前状态 / 当前到期」两列取自
 * 该用户实时的订阅行，便于一眼看出这笔是首购还是续费、用户现在是否仍在有效期内。
 * 收回权限作用在用户级订阅上，故按 subscription.id 去重后提交。
 */
export function AdminSuyanSubscriptions() {
  const [orders, setOrders] = useState<SuyanSubscriptionOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [revoking, setRevoking] = useState(false)
  const [revokeResult, setRevokeResult] = useState<string | null>(null)
  const limit = 50

  useEffect(() => { loadOrders() }, [page, statusFilter, search])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await fetchSuyanSubscriptionOrders(page, limit, statusFilter || undefined, search || undefined)
      setOrders(data.orders)
      setTotal(data.total)
      setSelectedIds(new Set())
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 只有仍存在订阅行的订单才能收回（用户被删除时 subscription 为 null）
  const revocableOrders = useMemo(
    () => orders.filter((o) => o.subscription != null),
    [orders]
  )

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === revocableOrders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(revocableOrders.map(o => o.id)))
    }
  }

  const handleRevoke = async () => {
    const subscriptionIds = Array.from(new Set(
      orders.filter(o => selectedIds.has(o.id) && o.subscription).map(o => o.subscription!.id)
    ))
    if (subscriptionIds.length === 0) {
      setRevokeResult('选中的订单已无有效订阅，无需收回')
      return
    }

    setRevoking(true)
    setRevokeResult(null)
    try {
      const result = await revokeSuyanSubscriptions(subscriptionIds)
      const lines = result.results.map(r => {
        if (r.after === 'not_found') return `记录 ${r.id.slice(0, 8)}：未找到`
        return `${r.displayName || r.userId.slice(0, 8)}：${r.before} → inactive（已收回）`
      })
      setRevokeResult(`成功收回 ${result.revokedCount}/${result.total} 个订阅\n\n${lines.join('\n')}`)
      setSelectedIds(new Set())
      await loadOrders()
    } catch (err: any) {
      setRevokeResult('收回失败：' + (err.message || '未知错误'))
    } finally {
      setRevoking(false)
    }
  }

  const handleSearch = () => {
    setSearch(searchInput.trim())
    setPage(1)
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleString('zh-CN') : '-'
  const totalPages = Math.ceil(total / limit)
  const pageYuan = orders.reduce((s, o) => s + o.yuan, 0)

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    inactive: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">云同步订阅</h2>
        <span className="text-sm text-gray-500">共 {total} 笔订单</span>
      </div>

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex gap-2">
          {['', 'active', 'expired', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s || '全部'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            placeholder="订单号 / 支付宝交易号 / 用户"
            className="w-64 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >查询</button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        提示：一笔支付一行，续费单独成行、不再覆盖历史。「当前状态 / 当前到期」是该用户此刻的订阅状态，
        状态筛选作用在这一列上。
      </p>

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
                      checked={revocableOrders.length > 0 && selectedIds.size === revocableOrders.length}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="pb-2 pr-4">用户</th>
                  <th className="pb-2 pr-4">金额</th>
                  <th className="pb-2 pr-4">订单号</th>
                  <th className="pb-2 pr-4">支付时间</th>
                  <th className="pb-2 pr-4">本笔时长</th>
                  <th className="pb-2 pr-4">生效后到期</th>
                  <th className="pb-2 pr-4">当前状态</th>
                  <th className="pb-2 pr-4">当前到期</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className={`border-b border-gray-100 hover:bg-gray-50 ${selectedIds.has(order.id) ? 'bg-red-50' : ''}`}>
                    <td className="py-3 pr-2">
                      <input
                        type="checkbox"
                        disabled={order.subscription == null}
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="rounded disabled:opacity-30"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      {order.user ? (
                        <div>
                          <div className="font-medium text-gray-900">{order.user.displayName}</div>
                          <div className="text-xs text-gray-400 font-mono">{order.userId.slice(0, 8)}</div>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <div className="text-xs font-mono">{order.userId.slice(0, 8)}</div>
                          <div className="text-xs text-gray-400">已注销</div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-emerald-700">¥{order.yuan.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500 font-mono break-all max-w-[220px]">
                      <div>{order.outTradeNo}</div>
                      {order.alipayTradeNo && (
                        <div className="text-gray-400">支付宝 {order.alipayTradeNo}</div>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{formatDate(order.paidAt)}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{order.durationDays} 天</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{formatDate(order.expiresAtAfter)}</td>
                    <td className="py-3 pr-4">
                      {order.subscription ? (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[order.subscription.effectiveStatus] || 'bg-gray-100'}`}>
                          {order.subscription.effectiveStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-500">
                      {order.subscription ? formatDate(order.subscription.expiresAt) : '-'}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-gray-500 py-8">暂无订阅订单</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              本页合计 {orders.length} 笔 / ¥{pageYuan.toFixed(2)}
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600">已选 {selectedIds.size} 笔订单</span>
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                >{revoking ? '收回中...' : '收回选中（取消订阅权限）'}</button>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">上一页</button>
              <span className="text-sm text-gray-600">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">下一页</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
