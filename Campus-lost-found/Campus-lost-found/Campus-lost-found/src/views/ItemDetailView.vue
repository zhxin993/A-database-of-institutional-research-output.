<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">物品详情</h3>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else-if="item">
              <div class="text-center mb-4">
                <img
                  v-if="fullImageUrl"
                  :src="fullImageUrl"
                  class="img-fluid rounded mb-3"
                  style="max-height: 300px"
                />

                <div
                  v-else
                  class="bg-light border rounded d-flex align-items-center justify-content-center"
                  style="height: 200px"
                >
                  <span class="text-muted">暂无图片</span>
                </div>
                <div class="d-flex justify-content-center align-items-center mb-2 gap-2">
                  <h2 class="mb-0">{{ item.title }}</h2>
                  <button v-if="!isOwner && itemStore.isAuthenticated && item?.userId && itemStore.user && itemStore.user.id" class="btn btn-primary btn-sm ms-2" @click="openMessageDialog(item.userId)">
                    联系发布者
                  </button>
                </div>
                <div class="d-flex justify-content-center gap-2 mb-2">
                  <span class="badge bg-primary">{{
                    item.type === "lost" ? "丢失物品" : "拾获物品"
                  }}</span>
                  <span class="badge" :class="statusClass">{{ statusText }}</span>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="card h-100">
                    <div class="card-header bg-light">基本信息</div>
                    <div class="card-body">
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between">
                          <span class="fw-bold">分类</span>
                          <span>{{ item.category || "未分类" }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                          <span class="fw-bold">地点</span>
                          <span>{{ item.location }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                          <span class="fw-bold">时间</span>
                          <span>{{ formatDateTime(item.lost_or_found_time) }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                          <span class="fw-bold">发布者</span>
                          <span>{{ item.username }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                          <span class="fw-bold">发布时间</span>
                          <span>{{ houformatDateTime(item.createdAt) }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card h-100">
                    <div class="card-header bg-light">详细描述</div>
                    <div class="card-body">
                      <p>{{ item.description || "暂无详细描述" }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="item.latitude && item.longitude" class="mt-4">
                <StaticMap :latitude="item.latitude" :longitude="item.longitude" />
              </div>
              <div v-if="isOwner" class="d-flex justify-content-end gap-2">
                <button
                  v-if="item.status !== 'returned'"
                  class="btn btn-success"
                  @click="markAsReturned"
                >
                  标记为已归还
                </button>
                <router-link
                  :to="{ name: 'publish', query: { edit: item.id } }"
                  class="btn btn-outline-primary"
                >
                  编辑
                </router-link>
                <button class="btn btn-outline-danger" @click="deleteItem">删除</button>
              </div>
            </div>

            <div v-else class="alert alert-danger">物品信息不存在</div>
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemStore } from "@/stores/lostItems";
import { useMessageStore } from '@/stores/messages';
import api from "@/axios"; // <--- 关键修改：导入 api 实例
import StaticMap from '@/components/StaticMap.vue'; // 【新增】导入静态地图组件
const itemStore = useItemStore();
const route = useRoute();
const router = useRouter();
const messageStore = useMessageStore();

const item = ref(null);
const loading = ref(true);



// 【修改】修改计算属性，使其生成一个相对路径
const fullImageUrl = computed(() => {
  if (item.value && item.value.image_url) {
    // 直接返回后端提供的相对路径，并在前面加上'/'
    // 例如，从 "static/uploads/image.jpg" 变成 "/static/uploads/image.jpg"
    return `/${item.value.image_url}`;
  }
  return '';
});
const statusText = computed(() => {
  const statusMap = {
    lost: "待寻找",
    found: "待认领",
    returned: "已归还",
    pending: "待处理",
  };
  return statusMap[item.value?.status] || item.value?.status;
});

const statusClass = computed(() => {
  const classMap = {
    lost: "bg-warning",
    found: "bg-info",
    returned: "bg-success",
    pending: "bg-secondary",
  };
  return classMap[item.value?.status] || "bg-secondary";
});

const isOwner = computed(() => {
  return item.value && itemStore.user && itemStore.user.id && item.value.userId === itemStore.user.id;
});

const formatDateTime = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
const houformatDateTime = (dateString) => {
  // 如果日期字符串不存在，返回 "无"
  if (!dateString) {
    return "无";
  }

  try {
    const date = new Date(dateString);

    // 【关键】获取原始的小时数并手动加上 8
    date.setHours(date.getHours() + 8);

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 使用24小时制
    };

    // 使用增加了8小时后的新日期对象进行格式化
    return date.toLocaleString('zh-CN', options);

  } catch {
    return "无效日期";
  }
};
const markAsReturned = () => {
  if (confirm("确定要标记为已归还吗？")) {
    itemStore.updateItemStatus(item.value.id, "returned");
    item.value.status = "returned";
  }
};

const deleteItem = () => {
  if (confirm("确定要删除这个物品信息吗？")) {
    itemStore.deleteItem(item.value.id);
    router.push("/");
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
    // 【关键修改】
    // 此处调用的是我们在 stores/messages.js 中重构后的统一函数 sendMessage
    // 参数的传递方式也从一个对象，变成了直接传递两个独立的参数
    await messageStore.sendMessage(dialogUserId.value, messageContent.value);
    
    alert("发送成功！");
    showDialog.value = false; // 关闭对话框
  } catch (err) {
    // 可以在控制台打印更详细的错误，方便未来调试
    console.error("消息发送失败:", err);
    alert("发送失败");
  }
};

import axios from "axios";

onMounted(async () => {
  const itemId = route.params.id;
  try {
    // <--- 关键修改：使用 api 并移除 /api 前缀
    const res = await api.get(`/items/${itemId}`);
    const raw = res.data;
    item.value = {
      ...raw,
      time: raw.lost_or_found_time||raw.time, // 丢失/拾获时间字段映射
      userId: raw.user_id ?? raw.userId // 统一 userId 字段
    };
  } catch (err) {
    console.error("物品加载失败", err);
    item.value = null;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
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
