// 素言社区 API 根地址。
//
// 2026-11 服务端由 verse-cloud（api-verse.zhangjh.cn）剥离为独立仓库
// suyan-server，对外域名为 api-suyan.zhangjh.cn。路径契约不变，仅根地址变更。
// 该常量与客户端 src/shared/backend_endpoints.h 的 kBackendBaseUrl 需保持同步。
export const COMMUNITY_API_BASE = 'https://api-suyan.zhangjh.cn'

/** 允许的预览图主机名，供数据校验白名单使用（与 API 根地址同源）。 */
export const COMMUNITY_API_HOST = new URL(COMMUNITY_API_BASE).hostname
