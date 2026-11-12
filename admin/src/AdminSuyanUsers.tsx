import { useState, useEffect } from 'react'
import type { SuyanUser } from './suyanApi'
import { fetchSuyanUsers, deleteSuyanUser } from './suyanApi'

interface Props {
  onViewUser: (userId: string) => void
}

export function AdminSuyanUsers({ onViewUser }: Props) {
  const [users, setUsers] = useState<SuyanUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SuyanUser | null>(null)
  const [deleting, setDeleting] = useState(false)
  const limit = 50

  useEffect(() => { loadUsers() }, [page])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchSuyanUsers(page, limit, search)
      setUsers(data.users)
      setTotal(data.total)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadUsers()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteSuyanUser(deleteTarget.id)
      setDeleteTarget(null)
      await loadUsers()
    } catch (err: any) {
      alert('删除失败：' + (err.message || '未知错误'))
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleString('zh-CN')
  const totalPages = Math.ceil(total / limit)

  const formatTokens = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
    return String(n)
  }

  const subBadge = (u: SuyanUser) => {
    if (!u.subscription) return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">未订阅</span>
    const s = u.subscription.effectiveStatus
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      expired: 'bg-red-100 text-red-700',
      inactive: 'bg-gray-100 text-gray-600',
    }
    return <span className={`px-2 py-0.5 text-xs rounded-full ${colors[s] || 'bg-gray-100'}`}>{s}</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">素言注册用户</h2>
        <span className="text-sm text-gray-500">共 {total} 位用户</span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索昵称、provider_uid 或用户 ID..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">搜索</button>
      </form>

      {loading ? (
        <div className="text-center text-gray-500 py-8">加载中...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="pb-2 pr-4">用户</th>
                <th className="pb-2 pr-4">登录方式</th>
                <th className="pb-2 pr-4">余额（翻译 / 语音）</th>
                <th className="pb-2 pr-4">加油包</th>
                <th className="pb-2 pr-4">已用 Token</th>
                <th className="pb-2 pr-4">订阅状态</th>
                <th className="pb-2 pr-4">云同步</th>
                <th className="pb-2 pr-4">注册时间</th>
                <th className="pb-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.displayName || '(未设置昵称)'}</div>
                      <div className="text-xs text-gray-400 font-mono">{user.id.slice(0, 8)}</div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{user.provider}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">
                    <div className="whitespace-nowrap">
                      <span className="text-xs text-gray-400 mr-1">翻译</span>
                      {user.balance != null ? formatTokens(user.balance) : '-'}
                      {user.reserved ? <span className="text-xs text-orange-500 ml-1">(锁 {formatTokens(user.reserved)})</span> : null}
                    </div>
                    <div className="whitespace-nowrap mt-0.5">
                      <span className="text-xs text-gray-400 mr-1">语音</span>
                      {user.voiceBalance != null ? formatTokens(user.voiceBalance) : '-'}
                      {user.voiceReserved ? <span className="text-xs text-orange-500 ml-1">(锁 {formatTokens(user.voiceReserved)})</span> : null}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">
                    {user.rechargeCount > 0 || user.voiceRechargeCount > 0 ? (
                      <div className="space-y-1">
                        {user.rechargeCount > 0 && (
                          <div>
                            <div><span className="text-xs text-gray-400 mr-1">翻译</span>{user.rechargeCount} 次</div>
                            <div className="text-xs text-gray-400">{formatTokens(user.rechargeTokens)} tokens</div>
                          </div>
                        )}
                        {user.voiceRechargeCount > 0 && (
                          <div>
                            <div><span className="text-xs text-gray-400 mr-1">语音</span>{user.voiceRechargeCount} 次</div>
                            <div className="text-xs text-gray-400">{formatTokens(user.voiceRechargeTokens)} tokens</div>
                          </div>
                        )}
                      </div>
                    ) : <span className="text-xs text-gray-400">无</span>}
                  </td>
                  <td className="py-3 pr-4 text-gray-700">
                    {user.consumeCount > 0 || user.voiceConsumeCount > 0 ? (
                      <div className="space-y-1">
                        {user.consumeCount > 0 && (
                          <div>
                            <div><span className="text-xs text-gray-400 mr-1">翻译</span>{formatTokens(user.consumeTokens)}</div>
                            <div className="text-xs text-gray-400">{user.consumeCount} 次</div>
                          </div>
                        )}
                        {user.voiceConsumeCount > 0 && (
                          <div>
                            <div><span className="text-xs text-gray-400 mr-1">语音</span>{formatTokens(user.voiceConsumeTokens)}</div>
                            <div className="text-xs text-gray-400">{user.voiceConsumeCount} 次</div>
                          </div>
                        )}
                      </div>
                    ) : <span className="text-xs text-gray-400">无</span>}
                  </td>
                  <td className="py-3 pr-4">{subBadge(user)}</td>
                  <td className="py-3 pr-4 text-gray-700">
                    {user.syncConfigVersion != null ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">已开启 v{user.syncConfigVersion}</span>
                    ) : (
                      <span className="text-xs text-gray-400">未开启</span>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">词频 {user.frequencyEntries} · 词库 {user.dictFiles}</div>
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="py-3 whitespace-nowrap">
                    <button onClick={() => onViewUser(user.id)} className="text-blue-600 hover:text-blue-800 text-xs mr-2">详情</button>
                    <button
                      onClick={() => setDeleteTarget(user)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >删除</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={9} className="text-center text-gray-500 py-8">暂无用户数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">上一页</button>
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">下一页</button>
        </div>
      )}

      {/* 删除确认对话框 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除用户</h3>
            <p className="text-sm text-gray-600 mb-4">
              将永久删除用户 <span className="font-medium text-gray-900">{deleteTarget.displayName || '(未设置昵称)'}</span> 及其所有关联数据：
            </p>
            <ul className="text-sm text-gray-500 mb-4 space-y-1 pl-4">
              <li>· 翻译余额：{deleteTarget.balance != null ? formatTokens(deleteTarget.balance) : '-'}</li>
              <li>· 语音余额：{deleteTarget.voiceBalance != null ? formatTokens(deleteTarget.voiceBalance) : '-'}</li>
              <li>· 加油包购买：翻译 {deleteTarget.rechargeCount} 次 / 语音 {deleteTarget.voiceRechargeCount} 次</li>
              <li>· 云同步配置：{deleteTarget.syncConfigVersion != null ? '已开启' : '未开启'}</li>
              <li>· 订阅记录、词频/词库数据等全部清除</li>
            </ul>
            <p className="text-xs text-red-600 mb-4">此操作不可逆，删除后无法恢复。</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >取消</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >{deleting ? '删除中...' : '确认删除'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
