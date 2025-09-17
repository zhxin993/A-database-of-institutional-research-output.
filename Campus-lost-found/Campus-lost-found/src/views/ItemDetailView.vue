<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <!-- 物品详情卡片 -->
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">物品详情</h3>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border text-primary" role="status"></div>
            </div>

            <div v-else-if="item">
              <div class="text-center mb-4">
                <img v-if="fullImageUrl" :src="fullImageUrl" class="img-fluid rounded mb-3" style="max-height: 300px"/>
                <div v-else class="bg-light border rounded d-flex align-items-center justify-content-center" style="height: 200px">
                  <span class="text-muted">暂无图片</span>
                </div>
                <h2 class="mb-0">{{ item.title }}</h2>
              </div>

              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="card h-100">
                    <div class="card-header bg-light">基本信息</div>
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item d-flex justify-content-between"><b>分类:</b> <span>{{ item.category || "未分类" }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><b>地点:</b> <span>{{ item.location }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><b>时间:</b> <span>{{ formatDateTime(item.lost_or_found_time) }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><b>发布者:</b> <span>{{ item.username }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><b>发布时间:</b> <span>{{ houformatDateTime(item.createdAt) }}</span></li>
                      <li class="list-group-item d-flex justify-content-between align-items-center"><b>总点赞数:</b><span class="text-danger fw-bold"><i class="bi bi-heart-fill"></i> {{ item.like_count || 0 }}</span></li>
                    </ul>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card h-100">
                    <div class="card-header bg-light">详细描述</div>
                    <div class="card-body"><p>{{ item.description || "暂无详细描述" }}</p></div>
                  </div>
                </div>
              </div>

              <div v-if="item.latitude && item.longitude" class="mt-4">
                <StaticMap :latitude="item.latitude" :longitude="item.longitude" />
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button v-if="!isOwner && itemStore.isAuthenticated" class="btn" :class="isLikedByCurrentUser ? 'btn-danger' : 'btn-outline-danger'" @click="toggleLike" :disabled="likeLoading">
                  <span v-if="likeLoading" class="spinner-border spinner-border-sm me-1"></span>
                  <i class="bi" :class="isLikedByCurrentUser ? 'bi-heart-fill' : 'bi-heart'"></i> {{ isLikedByCurrentUser ? '取消点赞' : '点赞' }}
                </button>
                <button v-if="!isOwner && itemStore.isAuthenticated" class="btn btn-outline-primary" @click="openMessageDialog(item.userId)">联系发布者</button>
                <template v-if="isOwner">
                  <button v-if="item.status !== 'returned'" class="btn btn-success" @click="markAsReturned">标记为已归还</button>
                  <router-link :to="{ name: 'publish', query: { edit: item.id } }" class="btn btn-outline-secondary">编辑</router-link>
                  <button class="btn btn-outline-danger" @click="deleteItem">删除</button>
                </template>
              </div>
            </div>

            <div v-else class="alert alert-danger">物品信息不存在</div>
          </div>
        </div>

        <!-- 【新增】评论区组件 -->
        <!-- 只有当物品信息加载完成后才显示评论区 -->
        <CommentSection v-if="item" :item-id="item.id" />
        
      </div>
    </div>
    <!-- 私信弹窗 -->
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemStore } from "@/stores/lostItems";
import { useMessageStore } from '@/stores/messages';
import api from "@/axios";
import StaticMap from '@/components/StaticMap.vue';
import CommentSection from '@/components/CommentSection.vue'; // <-- 【新增】导入评论区组件

const itemStore = useItemStore();
const route = useRoute();
const router = useRouter();
const messageStore = useMessageStore();

const item = ref(null);
const loading = ref(true);
const likeLoading = ref(false);
const isLikedByCurrentUser = ref(false);

// --- 【以下所有 script 部分的代码都保持不变】 ---
const fullImageUrl = computed(() => {
  if (item.value && item.value.image_url) {
    return `/${item.value.image_url}`;
  }
  return '';
});
const isOwner = computed(() => {
  return item.value && itemStore.user && itemStore.user.id && item.value.userId === itemStore.user.id;
});
const toggleLike = async () => {
  if (!itemStore.isAuthenticated) {
    alert("请先登录再进行操作");
    router.push('/login');
    return;
  }
  likeLoading.value = true;
  try {
    let response;
    if (isLikedByCurrentUser.value) {
      response = await itemStore.unlikeItem(item.value.id);
      isLikedByCurrentUser.value = false;
    } else {
      response = await itemStore.likeItem(item.value.id);
      isLikedByCurrentUser.value = true;
    }
    if (response && typeof response.like_count === 'number') {
      item.value.like_count = response.like_count;
    }
  } catch (error) {
    console.error("点赞/取消点赞操作失败", error);
  } finally {
    likeLoading.value = false;
  }
};
onMounted(async () => {
  const itemId = route.params.id;
  try {
    const res = await api.get(`/items/${itemId}`);
    const raw = res.data;
    item.value = { ...raw, userId: raw.user_id ?? raw.userId };
    isLikedByCurrentUser.value = raw.is_liked;
  } catch (err) {
    console.error("物品加载失败", err);
    item.value = null;
  } finally {
    loading.value = false;
  }
});
const statusText = computed(() => {
  const map = { lost: "待寻找", found: "待认领", returned: "已归还", pending: "待处理" };
  return item.value ? map[item.value.status] : '';
});
const statusClass = computed(() => {
  const map = { lost: "bg-warning", found: "bg-info", returned: "bg-success", pending: "bg-secondary" };
  return item.value ? map[item.value.status] : '';
});
const formatDateTime = (dateString) => {
  if (!dateString) return "无";
  const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
const houformatDateTime = (dateString) => {
  if (!dateString) return "无";
  try {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 8);
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false };
    return date.toLocaleString('zh-CN', options);
  } catch { return "无效日期"; }
};
const markAsReturned = () => { if(confirm("确定标记为已归还吗？")) { itemStore.updateItemStatus(item.value.id, "returned"); item.value.status = 'returned'; } };
const deleteItem = () => { if(confirm("确定删除吗？")) { itemStore.deleteItem(item.value.id); router.push('/'); }};
const showDialog = ref(false);
const dialogUserId = ref(null);
const messageContent = ref("");
const openMessageDialog = (userId) => {
  dialogUserId.value = userId;
  messageContent.value = "";
  showDialog.value = true;
};
const sendMessage = async () => {
    if (!messageContent.value.trim()) return;
    try {
        await messageStore.sendMessage(dialogUserId.value, messageContent.value);
        alert('发送成功');
        showDialog.value = false;
    } catch(e) {
        alert('发送失败');
    }
};
</script>

<style scoped>
.dialog-mask { position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.2); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.dialog-box { background: #fff; border-radius: 8px; padding: 24px; min-width: 320px; box-shadow: 0 2px 16px rgba(0,0,0,0.15); }
</style>
