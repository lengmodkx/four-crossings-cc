/**
 * Mapbox 配置
 *
 * 从环境变量读取 Mapbox 公开访问令牌。
 * Vite 中 VITE_ 前缀的环境变量会通过 import.meta.env 暴露给客户端。
 */

/** Mapbox 公开访问令牌 (public token) */
let cachedToken: string | null = null

/**
 * 获取 Mapbox 公开访问令牌
 *
 * 从 import.meta.env.VITE_MAPBOX_TOKEN 读取，
 * 未配置时抛出错误。
 */
export function getMapboxToken(): string {
  if (cachedToken !== null) {
    return cachedToken
  }

  const token = import.meta.env.VITE_MAPBOX_TOKEN

  if (!token || token.length === 0) {
    throw new Error(
      'VITE_MAPBOX_TOKEN 未设置。请在 .env 文件中配置 Mapbox 公开访问令牌。' +
      '从 https://account.mapbox.com/access-tokens/ 获取。'
    )
  }

  cachedToken = token
  return token
}

/**
 * 清除缓存的 token（主要用于测试）
 */
export function clearTokenCache(): void {
  cachedToken = null
}
