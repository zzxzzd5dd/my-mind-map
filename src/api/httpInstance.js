import axios from 'axios'
import { Message } from 'element-ui'

/**
 * 获取CSRF token的函数
 * CSRF（Cross-Site Request Forgery）跨站请求伪造防护
 * 从浏览器 cookie 中获取 csrftoken 值
 * @returns {string|null} 返回 CSRF token 或 null
 */
const getCSRFToken = () => {
  // 将 document.cookie 字符串按分号分割成数组
  const cookies = document.cookie.split(';')
  
  // 遍历所有 cookie 项
  for (let cookie of cookies) {
    // 分割 cookie 名称和值，去除空格
    const [name, value] = cookie.trim().split('=')
    
    // 查找名为 'csrftoken' 的 cookie
    if (name === 'csrftoken') {
      // 解码并返回 token 值
      return decodeURIComponent(value)
    }
  }
  
  // 如果没有找到 csrftoken，返回 null
  return null
}

/**
 * 创建 axios 实例
 * 配置全局的 HTTP 请求参数
 */
const http = axios.create({
  timeout: 10000,                                    // 请求超时时间：10秒
  withCredentials: true,                             // 允许跨域请求携带凭证（cookies）
  baseURL: 'http://localhost:8000/api/'             // API 基础路径，所有请求都会以此为前缀
})

// CSRF 初始化状态标志
let csrfInitialized = false

/**
 * 初始化 CSRF token
 * 在发送需要 CSRF 保护的请求前，先获取 CSRF token
 * 这是 Django 等后端框架常见的安全机制
 */
const initializeCSRF = async () => {
  // 如果已经初始化过，直接返回
  if (!csrfInitialized) {
    try {
      // 向后端发送请求获取 CSRF token
      // 这个请求会设置 csrftoken cookie
      await axios.get('http://localhost:8000/api/csrf/', {
        withCredentials: true,                       // 允许设置 cookie
        headers: {
          'Accept': 'application/json',              // 指定接受 JSON 格式响应
        }
      })
      
      // 标记 CSRF 已初始化
      csrfInitialized = true
      console.log('CSRF token initialized successfully')
    } catch (error) {
      // CSRF 初始化失败时的错误处理
      console.warn('Failed to initialize CSRF token:', error)
    }
  }
}


/**
 * HTTP 请求拦截器
 * 在每个请求发送前进行统一处理
 */
http.interceptors.request.use(
  function (config) {
    // 在发送请求之前可以做一些处理
    // 例如：添加 token、设置请求头等
    // 目前直接返回配置，未做额外处理
    initializeCSRF()

    // 对于需要CSRF保护的方法，添加CSRF token到请求头
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      const csrfToken = getCSRFToken()
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken
        console.log('Added CSRF token to request:', csrfToken.substring(0, 8) + '...')
      } else {
        console.warn('No CSRF token found in cookies')
      }
    }

    return config
  },
  function (error) {
    // 请求配置错误时的处理
    return Promise.reject(error)
  }
)

/**
 * HTTP 响应拦截器
 * 统一处理服务器响应和错误
 */
http.interceptors.response.use(
  function (response) {
    // 从响应数据中解构出状态码和消息
    const { code, message } = response.data
    
    // 处理未授权状态（401）
    if (code === 401) {
      // 检查当前是否已经在登录页面
      if (/^\/login/.test(location.pathname)) {
        // 如果已经在登录页面，直接拒绝请求
        return Promise.reject(response)
      } else {
        // 如果不在登录页面，跳转到登录页面
        location.href = '/login'
      }
    } 
    // 处理其他错误状态码（非 0 表示业务错误）
    else if (code !== 0) {
      // 显示错误消息给用户
      Message.error(message || '系统错误')
      // 拒绝这个响应
      return Promise.reject(response)
    }
    
    // 请求成功，返回响应数据
    // 注意：这里返回的是 response.data，而不是完整的 response 对象
    return response.data
  },
  function (error) {
    // 网络错误或其他非业务错误的处理
    // 例如：网络超时、服务器无响应等
    return Promise.reject(error)
  }
)

// 导出配置好的 axios 实例
export default http
