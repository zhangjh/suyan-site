import { useState, useEffect } from 'react'
import type { CommunitySkin, CommunitySkinStatus } from './suyanApi'
import {
  fetchCommunitySkins,
  approveCommunitySkin,
  rejectCommunitySkin,
  delistCommunitySkin,
  fetchCommunitySkinPreviewBlob,
} from './suyanApi'

type StatusFilter = CommunitySkinStatus | ''

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
  { value: 'delisted', label: '已下架' },
  { value: '', label: '全部' },
]

const STATUS_LABELS: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
  delisted: '已下架',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  delisted: 'bg-gray-100 text-gray-600',
}

/** suyanRequest 只把后端的机器码作为 Error.message 透出，中文 message 会丢，这里本地映射 */
const ERROR_MESSAGES: Record<string, string> = {
  invalid_status_transition: '该投稿状态已变更，请刷新后重试',
  invalid_reject_reason: '驳回原因必填且不能超过 256 字',
  'Submission not found': '投稿不存在，请刷新列表',
  Unauthorized: '登录已过期，请重新登录',
}

const REJECT_REASON_MAX = 256

const describeError = (err: unknown) => {
  const code = err instanceof Error ? err.message : ''
  return ERROR_MESSAGES[code] || code || '未知错误'
}

export function AdminSuyanCommunitySkins() {
  const [skins, setSkins] = useState<CommunitySkin[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [loading, setLoading] = useState(false)
  const [zoomUrl, setZoomUrl] = useState('')
  const [rejectTarget, setRejectTarget] = useState<CommunitySkin | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [delistTarget, setDelistTarget] = useState<CommunitySkin | null>(null)
  const [acting, setActing] = useState(false)
  const limit = 50

  useEffect(() => { loadSkins() }, [page, statusFilter])

  const loadSkins = async () => {
    setLoading(true)
    try {
      const data = await fetchCommunitySkins(page, limit, statusFilter)
      setSkins(data.skins)
      setTotal(data.total)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const changeFilter = (value: StatusFilter) => {
    setPage(1)
    setStatusFilter(value)
  }

  const handleApprove = async (skin: CommunitySkin) => {
    setActing(true)
    try {
      await approveCommunitySkin(skin.id)
      await loadSkins()
    } catch (err: any) {
      alert('通过失败：' + describeError(err))
    } finally {
      setActing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    setActing(true)
    try {
      await rejectCommunitySkin(rejectTarget.id, rejectReason.trim())
      setRejectTarget(null)
      setRejectReason('')
      await loadSkins()
    } catch (err: any) {
      alert('驳回失败：' + describeError(err))
    } finally {
      setActing(false)
    }
  }

  const handleDelist = async () => {
    if (!delistTarget) return
    setActing(true)
    try {
      await delistCommunitySkin(delistTarget.id)
      setDelistTarget(null)
      await loadSkins()
    } catch (err: any) {
      alert('下架失败：' + describeError(err))
    } finally {
      setActing(false)
    }
  }

  const formatDate = (ms: number) => new Date(ms).toLocaleString('zh-CN')
  const totalPages = Math.ceil(total / limit)

  const layoutLabel = (layout: string) => layout === 'vertical' ? '竖排' : '横排'

  const statusBadge = (skin: CommunitySkin) => (
    <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[skin.status] || 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[skin.status] || skin.status}
    </span>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">社区皮肤审核</h2>
        <span className="text-sm text-gray-500">共 {total} 条</span>
      </div>

      <div className="flex gap-2 mb-4">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value || 'all'}
            onClick={() => changeFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${statusFilter === f.value ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >{f.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">加载中...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="pb-2 pr-4">预览图</th>
                <th className="pb-2 pr-4">皮肤名</th>
                <th className="pb-2 pr-4">署名</th>
                <th className="pb-2 pr-4">布局</th>
                <th className="pb-2 pr-4">分享码</th>
                <th className="pb-2 pr-4">状态</th>
                <th className="pb-2 pr-4">提交时间</th>
                <th className="pb-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {skins.map((skin) => (
                <tr key={skin.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4"><PreviewThumb id={skin.id} onZoom={setZoomUrl} /></td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-gray-900">{skin.skinName}</div>
                    {skin.hasBackgroundImage && <div className="text-xs text-gray-400">含背景图</div>}
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{skin.authorName}</td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{layoutLabel(skin.layout)}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-700 font-mono">{skin.shareCode}</td>
                  <td className="py-3 pr-4">
                    {statusBadge(skin)}
                    {skin.rejectReason && (
                      <div className="text-xs text-gray-400 mt-0.5 max-w-[160px] break-all">{skin.rejectReason}</div>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">{formatDate(skin.createdAt)}</td>
                  <td className="py-3 whitespace-nowrap">
                    {skin.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(skin)}
                          disabled={acting}
                          className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 disabled:opacity-50 mr-2"
                        >通过</button>
                        <button
                          onClick={() => { setRejectReason(''); setRejectTarget(skin) }}
                          disabled={acting}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                        >驳回</button>
                      </>
                    )}
                    {skin.status === 'approved' && (
                      <button
                        onClick={() => setDelistTarget(skin)}
                        disabled={acting}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                      >下架</button>
                    )}
                    {skin.status !== 'pending' && skin.status !== 'approved' && (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {skins.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-500 py-8">暂无投稿</td></tr>
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

      {/* 预览图放大 */}
      {zoomUrl && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setZoomUrl('')}>
          <div className="bg-white rounded-xl shadow-xl p-4 max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
            <img src={zoomUrl} alt="皮肤预览图" className="max-h-[70vh] max-w-full rounded" />
            <div className="flex justify-end mt-3">
              <button
                onClick={() => setZoomUrl('')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 驳回确认对话框 */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => !acting && setRejectTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">确认驳回投稿</h3>
            <p className="text-sm text-gray-600 mb-4">
              将驳回皮肤 <span className="font-medium text-gray-900">{rejectTarget.skinName}</span>（{rejectTarget.shareCode}），驳回原因会展示给投稿者。
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              maxLength={REJECT_REASON_MAX}
              rows={3}
              placeholder="填写驳回原因，例如：预览图内容不符合社区规范"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-1"
            />
            <div className="text-xs text-gray-400 mb-4">{rejectReason.length} / {REJECT_REASON_MAX}</div>
            <p className="text-xs text-red-600 mb-4">驳回后该投稿的预览图与背景图将被物理删除，此操作不可逆。</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectTarget(null)}
                disabled={acting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >取消</button>
              <button
                onClick={handleReject}
                disabled={acting || rejectReason.trim().length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >{acting ? '驳回中...' : '确认驳回'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 下架确认对话框 */}
      {delistTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => !acting && setDelistTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">确认下架皮肤</h3>
            <p className="text-sm text-gray-600 mb-4">
              将下架皮肤 <span className="font-medium text-gray-900">{delistTarget.skinName}</span>（{delistTarget.shareCode}），下架后公开端点立即不可访问，官网刷新后该皮肤消失。
            </p>
            <p className="text-xs text-red-600 mb-4">下架会物理删除该投稿的预览图与背景图，此操作不可逆。</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDelistTarget(null)}
                disabled={acting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >取消</button>
              <button
                onClick={handleDelist}
                disabled={acting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >{acting ? '下架中...' : '确认下架'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 缩略图：预览图需带鉴权头，只能用 fetch 取 blob 再转 object URL。
 * 卸载时必须 revokeObjectURL，否则翻页会持续泄漏。
 * 驳回 / 下架的记录对象已被物理删除，端点返回 404，走占位兜底。
 */
function PreviewThumb({ id, onZoom }: { id: string; onZoom: (url: string) => void }) {
  const [url, setUrl] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let objectUrl = ''
    let cancelled = false
    fetchCommunitySkinPreviewBlob(id).then(blob => {
      if (cancelled) return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    }).catch(() => {
      if (!cancelled) setFailed(true)
    })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id])

  if (failed) {
    return (
      <div className="h-12 w-20 flex items-center justify-center rounded border border-gray-200 bg-gray-50 text-xs text-gray-400">
        无预览图
      </div>
    )
  }

  if (!url) {
    return <div className="h-12 w-20 rounded border border-gray-200 bg-gray-100 animate-pulse" />
  }

  return (
    <img
      src={url}
      alt="皮肤预览图"
      onClick={() => onZoom(url)}
      className="h-12 rounded border border-gray-200 cursor-zoom-in"
    />
  )
}
