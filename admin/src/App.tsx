import { useEffect, useState } from 'react'
import {
  clearAdminToken,
  dispatchAdminUnauthorized,
  isAdminTokenValid,
  ADMIN_UNAUTHORIZED_EVENT,
} from './adminApi'
import { AdminLogin } from './AdminLogin'
import { AdminSuyanDashboard } from './AdminSuyanDashboard'
import { AdminSuyanUsers } from './AdminSuyanUsers'
import { AdminSuyanUserDetail } from './AdminSuyanUserDetail'
import { AdminSuyanRecharges } from './AdminSuyanRecharges'
import { AdminSuyanSubscriptions } from './AdminSuyanSubscriptions'
import { AdminSuyanCommunitySkins } from './AdminSuyanCommunitySkins'

/**
 * 素言独立管理控制台（迁移文档 §10）。
 * 从 ai-notebook/src/components/AdminConsole/AdminApp.tsx 裁剪：去掉 Verse 导航、
 * 产品切换与 Verse 页面，只保留素言 5 个模块 + 用户详情。
 * 语音链路健康面板 / 变更审计属于 P3，本阶段未包含。
 */
type Tab = 'dashboard' | 'users' | 'user-detail' | 'recharges' | 'subscriptions' | 'community'

const nav: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: '数据看板', icon: '📈' },
  { key: 'users', label: '注册用户', icon: '👥' },
  { key: 'recharges', label: '加油包记录', icon: '🔋' },
  { key: 'subscriptions', label: '云同步订阅', icon: '☁️' },
  { key: 'community', label: '皮肤审核', icon: '🎨' },
]

export function AdminApp() {
  // 本地先校验 JWT exp：过期的 token 不再进入控制台，避免闪现失效数据
  const [authed, setAuthed] = useState(() => isAdminTokenValid())
  const [loginNotice, setLoginNotice] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!authed) return
    const onUnauthorized = () => {
      setLoginNotice('登录已过期，请重新登录')
      setAuthed(false)
    }
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized)
    // 页面长时间空闲无请求时，也能在到期后自动跳回登录页
    const timer = window.setInterval(() => {
      if (!isAdminTokenValid()) dispatchAdminUnauthorized()
    }, 60_000)
    return () => {
      window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized)
      window.clearInterval(timer)
    }
  }, [authed])

  if (!authed) {
    return (
      <AdminLogin
        notice={loginNotice}
        onLogin={() => { setLoginNotice(''); setAuthed(true) }}
      />
    )
  }

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId)
    setActiveTab('user-detail')
  }
  const handleBackToUsers = () => {
    setSelectedUserId(null)
    setActiveTab('users')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminSuyanDashboard />
      case 'users':
        return <AdminSuyanUsers onViewUser={handleViewUser} />
      case 'user-detail':
        return selectedUserId
          ? <AdminSuyanUserDetail userId={selectedUserId} onBack={handleBackToUsers} />
          : <AdminSuyanUsers onViewUser={handleViewUser} />
      case 'recharges':
        return <AdminSuyanRecharges />
      case 'subscriptions':
        return <AdminSuyanSubscriptions />
      case 'community':
        return <AdminSuyanCommunitySkins />
      default:
        return <AdminSuyanDashboard />
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">素言管理后台</h1>
          <p className="text-xs text-gray-500 mt-0.5">Suyan Admin Console</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ key, label, icon }) => {
            const isActive = activeTab === key || (key === 'users' && activeTab === 'user-detail')
            return (
              <button
                key={key}
                onClick={() => { setActiveTab(key); if (key !== 'user-detail') setSelectedUserId(null) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => { clearAdminToken(); setLoginNotice(''); setAuthed(false) }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  )
}
