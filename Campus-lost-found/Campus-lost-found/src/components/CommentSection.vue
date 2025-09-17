<template>
  <div class="comment-section mt-4 pt-4 border-top">
    <h4 class="mb-3">评论区</h4>

    <!-- 评论发布表单 -->
    <div v-if="itemStore.isAuthenticated" class="mb-4">
      <form @submit.prevent="submitComment">
        <div class="mb-2">
          <textarea
            v-model="newComment"
            class="form-control"
            rows="3"
            placeholder="输入你的问题或线索..."
            required
          ></textarea>
        </div>
        <div class="text-end">
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
            发布评论
          </button>
        </div>
      </form>
    </div>
    <div v-else class="alert alert-secondary text-center">
      请<router-link to="/login">登录</router-link>后发表评论
    </div>

    <!-- 评论列表 -->
    <div v-if="isLoading" class="text-center">
      <div class="spinner-border text-primary"></div>
    </div>
    <div v-else-if="comments.length > 0">
      <div v-for="comment in comments" :key="comment.id" class="comment-item card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <strong class="text-primary">{{ comment.author.username }}</strong>
            <small class="text-muted">{{ formatTime(comment.created_at) }}</small>
          </div>
          <p class="card-text mt-2 mb-0">{{ comment.content }}</p>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-muted">
      <p>暂无评论，快来抢沙发吧！</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import api from '@/axios';
import { useItemStore } from '@/stores/lostItems';

const props = defineProps({
  itemId: {
    type: [Number, String],
    required: true,
  },
});

const itemStore = useItemStore();

const comments = ref([]);
const newComment = ref('');
const isLoading = ref(true);
const isSubmitting = ref(false);

// 获取评论列表
const fetchComments = async () => {
  isLoading.value = true;
  try {
    const response = await api.get(`/items/${props.itemId}/comments`);
    comments.value = response.data;
  } catch (error) {
    console.error('获取评论失败:', error);
    alert('评论加载失败，请稍后重试。');
  } finally {
    isLoading.value = false;
  }
};

// 提交新评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    alert('评论内容不能为空！');
    return;
  }
  isSubmitting.value = true;
  try {
    const response = await api.post(`/items/${props.itemId}/comments`, {
      content: newComment.value,
    });
    // 将新评论添加到列表顶部，并清空输入框
    comments.value.unshift(response.data);
    newComment.value = '';
  } catch (error) {
    console.error('发布评论失败:', error);
    alert(error.response?.data?.message || '发布失败，请稍后重试。');
  } finally {
    isSubmitting.value = false;
  }
};

// 格式化时间
const formatTime = (timeString) => {
  try {
    return new Date(timeString + 'Z').toLocaleString('zh-CN');
  } catch {
    return timeString;
  }
};

// 组件挂载时获取评论
onMounted(() => {
  fetchComments();
});
</script>

<style scoped>
.comment-item {
  background-color: #f8f9fa;
}
</style>
