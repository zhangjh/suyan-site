import { useState, useEffect } from 'react'
import type { SuyanDashboard } from './suyanApi'
import { fetchSuyanDashboard } from './suyanApi'

/** 轻量 SVG 柱状图（无第三方依赖） */
function BarChart({ data, labels, color, valueSuffix = '' }: { data: number[]; labels: string[]; color: string; valueSuffix?: string }) {
  const max = Math.max(1, ...data)
  const w = 100 / data.length
  return (
    <div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-32">
        {data.map((v, i) => {
          const h = (v / max) * 36
          return (
            <rect key={i} x={i * w + w * 0.15} y={38 - h} width={w * 0.7} height={h} rx={0.6} fill={color} opacity={v > 0 ? 0.9 : 0.25}>
              <title>{`${labels[i]}: ${v}${valueSuffix}`}</title>
            </rect>
          )
        })}
        <line x1="0" y1="38" x2="100" y2="38" stroke="#e5e7eb" strokeWidth="0.4" />
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{labels[0]?.slice(5)}</span>
        <span>{labels[Math.floor(labels.length / 2)]?.slice(5)}</span>
        <span>{labels[labels.length - 1]?.slice(5)}</span>
      </div>
    </div>
  )
}

const defaultData: SuyanDashboard = {
  totals: {
    totalUsers: 0, todayNewUsers: 0, activeSyncSubscribers: 0, expiring7Days: 0, expiring30Days: 0,
    rechargeCount: 0, rechargeTokens: 0, rechargeRevenueYuan: 0,
    translateRechargeCount: 0, translateRechargeTokens: 0, translateRechargeRevenueYuan: 0,
    voiceRechargeCount: 0, voiceRechargeTokens: 0, voiceRechargeRevenueYuan: 0,
    syncSubOrderCount: 0, syncSubRevenueYuan: 0,
    syncConfigUsers: 0, totalFrequencyEntries: 0, totalDictFiles: 0,
    voiceGrant: {
      grantedUsers: 0, grantedTokens: 0, claimRate: 0, activatedUsers: 0, activationRate: 0,
      consumedTokens: 0, convertUsers: 0, convertRate: 0, exhaustedUsers: 0, remainingTokens: 0,
      expiredUsers: 0, expiredTokens: 0,
    },
  },
  timeseries: { days: [], newUsers: [], rechargeCount: [], rechargeYuan: [], rechargeTokens: [], voiceRechargeCount: [], voiceRechargeYuan: [], voiceRechargeTokens: [], voiceGrantCount: [], voiceConsumeTokens: [], syncSubCount: [] },
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-75 mt-1">{label}</div>
    </div>
  )
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

/** 赠额指标里的一格（比 StatCard 紧凑，用于一行数据条） */
function Metric({ label, value, hint, tone = 'text-gray-900' }: { label: string; value: string | number; hint?: string; tone?: string }) {
  return (
    <div className="px-3 py-2">
      <div className={`text-lg font-bold leading-tight ${tone}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {hint && <div className="text-[10px] text-gray-400 mt-0.5">{hint}</div>}
    </div>
  )
}

export function AdminSuyanDashboard() {
  const [data, setData] = useState<SuyanDashboard>(defaultData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await fetchSuyanDashboard()
      setData(d)
    } catch (err: any) {
      setError(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">加载中...</div>
  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>

  const t = data.totals
  const ts = data.timeseries
  const g = t.voiceGrant ?? {
    grantedUsers: 0, grantedTokens: 0, claimRate: 0, activatedUsers: 0, activationRate: 0,
    consumedTokens: 0, convertUsers: 0, convertRate: 0, exhaustedUsers: 0, remainingTokens: 0,
    expiredUsers: 0, expiredTokens: 0,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">素言数据看板</h2>
        <button onClick={load} className="text-sm text-blue-600 hover:text-blue-800">刷新</button>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="总注册用户" value={t.totalUsers} icon="👥" color="bg-blue-50 text-blue-700" />
        <StatCard label="今日新增" value={t.todayNewUsers} icon="📈" color="bg-green-50 text-green-700" />
        <StatCard label="活跃云同步订阅" value={t.activeSyncSubscribers} icon="☁️" color="bg-indigo-50 text-indigo-700" />
        <StatCard label="7天内到期" value={t.expiring7Days} icon="⏰" color="bg-orange-50 text-orange-700" />
        <StatCard label="翻译加油包购买次数" value={t.translateRechargeCount} icon="🔋" color="bg-purple-50 text-purple-700" />
        <StatCard label="翻译加油包收入" value={`¥${t.translateRechargeRevenueYuan}`} icon="💰" color="bg-emerald-50 text-emerald-700" />
        <StatCard label="翻译累计充值 Token" value={formatTokens(t.translateRechargeTokens)} icon="🪙" color="bg-yellow-50 text-yellow-700" />
        <StatCard label="语音加油包购买次数" value={t.voiceRechargeCount} icon="🎙️" color="bg-fuchsia-50 text-fuchsia-700" />
        <StatCard label="语音加油包收入" value={`¥${t.voiceRechargeRevenueYuan}`} icon="💳" color="bg-rose-50 text-rose-700" />
        <StatCard label="语音累计充值 Token" value={formatTokens(t.voiceRechargeTokens)} icon="🗣️" color="bg-amber-50 text-amber-700" />
        <StatCard label="订阅订单数" value={t.syncSubOrderCount} icon="📋" color="bg-cyan-50 text-cyan-700" />
        <StatCard label="订阅收入(估)" value={`¥${t.syncSubRevenueYuan}`} icon="💵" color="bg-teal-50 text-teal-700" />
        <StatCard label="云同步配置用户" value={t.syncConfigUsers} icon="⚙️" color="bg-gray-50 text-gray-700" />
        <StatCard label="词频条目" value={formatTokens(t.totalFrequencyEntries)} icon="🔤" color="bg-pink-50 text-pink-700" />
        <StatCard label="词库文件" value={t.totalDictFiles} icon="📚" color="bg-lime-50 text-lime-700" />
      </div>

      {/* 免费语音额度（S-8） */}
      <div className="bg-white rounded-xl border mb-6">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <h3 className="text-sm font-semibold text-gray-700">免费语音额度 · 20 分钟/人</h3>
          <span className="text-[10px] text-gray-400">首次登录自动发放 · 30 天到期清零 · 充值后不再标注</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 divide-x divide-gray-100">
          <Metric label="领取率" value={`${g.claimRate}%`} hint={`${g.grantedUsers}/${t.totalUsers} 人已发放`} tone="text-fuchsia-700" />
          <Metric label="激活率" value={`${g.activationRate}%`} hint={`${g.activatedUsers} 人用过语音`} tone="text-indigo-700" />
          <Metric label="转化率" value={`${g.convertRate}%`} hint={`${g.convertUsers} 人买过语音包`} tone="text-emerald-700" />
          <Metric label="已发放" value={formatTokens(g.grantedTokens)} hint="token" />
          <Metric label="已消耗" value={formatTokens(g.consumedTokens)} hint="赠额账号语音消耗" />
          <Metric label="未消耗存量" value={formatTokens(g.remainingTokens)} hint="未来成本敞口" tone="text-amber-700" />
          <Metric label="到期清零" value={g.expiredUsers} hint={`${formatTokens(g.expiredTokens)} token`} tone="text-gray-500" />
        </div>
        <p className="px-4 pb-2 text-[10px] text-gray-400">
          领取率为覆盖率（赠额自动发放，非用户主动操作）；已消耗含充值后的语音使用，台账不做 FIFO 拆分，故需与转化率对照看。
          {g.exhaustedUsers > 0 && ` 已用完未付费：${g.exhaustedUsers} 人，是充值引导的重点对象。`}
        </p>
      </div>

      {/* 趋势图 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">新增用户（近30天）</h3>
          <BarChart data={ts.newUsers} labels={ts.days} color="#3b82f6" />
        </div>
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">翻译加油包收入 ¥（近30天）</h3>
          <BarChart data={ts.rechargeYuan} labels={ts.days} color="#10b981" valueSuffix="元" />
        </div>
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">语音加油包收入 ¥（近30天）</h3>
          <BarChart data={ts.voiceRechargeYuan} labels={ts.days} color="#f43f5e" valueSuffix="元" />
        </div>
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">云同步订阅激活（近30天）</h3>
          <BarChart data={ts.syncSubCount} labels={ts.days} color="#6366f1" />
          <p className="text-[10px] text-gray-400 mt-1">按已记录订单时间统计，仅含每用户最近一次激活</p>
        </div>
      </div>

      {/* 语音试用与消耗趋势 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">免费额度发放人数（近30天）</h3>
          <BarChart data={ts.voiceGrantCount ?? []} labels={ts.days} color="#c026d3" valueSuffix=" 人" />
        </div>
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">语音消耗 Token（近30天）</h3>
          <BarChart data={(ts.voiceConsumeTokens ?? []).map((v) => Math.round(v / 1000))} labels={ts.days} color="#0891b2" valueSuffix="K token" />
          <p className="text-[10px] text-gray-400 mt-1">含赠额与充值后的全部语音消耗，单位 K token</p>
        </div>
      </div>
    </div>
  )
}
