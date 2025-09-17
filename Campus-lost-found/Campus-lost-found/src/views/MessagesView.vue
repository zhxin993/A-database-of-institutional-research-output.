<template>
  <div class="container mt-4">
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-primary text-white"><h4 class="mb-0">私信消息</h4></div>
      <div class="card-body">
        <div v-if="loadingConversations" class="text-center py-3">
          <div class="spinner-border text-primary"></div>
        </div>
        <div v-else>
          <div v-if="conversations.length === 0" class="text-center py-3 text-muted">
            暂无私信对话
          </div>
          <div v-else>
            <div v-for="conversation in conversations" :key="conversation.user_id" class="list-group-item list-group-item-action mb-2">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ conversation.username }}</strong>
                  <p class="mb-0 small text-muted">最后消息: {{ conversation.last_message }}</p>
                  <p class="mb-0 small text-muted">时间: {{ formatDisplayTime(conversation.time) }}</p>
                </div>
                <router-link :to="`/message/${conversation.user_id}`" class="btn btn-sm btn-outline-primary">
                  查看对话
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">智能匹配</h4>
      </div>
      <div class="card-body">
        
        <div v-if="latestMatches.length > 0" class="mb-4">
            <div class="alert alert-success d-flex justify-content-between align-items-center">
              <span>根据您刚发布的物品，为您找到以下匹配：</span>
              <button @click="clearLatestMatches" class="btn-close" aria-label="Close"></button>
            </div>
            <MatchResultCard :matches="latestMatches" />
        </div>
        <div v-if="itemStore.myItems.length === 0" class="text-center py-4">
          <i class="bi bi-search" style="font-size: 3rem; opacity: 0.3"></i>
          <p class="mt-3">请先发布一些物品来使用智能匹配功能</p>
          <router-link to="/publish" class="btn btn-primary"> 去发布 </router-link>
        </div>
        <div v-else>
          <div v-if="showTestResults && testMatches.length > 0" class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">测试匹配结果</h6>
              <button @click="showTestResults = false" class="btn btn-sm btn-outline-secondary">
                关闭
              </button>
            </div>
            <div class="card mb-3">
              <div class="card-header bg-primary text-white">智能匹配结果</div>
              <div class="card-body p-0">
                <MatchResultCard :matches="testMatches" />
              </div>
            </div>
          </div>
          <div class="text-center">
            <p class="text-muted mb-3">或手动为已发布的物品找到可能的匹配项</p>
            <button
              @click="testMatchFunction"
              class="btn btn-primary"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i class="bi bi-search me-1"></i>
              开始智能匹配 (手动)
            </button>
          </div>
        </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useItemStore } from "@/stores/lostItems";
import { useMessageStore } from "@/stores/messages";
import MatchResultCard from "@/components/MatchResultCard.vue";

const itemStore = useItemStore();
const messageStore = useMessageStore();

const conversations = computed(() => messageStore.conversations);
const loadingConversations = ref(false);

// --- 【新增】用于处理发布后跳转来的匹配结果 ---
const latestMatches = computed(() => itemStore.latestMatches);
const clearLatestMatches = () => {
  itemStore.setLatestMatches([]);
};

const loading = ref(false);
const testMatches = ref([]);
const showTestResults = ref(false);

/**
 * 【新增函数】
 * 用于将后端传来的时间字符串增加8小时并格式化。
 */
const formatDisplayTime = (timeString) => {
  if (!timeString) {
    return "";
  }
  try {
    const date = new Date(timeString.replace(' ', 'T'));
    date.setHours(date.getHours() + 8);
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (e) {
    return timeString;
  }
};

const testMatchFunction = async () => {
  if (itemStore.myItems.length === 0) {
    alert("请先发布一些物品来测试智能匹配功能");
    return;
  }
  loading.value = true;
  try {
    const testItem = itemStore.myItems[0];
    const matches = await itemStore.findMatches(testItem.id);
    testMatches.value = Array.isArray(matches) ? matches : [];
    showTestResults.value = true;
    if (matches && matches.length > 0) {
      alert(`找到 ${matches.length} 个匹配项！`);
    } else {
      alert(`暂无匹配项`);
    }
  } catch (err) {
    console.error("测试智能匹配失败:", err);
    alert("测试失败，请查看控制台了解错误信息");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (itemStore.isAuthenticated) {
    loadingConversations.value = true;
    try {
      await messageStore.getConversations();
      await itemStore.fetchMyItems();
    } catch (err) {
      console.error("获取对话或物品失败:", err);
    } finally {
      loadingConversations.value = false;
    }
  }
});
</script>