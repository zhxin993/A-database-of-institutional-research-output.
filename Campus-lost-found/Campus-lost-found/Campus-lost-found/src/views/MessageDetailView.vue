<template>
  <div class="container mt-4">
    <div class="card shadow">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">与 {{ recipientName }} 的对话</h5>
      </div>
      <div class="card-body">
        <div class="message-container mb-3">
          <div v-if="messageStore.loading" class="text-center">加载中...</div>
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message-bubble"
            :class="message.from_me ? 'sent' : 'received'"
          >
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatDisplayTime(message.time) }}</div>
          </div>
        </div>

        <form @submit.prevent="handleSend" class="mt-3">
          <div class="input-group">
            <textarea
              v-model="newMessage"
              class="form-control"
              placeholder="输入消息内容..."
              rows="2"
              required
            ></textarea>
            <button type="submit" class="btn btn-primary" :disabled="sending">
              <span v-if="sending" class="spinner-border spinner-border-sm"></span>
              发送
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useMessageStore } from "@/stores/messages";

const route = useRoute();
const messageStore = useMessageStore();

const recipientId = ref(route.params.userId);
const recipientName = ref(`用户 ${recipientId.value}`); 
const newMessage = ref("");
const sending = ref(false);

const messages = computed(() => messageStore.currentChat);

/**
 * 【新增函数】
 * 用于将后端传来的时间字符串增加8小时并格式化。
 * @param {string} timeString - 后端返回的 'YYYY-MM-DD HH:MM' 格式的时间字符串
 */
const formatDisplayTime = (timeString) => {
  if (!timeString) {
    return "";
  }
  try {
    // 1. 将字符串转换为 Date 对象
    // 为了兼容性，将 ' ' 替换为 'T'
    const date = new Date(timeString.replace(' ', 'T'));

    // 2. 增加 8 小时
    date.setHours(date.getHours() + 8);

    // 3. 格式化为 'YYYY-MM-DD HH:MM'
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (e) {
    // 如果格式化失败，返回原始字符串
    return timeString;
  }
};

const handleSend = async () => {
  if (!newMessage.value.trim()) return;
  sending.value = true;
  try {
    await messageStore.sendMessage(recipientId.value, newMessage.value);
    newMessage.value = "";
    await messageStore.getChatHistory(recipientId.value);
  } catch (err) {
    alert("发送失败，请稍后再试");
  } finally {
    sending.value = false;
  }
};

onMounted(async () => {
  await messageStore.getChatHistory(recipientId.value);
});
</script>

<style scoped>
.message-container {
  max-height: 50vh;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
.message-bubble {
  padding: 0.5rem 1rem;
  border-radius: 1.25rem;
  margin-bottom: 0.5rem;
  max-width: 70%;
  word-wrap: break-word;
}
.message-bubble.sent {
  background-color: #0d6efd;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 0.25rem;
}
.message-bubble.received {
  background-color: #e9ecef;
  color: #212529;
  align-self: flex-start;
  border-bottom-left-radius: 0.25rem;
}
.message-content {
  font-size: 1rem;
}
.message-time {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 0.25rem;
  text-align: right;
}
</style>