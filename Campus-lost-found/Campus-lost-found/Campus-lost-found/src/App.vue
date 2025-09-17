<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <i class="bi bi-search-heart me-2"></i>
          校园失物招领
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
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

    <router-view class="py-4" />

    <footer class="bg-light text-center py-4 mt-4">
      <div class="container">
        <p class="mb-0">校园失物招领平台 © 2025</p>
        <p class="text-muted small mb-0">让遗失的物品尽快回到主人身边</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useItemStore } from "@/stores/lostItems";

const itemStore = useItemStore();

// ✅ 修复：绑定 user，而不是未定义的 currentUser
const currentUser = computed(() => itemStore.user);
const isAuthenticated = computed(() => itemStore.isAuthenticated);

const logout = () => {
  itemStore.logout();
};
</script>

<style>
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
</style>
