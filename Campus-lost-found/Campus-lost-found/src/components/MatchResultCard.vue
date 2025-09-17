<template>
  <div>
    <div v-if="matches.length === 0" class="text-center text-muted py-4">
      暂无匹配项
    </div>
    <div v-else>
      <div v-for="match in matches" :key="match.id" class="result-card mb-3 p-3">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <h6 class="mb-1 fw-bold">{{ match.title }}</h6>
            <p class="mb-1 small text-muted">{{ match.description }}</p>
            <div class="small text-muted mb-1">
              <span class="badge bg-info me-2">{{ match.type === 'lost' ? '失物' : '招领' }}</span>
              <span v-if="match.category" class="badge bg-secondary me-2">{{ match.category }}</span>
              <span class="me-2"><i class="bi bi-geo-alt"></i> {{ match.location }}</span>
              <span><i class="bi bi-clock"></i> {{ formatDate(match.posted_at) }}</span>
            </div>
          </div>
          <div class="d-flex flex-column gap-2 align-items-end ms-3">
            <router-link :to="`/item/${match.id}`" class="btn btn-sm btn-outline-primary">
              查看详情
            </router-link>
            <button
              @click="openMessageDialog(match.user_id)"
              class="btn btn-sm btn-outline-success"
            >
              联系发布者
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDialog" class="dialog-mask">
      <div class="dialog-box">
        <h5>联系发布者</h5>
        <textarea v-model="messageContent" class="form-control mb-2" rows="3" placeholder="请输入私信内容"></textarea>
        <div class="text-end">
          <button class="btn btn-secondary me-2" @click="showDialog = false">取消</button>
          <button class="btn btn-primary" @click="sendMessage">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useItemStore } from '@/stores/lostItems';
import { useMessageStore } from '@/stores/messages';

const router = useRouter();
const itemStore = useItemStore();
const messageStore = useMessageStore();

const props = defineProps({
  matches: {
    type: Array,
    default: () => []
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '无时间信息';
  try {
    return new Date(dateString).toLocaleString('zh-CN');
  } catch {
    return dateString;
  }
};

// 联系发布者弹窗逻辑
const showDialog = ref(false);
const dialogUserId = ref(null);
const messageContent = ref("");

const openMessageDialog = (userId) => {
  dialogUserId.value = userId;
  messageContent.value = "";
  showDialog.value = true;
};

const sendMessage = async () => {
  if (!messageContent.value.trim()) {
    alert("请输入内容");
    return;
  }
  try {
    // ======================== 【核心修改】 ========================
    // 调用正确的函数 sendMessage，并分别传入两个参数
    await messageStore.sendMessage(dialogUserId.value, messageContent.value);
    // =============================================================
    
    alert("发送成功");
    showDialog.value = false;
  } catch (e) {
    console.error("发送消息失败:", e); // 在控制台打印详细错误
    alert("发送失败");
  }
};
</script>

<style scoped>
.result-card {
  background: #f8faff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.07);
  border: 1px solid #e3eaf3;
  transition: box-shadow 0.2s;
}
.result-card:hover {
  box-shadow: 0 4px 16px rgba(0, 123, 255, 0.13);
}
.dialog-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog-box {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
}
</style>
