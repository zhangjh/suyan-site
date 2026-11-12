import { useState, useEffect } from 'react'
import type { SuyanUserDetail } from './suyanApi'
import { fetchSuyanUserDetail } from './suyanApi'

interface Props {
  userId: string
  onBack: () => void
}

export function AdminSuyanUserDetail({ userId, onBack }: Props) {
  const [detail, setDetail] = useState<SuyanUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadDetail() }, [userId])

  const loadDetail = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchSuyanUserDetail(userId)
      setDetail(data)
    } catch (err: any) {
      setError(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleString('zh-CN') : '-'

  const formatTokens = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
    return String(n)
  }

  if (loading) return <div className="text-center text-gray-500 py-8">加载中...</div>
  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
  if (!detail) return null

  const { user, subscription, balance, ledgerSummary, sync } = detail

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    inactive: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-1">
        &larr; 返回用户列表
      </button>

      {/* 用户基本信息 */}
      <div className="bg-white rounded-xl border p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-lg text-gray-500">
            {user.displayName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user.displayName || '(未设置昵称)'}</h3>
            <div className="text-sm text-gray-500">登录方式：{user.provider}</div>
            <div className="text-xs text-gray-400 mt-1">ID: {user.id}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Provider UID：</span><span className="font-mono text-xs">{user.providerUid}</span></div>
          <div><span className="text-gray-500">注册时间：</span>{formatDate(user.createdAt)}</div>
          <div><span className="text-gray-500">更新时间：</span>{formatDate(user.updatedAt)}</div>
        </div>
      </div>

      {/* Token 余额（翻译 / 语音两个独立额度池） */}
      <div className="bg-white rounded-xl border p-5 mb-4">
        <h4 className="font-bold text-gray-900 mb-3">Token 余额</h4>
        {balance ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">翻译额度池</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-gray-900">{formatTokens(balance.balance)}</div>
                  <div className="text-xs text-gray-500 mt-1">可用余额</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-orange-600">{formatTokens(balance.reserved)}</div>
                  <div className="text-xs text-gray-500 mt-1">预锁定</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">语音额度池</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-fuchsia-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-fuchsia-700">{formatTokens(balance.voiceBalance)}</div>
                  <div className="text-xs text-gray-500 mt-1">可用余额</div>
                </div>
                <div className="bg-fuchsia-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-orange-600">{formatTokens(balance.voiceReserved)}</div>
                  <div className="text-xs text-gray-500 mt-1">预锁定</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">暂无余额记录</div>
        )}
        {balance && (
          <div className="text-xs text-gray-400 mt-3">更新时间：{formatDate(balance.updatedAt)}</div>
        )}
      </div>

      {/* Token 流水汇总（翻译 / 语音分开统计） */}
      <div className="bg-white rounded-xl border p-5 mb-4">
        <h4 className="font-bold text-gray-900 mb-3">Token 流水汇总</h4>

        <div className="text-xs font-medium text-gray-500 mb-2">翻译</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-emerald-700">{ledgerSummary.rechargeCount}</div>
            <div className="text-xs text-gray-500 mt-1">加油包购买次数</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-emerald-700">{formatTokens(ledgerSummary.rechargeTokens)}</div>
            <div className="text-xs text-gray-500 mt-1">充值 Token / ¥{ledgerSummary.rechargeYuan.toFixed(2)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-700">{ledgerSummary.consumeCount}</div>
            <div className="text-xs text-gray-500 mt-1">消费笔数</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-700">{formatTokens(ledgerSummary.consumeTokens)}</div>
            <div className="text-xs text-gray-500 mt-1">消费 Token</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm mt-3">
          <div><span className="text-gray-500">最近一次充值：</span>{formatDate(ledgerSummary.lastRechargeAt)}</div>
          <div><span className="text-gray-500">最近一次消费：</span>{formatDate(ledgerSummary.lastConsumeAt)}</div>
        </div>

        <div className="text-xs font-medium text-gray-500 mb-2 mt-5">语音</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-fuchsia-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-fuchsia-700">{ledgerSummary.voiceRechargeCount}</div>
            <div className="text-xs text-gray-500 mt-1">加油包购买次数</div>
          </div>
          <div className="bg-fuchsia-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-fuchsia-700">{formatTokens(ledgerSummary.voiceRechargeTokens)}</div>
            <div className="text-xs text-gray-500 mt-1">充值 Token / ¥{ledgerSummary.voiceRechargeYuan.toFixed(2)}</div>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-violet-700">{ledgerSummary.voiceConsumeCount}</div>
            <div className="text-xs text-gray-500 mt-1">消费笔数</div>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-violet-700">{formatTokens(ledgerSummary.voiceConsumeTokens)}</div>
            <div className="text-xs text-gray-500 mt-1">消费 Token</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm mt-3">
          <div><span className="text-gray-500">最近一次充值：</span>{formatDate(ledgerSummary.lastVoiceRechargeAt)}</div>
          <div><span className="text-gray-500">最近一次消费：</span>{formatDate(ledgerSummary.lastVoiceConsumeAt)}</div>
        </div>
      </div>

      {/* 云同步订阅 */}
      <div className="bg-white rounded-xl border p-5 mb-4">
        <h4 className="font-bold text-gray-900 mb-3">云同步订阅</h4>
        {subscription ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">有效状态：</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[subscription.effectiveStatus] || 'bg-gray-100'}`}>{subscription.effectiveStatus}</span>
              {subscription.status !== subscription.effectiveStatus && (
                <span className="text-xs text-gray-400 ml-1">(原 {subscription.status})</span>
              )}
            </div>
            <div><span className="text-gray-500">到期时间：</span>{formatDate(subscription.expiresAt)}</div>
            <div><span className="text-gray-500">下单时间：</span>{formatDate(subscription.orderTime)}</div>
            {subscription.alipayTradeNo && (
              <div className="col-span-2"><span className="text-gray-500">支付宝订单号：</span><span className="font-mono text-xs break-all">{subscription.alipayTradeNo}</span></div>
            )}
            <div><span className="text-gray-500">更新时间：</span>{formatDate(subscription.updatedAt)}</div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">暂无订阅记录</div>
        )}
      </div>

      {/* 云同步数据 */}
      <div className="bg-white rounded-xl border p-5">
        <h4 className="font-bold text-gray-900 mb-3">云同步数据</h4>
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div><span className="text-gray-500">配置版本：</span>{sync.configVersion ?? '-'}</div>
          <div><span className="text-gray-500">配置更新时间：</span>{formatDate(sync.configUpdatedAt)}</div>
          <div><span className="text-gray-500">词频条目数：</span>{sync.frequencyEntries}</div>
          <div><span className="text-gray-500">词库文件数：</span>{sync.dictFiles.length}</div>
        </div>
        {sync.dictFiles.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2">词库文件列表：</div>
            <div className="space-y-1">
              {sync.dictFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5 text-xs">
                  <span className="font-mono text-gray-700">{f.fileName}</span>
                  <span className="text-gray-400">v{f.version} · {f.contentHash.slice(0, 12)}</span>
                  <span className="text-gray-400">{formatDate(f.updatedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
