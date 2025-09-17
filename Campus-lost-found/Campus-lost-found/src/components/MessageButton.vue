<template>
  <button class="btn btn-outline-primary btn-sm" @click="openMessageModal">
    <i class="bi bi-envelope"></i> 发送消息
  </button>

  <!-- 消息模态框 -->
  <div class="modal fade" :id="modalId" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">与 {{ recipientName }} 的对话</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-primary"></div>
          </div>

          <div v-else>
            <div v-if="messages.length === 0" class="text-center py-3 text-muted">暂无历史消息</div>

            <div v-else class="message-container">
              <div
                v-for="message in messages"
                :key="message.id"
                :class="[
                  'message-bubble',
                  message.senderId === currentUser.id ? 'sent' : 'received',
                ]"
              >
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.createdAt) }}</div>
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Modal } from "bootstrap";
import { useItemStore } from "@/stores/lostItems";
import { useMessageStore } from "@/stores/messages";

const props = defineProps({
  itemId: {
    type: String,
    required: true,
  },
  recipientId: {
    type: String,
    required: true,
  },
  recipientName: {
    type: String,
    required: true,
  },
});

const store = useItemStore();
const messageStore = useMessageStore();
const currentUser = store.currentUser;
const newMessage = ref("");
const sending = ref(false);
const modalId = computed(() => `messageModal-${props.itemId}-${props.recipientId}`);
const messages = computed(() => messageStore.currentConversation?.messages || []);
const loading = computed(() => messageStore.loading);

let messageModal = null;

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const openMessageModal = async () => {
  if (!messageModal) {
    messageModal = new Modal(document.getElementById(modalId.value));
  }

  try {
    await messageStore.getMessages(props.itemId, props.recipientId);
    messageModal.show();
  } catch (err) {
    console.error("加载消息失败:", err);
  }
};

const handleSend = async () => {
  sending.value = true;
  try {
    await messageStore.sendMessage({
      itemId: props.itemId,
      recipientId: props.recipientId,
      content: newMessage.value,
    });
    newMessage.value = "";
  } finally {
    sending.value = false;
  }
};

onMounted(() => {
  messageModal = new Modal(document.getElementById(modalId.value));
});
</script>

<style scoped>
.message-container {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.message-bubble {
  margin-bottom: 10px;
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
}

.message-bubble.sent {
  background-color: #0d6efd;
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 0;
}

.message-bubble.received {
  background-color: #f8f9fa;
  margin-right: auto;
  border-bottom-left-radius: 0;
}

.message-content {
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 2px;
}
</style>
