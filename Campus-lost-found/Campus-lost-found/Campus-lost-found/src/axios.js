// src/utils/request.js
import axios from "axios";

const instance = axios.create({
  // 【修改这里】不再需要写死完整的地址和端口
  baseURL: "/api", 
  timeout: 5000,
});

// 请求拦截器：自动附加 token
instance.interceptors.request.use(config => {
  const token = localStorage.getItem("token"); // 确保 key 一致
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));
// --- 【请在这里添加下面的响应拦截器】 ---
// 响应拦截器：处理全局错误，特别是 401 错误
instance.interceptors.response.use(
  // 对于成功的响应 (状态码 2xx)，直接返回响应
  response => response,

  // 对于失败的响应，进行处理
  error => {
    // 检查响应中是否包含错误信息，并且错误状态码是否为 401
    if (error.response && error.response.status === 401) {
      
      console.error("401 未授权错误！Token可能已过期。");

      // 1. 清除本地存储的无效 token
      localStorage.removeItem('token');

      // 2. 弹窗提示用户
      alert('您的登录已过期或无效，请重新登录。');
      
      // 3. 跳转到登录页面
      // 使用 window.location.href 可以强制刷新页面，并清除所有旧的状态
      window.location.href = '/login';
    }

    // 将错误继续抛出，以便具体的请求可以单独处理
    return Promise.reject(error);
  }
);
// --- 响应拦截器结束 ---
export default instance;
