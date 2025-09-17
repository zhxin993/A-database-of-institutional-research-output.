<template>
  <div class="register-background">
    <video class="background-video" autoplay loop muted playsinline>
      <source :src="videoBackground" type="video/mp4">
      您的浏览器不支持视频播放。
    </video>

    <div class="container mt-5 register-container-wrapper">
      <div class="row justify-content-center">
        <div class="col-md-6"> <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h3 class="text-center">注册账号</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="register">
                <div class="mb-3">
                  <label for="username" class="form-label">用户名</label>
                  <input
                    type="text"
                    class="form-control"
                    id="username"
                    v-model="form.username"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">邮箱</label>
                  <input type="email" class="form-control" id="email" v-model="form.email" required />
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">密码</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    v-model="form.password"
                    required
                    minlength="3"
                  />
                </div>
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">确认密码</label>
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    required
                  />
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary">注册</button>
                </div>
                <div class="mt-3 text-center">
                  <p>已有账号？<router-link to="/login">立即登录</router-link></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"; // 移除 onMounted, onUnmounted, computed
import { useRouter } from "vue-router";
import { useItemStore } from "@/stores/lostItems";
import api from "@/axios";
// 【修改点2：导入视频文件，移除所有图片导入和相关逻辑】
import videoBackground from '@/assets/background_5.mp4'; // 导入视频文件

// 【修改点3：移除图片数组和当前图片状态相关的 ref/computed/intervalId】
// const backgroundImages = [bgImage1, bgImage2, bgImage3, bgImage4];
// const currentImageIndex = ref(0);
// let intervalId = null;
// const currentBackgroundImage = computed(() => { return backgroundImages[currentImageIndex.value]; });

const itemStore = useItemStore();
const router = useRouter();

const form = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const register = async () => {
  // 1. 前端验证 (保持不变)
  if (form.value.password.length < 3) {
    alert("密码长度不能少于3位，请重新输入。");
    return;
  }
  if (form.value.password !== form.value.confirmPassword) {
    alert("两次输入的密码不一致");
    return;
  }

  // 2. 使用 try...catch 块来捕获所有可能的网络或服务器错误
  try {
    // --- 第一步：发起注册请求 ---
    // 使用统一的 api 实例，只传递相对路径和数据对象
    await api.post("/register", {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
    });
    
    // 如果上面的请求失败（例如用户名已存在），代码会直接跳转到下面的 catch 块
    // 如果代码能继续执行到这里，说明注册已成功。

    // --- 第二步：注册成功后，自动登录 ---
    const resLogin = await api.post("/login", {
      username: form.value.username,
      password: form.value.password,
    });

    // 从 axios 响应的 .data 属性中解构所需信息
    const { token, user } = resLogin.data;

    // --- 第三步：处理登录成功后的逻辑 ---
    localStorage.setItem("token", token); // 保存 token
    // 在axios的默认头部中也设置token，确保后续请求自动携带
    api.defaults.headers.common["Authorization"] = "Bearer " + token;

    // 更新 Pinia store 中的登录状态
    itemStore.login({
      id: user.id,
      username: user.username,
      email: user.email,
      token: token,
    });

    alert("注册并登录成功！");
    router.push("/"); // 跳转到首页

  } catch (error) {
    // 3. 统一的错误处理
    if (error.response) {
      // 请求已发出，但服务器返回了错误状态码（如400, 401, 500）
      // 从 error.response.data.message 中获取后端返回的错误提示
      alert("操作失败：" + (error.response.data.message || "服务器发生未知错误"));
    } else if (error.request) {
      // 请求已发出，但没有收到响应（例如网络问题或后端服务未运行）
      alert("操作失败：无法连接到服务器，请检查网络和后端服务状态");
    } else {
      // 在设置请求时发生了其他错误
      alert("操作失败：" + error.message);
    }
  }
};

// 【修改点4：移除 onMounted 和 onUnmounted 中的定时器逻辑】
// onMounted(() => {
//   intervalId = setInterval(() => {
//     currentImageIndex.value = (currentImageIndex.value + 1) % backgroundImages.length;
//   }, 3000);
// });
// onUnmounted(() => {
//   if (intervalId) {
//     clearInterval(intervalId);
//   }
// });
</script>

<style scoped>
.register-background {
  min-height: calc(100vh - 50px);
  position: relative; /* 【新增】确保视频可以绝对定位到这个容器内 */
  display: flex;
  justify-content: flex-end; /* 保持向右推 */
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  /* 【删除】背景图片相关属性，因为现在由 video 标签控制 */
  /* background-size: cover; */
  /* background-position: center center; */
  /* background-repeat: no-repeat; */
  /* transition: background-image 1s ease-in-out; */
}

/* 【新增】视频背景样式 */
.background-video {
  position: absolute;
  top: 5;
  left: 0;
  width: 50%;
  height: 50%;
  object-fit: cover; /* 确保视频覆盖整个区域，可能裁剪边缘 */
  z-index: -1; /* 将视频放在内容下方 */
  filter: brightness(1); /* 【可选】调暗视频，使前景内容更清晰 */
}

/* 调整卡片容器的宽度和向左推，实现向右偏移的效果 */
.register-container-wrapper {
  max-width: 900px; /* 保持最大宽度 */
  margin-left: auto; /* 将它推到右边 */
  margin-right: 5%; /* 增加一个右边距，让它不完全贴边，根据需要调整 */
  position: relative; /* 确保内容在视频之上 */
  z-index: 1; /* 确保内容在视频之上，高于 z-index: -1 的视频 */
}

/* 调整卡片背景，使其在背景图上更清晰 */
.card {
  background-color: rgba(247, 246, 253, 0.7); /* 保持半透明白色背景 */
  border: 3px solid #0D6EFd; /* 【新增】1像素实线浅灰色边框，略带透明度 */
}

/* 媒体查询：在小屏幕上可能需要调整 */
@media (max-width: 768px) {
  .register-background {
    justify-content: center; /* 小屏幕上通常更适合居中 */
    padding: 10px; /* 减小内边距 */
  }
  .register-container-wrapper {
    max-width: 95%; /* 小屏幕上允许更宽 */
    margin-left: auto; /* 恢复居中 */
    margin-right: auto; /* 恢复居中 */
    border-radius: 0; /* 【新增/修改】将圆角设置为直角 */
  }
}
</style>