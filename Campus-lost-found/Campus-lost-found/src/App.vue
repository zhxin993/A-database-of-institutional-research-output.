<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark shadow-sm" style="background-color: var(--primary-color);">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <i class="bi bi-search-heart me-2"></i>
          校园失物招领
        </router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">首页</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/publish">发布信息</router-link>
            </li>
          </ul>

          <div class="d-flex">
            <!-- 登录后 -->
            <div v-if="isAuthenticated" class="d-flex align-items-center gap-3">
              <!-- 【新增】头像显示 -->
              <router-link to="/profile">
                <img 
                  :src="avatarSrc" 
                  class="navbar-avatar" 
                  alt="avatar" 
                  @error.once="e => e.target.src = '/static/uploads/avatars/default.png'"
                >
              </router-link>
              <span class="text-white">{{ currentUser.username }}</span>
              <router-link to="/profile" class="btn btn-outline-light btn-sm">个人中心</router-link>
              <button class="btn btn-outline-light btn-sm" @click="logout">退出登录</button>
            </div>

            <!-- 未登录 -->
            <div v-else>
              <router-link to="/login" class="btn btn-outline-light me-2"> 登录 </router-link>
              <router-link to="/register" class="btn btn-light"> 注册 </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

     <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>/>

    <footer class="bg-light text-center py-4 mt-4">
      <div class="container">
        <p class="mb-0">校园失物招领平台 © 2025</p>
        <p class="text-muted small mb-0">让遗失的物品尽快回到主人身边</p>
      </div>
    </footer>

    <!-- 【保留】背景音乐播放器元素 -->
    <audio ref="bgmPlayer" loop>
      <source src="/audio/lai.mp3" type="audio/mpeg">
      您的浏览器不支持 audio 元素。
    </audio>

    <!-- 【保留】音乐控制按钮 -->
    <button class="music-toggle-btn btn btn-light shadow" @click="toggleMusic">
      <i class="bi" :class="isPlaying ? 'bi-volume-up-fill' : 'bi-volume-mute-fill'"></i>
    </button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useItemStore } from "@/stores/lostItems";
import { useRouter } from 'vue-router';

const itemStore = useItemStore();
const router = useRouter();


// --- 【关键修改】 ---
// 在 onMounted 中，我们不再需要监听音乐播放器的事件，
// 而是调用 checkAuthStatus 来初始化应用状态。
onMounted(() => {
  itemStore.checkAuthStatus();
});
// --- 【修改结束】 ---


const currentUser = computed(() => itemStore.user);
const isAuthenticated = computed(() => itemStore.isAuthenticated);

// 【新增】计算属性，用于获取头像URL
const avatarSrc = computed(() => {
  return itemStore.user?.avatar_url ? `/${itemStore.user.avatar_url}` : '/static/uploads/avatars/default.png';
});

const logout = () => {
  itemStore.logout();
  router.push('/login');
};

// 【保留】背景音乐相关逻辑
const bgmPlayer = ref(null);
const isPlaying = ref(false);

const toggleMusic = async () => {
  if (!bgmPlayer.value) return;

  if (isPlaying.value) {
    bgmPlayer.value.pause();
  } else {
    try {
      await bgmPlayer.value.play();
    } catch (error) {
      console.error("背景音乐播放失败，可能是由于浏览器自动播放限制。", error);
    }
  }
};

onMounted(() => {
  if (bgmPlayer.value) {
    bgmPlayer.value.addEventListener('play', () => {
      isPlaying.value = true;
    });
    bgmPlayer.value.addEventListener('pause', () => {
      isPlaying.value = false;
    });
  }
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(93, 156, 236, 0.4);
}
.card {
  border: none; /* 移除默认边框 */
  border-radius: 12px; /* 更大的圆角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 更柔和的阴影 */
  transition: all 0.3s ease; /* 平滑过渡效果 */
}

.card:hover {
  transform: translateY(-5px); /* 鼠标悬浮时轻微上移 */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); /* 阴影加深 */
}
.navbar {
  transition: background-color 0.3s ease;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

:root {
  --primary-color: #5D9CEC; /* 一种更柔和的蓝色 */
  --secondary-color: #4A5568; /* 深灰色，用于次要文字 */
  --accent-color: #FF6B6B;  /* 强调色，用于点赞、通知等 */
  --background-color: #F7F8FC; /* 非常浅的灰色背景 */
  --card-background: #FFFFFF; /* 卡片背景 */
  --text-color: #2D3748; /* 主要文字颜色 */
}
body, html, #app {
  font-family: 'Noto Sans SC', sans-serif;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.router-view {
  flex: 1;
}
footer {
  margin-top: auto;
}
.navbar {
  padding: 0.8rem 1rem;
}
.navbar-brand {
  font-weight: 600;
  font-size: 1.25rem;
}

/* 【新增】顶部导航栏头像样式 */
.navbar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* 【保留】音乐控制按钮的样式 */
.music-toggle-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1050;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
