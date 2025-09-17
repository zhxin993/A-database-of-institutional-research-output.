<template>
  <div class="home-background" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="container py-4">
      <!-- 匹配通知 (保持不变) -->
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
        
        <!-- 【修改】将欢迎语和游戏按钮放在一个容器里 -->
        <div class="d-flex align-items-center gap-3">
          <div v-if="isAuthenticated" class="text-end">
            <span class="text-muted text-Black">欢迎回来，{{ itemStore.user?.username || '用户' }}！</span>
          </div>
          <!-- 【新增】游戏按钮 -->
          <button class="btn btn-warning btn-sm" @click="showPuzzle = true">
            <i class="bi bi-puzzle-fill"></i> 点一下
          </button>
        </div>
      </div>

      <SearchBar @search="handleSearch" class="mb-3" />

      <!-- 最新信息和筛选器 (保持不变) -->
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

      <!-- 加载动画和物品卡片 (保持不变) -->
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status"></div>
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

    <!-- 【新增】拼图游戏组件的模态框 -->
    <JigsawPuzzle v-if="showPuzzle" @close="showPuzzle = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useItemStore } from "@/stores/lostItems";
import SearchBar from "@/components/SearchBar.vue";
import ItemCard from "@/components/ItemCard.vue";
import MatchNotification from "@/components/MatchNotification.vue";
import backgroundImage from '@/assets/background_image_5.jpg';
import JigsawPuzzle from '@/components/JigsawPuzzle.vue'; // 【新增】导入游戏组件

const itemStore = useItemStore();
const loading = ref(true);
const activeFilter = ref("all");
const searchCriteria = ref({});
const matches = ref([]);

// --- 【新增】控制游戏模态框的显示状态 ---
const showPuzzle = ref(false);
// --- 【新增结束】 ---

const filters = [
  { label: "全部", value: "all" },
  { label: "失物", value: "lost" },
  { label: "招领", value: "found" },
];

const isAuthenticated = computed(() => !!itemStore.user?.token);

const validMatches = computed(() =>
  Array.isArray(matches.value)
    ? matches.value.filter(
        (match) => match && typeof match === "object" && match.id
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
  await itemStore.fetchItems();
  loading.value = false;
  if (isAuthenticated.value) {
    try {
      // 假设有获取通知的逻辑
    } catch (err) {
      console.error("获取匹配通知失败:", err);
    }
  }
});
</script>

<style scoped>
.list-enter-active {
  transition: all 0.5s ease;
  transition-delay: var(--delay);
}
.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.home-background {
  min-height: calc(100vh - 50px);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  padding: 40px 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.card {
    background-color: rgba(255, 255, 255, 0.9);
}

.text-Black {
    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

.btn-group .btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}
</style>
