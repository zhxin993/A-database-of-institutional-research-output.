<template>
  <div class="home-background" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="container py-4">
      <div v-if="validMatches.length > 0" class="mb-4">
        <h4 class="mb-3 text-Black">匹配通知</h4>
        <MatchNotification
          v-for="match in validMatches"
          :key="match.id"
          :notification="match"
          class="mb-2"
        />
      </div>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="mb-0 text-Black">校园失物招领</h1>
        <div v-if="isAuthenticated" class="text-end">
          <span class="text-muted text-Black">欢迎回来，{{ itemStore.user?.username || '用户' }}！</span>
        </div>
      </div>

      <SearchBar @search="handleSearch" class="mb-3" />

      <div class="d-flex justify-content-between mb-3">
        <h4 class="text-Black">最新信息</h4>
        <div class="btn-group">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="btn btn-outline-secondary"
            :class="{ active: activeFilter === filter.value }"
            @click="changeFilter(filter.value)"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2 text-Black">加载数据中...</p>
      </div>

      <div v-else>
        <div v-if="itemStore.items.length === 0" class="alert alert-info">暂无相关物品信息</div>

        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div class="col" v-for="item in itemStore.items" :key="item.id">
            <ItemCard :item="item" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useItemStore } from "@/stores/lostItems";
import SearchBar from "@/components/SearchBar.vue";
import ItemCard from "@/components/ItemCard.vue";
import MatchNotification from "@/components/MatchNotification.vue";
import backgroundImage from '@/assets/background_image_5.jpg'; // 【新增】导入背景图片

const itemStore = useItemStore();
const loading = ref(true);
const activeFilter = ref("all");
const searchCriteria = ref({});
const matches = ref([]); // ✅ 初始化为数组

const filters = [
  { label: "全部", value: "all" },
  { label: "失物", value: "lost" },
  { label: "招领", value: "found" },
];

const isAuthenticated = computed(() => !!itemStore.user?.token);

// ✅ 过滤合法的匹配项，避免 v-if 和 v-for 同时使用
const validMatches = computed(() =>
  Array.isArray(matches.value)
    ? matches.value.filter(
        (match) =>
          match &&
          typeof match === "object" &&
          match.id &&
          match.type &&
          ((match.lostItem && match.lostItem.name) ||
            (match.foundItem && match.foundItem.name))
      )
    : []
);

const handleSearch = async (params) => {
  loading.value = true;
  searchCriteria.value = { ...params };
  await itemStore.fetchItems(params);
  loading.value = false;
};

const changeFilter = async (type) => {
  activeFilter.value = type;
  const params = { ...searchCriteria.value };
  if (type !== "all") params.type = type;
  else delete params.type;
  loading.value = true;
  await itemStore.fetchItems(params);
  loading.value = false;
};

onMounted(async () => {
  // 首次加载物品列表
  await itemStore.fetchItems();
  loading.value = false;

  // 尝试获取匹配通知（在物品列表加载后进行，确保用户已登录状态能被正确判断）
  if (isAuthenticated.value) {
    try {
      const res = await itemStore.getMatchNotifications();
      matches.value = Array.isArray(res) ? res : [];
    } catch (err) {
      console.error("获取匹配通知失败:", err);
      matches.value = [];
    }
  }
});
</script>

<style scoped>
.home-background {
  min-height: calc(100vh - 50px); /* 确保背景覆盖整个视口高度，减去可能的导航栏高度 */
  background-size: cover; /* 确保背景图片覆盖整个元素 */
  background-position: center center; /* 居中背景图片 */
  background-repeat: no-repeat; /* 防止背景图片重复 */
  position: relative; /* 为内容定位做准备 */
  padding: 40px 20px; /* 添加内边距 */
  box-sizing: border-box; /* 确保 padding 不会增加元素总尺寸 */
  overflow: hidden; /* 防止内容溢出影响布局 */
}



/* 调整卡片的背景透明度，如果需要让它们更透明 */
/* 注意：ItemCard 是一个组件，如果它有自己的背景，可能需要在 ItemCard.vue 中调整 */
.card {
    background-color: rgba(255, 255, 255, 0.9); /* 半透明白色背景，可根据需要调整透明度 */

}

/* 为主标题和欢迎语等白色文字添加阴影，增强对比度 */
.text-white {
    text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
}

.btn-group .btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}
</style>
