<template>
  <div class="profile-page-wrapper">
    <div class="container mt-4">
      <div class="row">
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">个人中心</h4>
            </div>
            <div class="card-body text-center">
              <div class="avatar-container mb-3" @click="triggerAvatarUpload">
                <img 
                  :src="avatarSrc" 
                  alt="用户头像" 
                  class="avatar-image"
                  @error.once="e => e.target.src = '/static/uploads/avatars/default.png'"
                />
                <div class="avatar-overlay">
                  <i class="bi bi-camera-fill"></i>
                  <span>更换头像</span>
                </div>
                <input type="file" ref="avatarInput" @change="handleAvatarChange" accept="image/*" style="display: none;" />
              </div>
              
              <div class="d-flex justify-content-center align-items-center gap-2 mb-2">
                <h5>{{ itemStore.user?.username }}</h5>
                <span v-if="itemStore.userProfile" class="badge bg-danger rounded-pill">
                  <i class="bi bi-heart-fill"></i> {{ itemStore.userProfile.total_likes_received }}
                </span>
              </div>

              <p class="text-muted mb-3">{{ itemStore.user?.email || '暂无邮箱' }}</p>

              <router-link to="/messages" class="btn btn-block btn-outline-primary w-100 mb-2">
                <i class="bi bi-chat-dots"></i> 我的消息
              </router-link>
              <button class="btn btn-outline-danger w-100" @click="logout">
                <i class="bi bi-box-arrow-left"></i> 退出登录
              </button>
            </div>
          </div>
        </div>
        <div class="col-lg-8">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary text-white"><h4 class="mb-0">我的发布</h4></div>
            <div class="card-body">
              <!-- 【关键修改】使用 v-if="!loading" 包裹内容区 -->
              <div v-if="!loading">
                <div v-if="myItems.length > 0">
                  <div class="btn-group mb-3">
                    <button
                      v-for="filter in itemFilters"
                      :key="filter.value"
                      class="btn btn-sm"
                      :class="activeItemFilter === filter.value ? 'btn-primary' : 'btn-outline-primary'"
                      @click="activeItemFilter = filter.value"
                    >
                      {{ filter.label }}
                    </button>
                  </div>
                  <div class="list-group">
                    <div v-for="item in filteredUserItems" :key="item.id" class="list-group-item list-group-item-action">
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{{ item.title }}</h5>
                        <small>{{ formatDate(item.posted_at) }}</small>
                      </div>
                      <div class="d-flex justify-content-between align-items-center mt-2">
                        <div>
                          <span class="badge me-2" :class="statusClass(item.status)">{{ statusText(item.status) }}</span>
                        </div>
                        <div>
                          <button v-if="item.status !== 'returned'" class="btn btn-sm btn-success me-1" @click="updateItemStatus(item.id, 'returned')"><i class="bi bi-check-circle"></i></button>
                          <button class="btn btn-sm btn-outline-secondary me-1" @click="editItem(item.id)"><i class="bi bi-pencil"></i></button>
                          <button class="btn btn-sm btn-outline-danger" @click="deleteItem(item.id)"><i class="bi bi-trash"></i></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4">
                  <p>您还没有发布任何信息</p>
                  <router-link to="/publish" class="btn btn-primary mt-2">去发布</router-link>
                </div>
              </div>
              <!-- 【关键修改】当 loading 为 true 时，显示加载动画 -->
               <div v-else class="text-center py-5">
                  <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
                  <p class="mt-3 text-muted">正在加载您的数据...</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useItemStore } from "@/stores/lostItems";

const itemStore = useItemStore();
const router = useRouter();
const activeItemFilter = ref("all");

// 【关键修改】新增一个 loading 状态
const loading = ref(true);

const itemFilters = [
  { label: "全部", value: "all" },
  { label: "待处理", value: "pending" },
  { label: "已完成", value: "returned" },
];

const myItems = computed(() => itemStore.myItems);

const filteredUserItems = computed(() => {
  if (activeItemFilter.value === "all") return myItems.value;
  return myItems.value.filter((item) => item.status === activeItemFilter.value);
});

onMounted(async () => {
  // 【关键修改】在开始获取数据前，确保 loading 为 true
  loading.value = true;
  if (itemStore.isAuthenticated) {
    // 使用 Promise.all 来并行请求数据，提高效率
    try {
      await Promise.all([
        itemStore.fetchMyItems(),
        itemStore.fetchUserProfile()
      ]);
    } catch (error) {
      console.error("加载个人中心数据失败:", error);
    } finally {
      // 无论成功或失败，最后都将 loading 设置为 false
      loading.value = false;
    }
  } else {
    // 如果用户未登录，也结束 loading
    loading.value = false;
  }
});

const avatarInput = ref(null);
const avatarSrc = computed(() => {
  return itemStore.user?.avatar_url ? `/${itemStore.user.avatar_url}` : '/static/uploads/avatars/default.png';
});

const triggerAvatarUpload = () => {
  avatarInput.value.click();
};

const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过 2MB');
    return;
  }
  try {
    await itemStore.uploadAvatar(file);
  } catch (error) {
    console.log("上传失败，详见弹窗");
  }
};

const statusText = (status) => {
  const statusMap = { pending: "待认领", returned: "已归还", found: "已拾获" };
  return statusMap[status] || status;
};

const statusClass = (status) => {
  const classMap = { pending: "bg-warning", returned: "bg-success", found: "bg-info" };
  return classMap[status] || "bg-secondary";
};

const formatDate = (dateString) => {
  if (!dateString) return "无";
  try {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 8);
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false };
    return date.toLocaleString("zh-CN", options);
  } catch { return "无效日期"; }
};

const updateItemStatus = (id, status) => {
  if (confirm("确定要更新状态吗？")) {
    itemStore.updateItemStatus(id, status);
  }
};

const deleteItem = (id) => {
  if (confirm("确定要删除这条信息吗？")) {
    itemStore.deleteItem(id);
  }
};

const editItem = (id) => {
  router.push({ name: "publish", query: { edit: id } });
};

const logout = () => {
  itemStore.logout();
  router.push("/login");
};
</script>

<style scoped>
.profile-page-wrapper {
  background-color: #f4f7f6;
  padding-top: 1rem;
  padding-bottom: 3rem;
  min-height: calc(100vh - 56px - 72px);
}

.profile-page-wrapper .col-lg-4 .card .card-header {
    border-top: 4px solid var(--primary-color, #5D9CEC);
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease;
}
.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.avatar-container:hover .avatar-image {
  filter: brightness(0.7);
}
.avatar-container:hover .avatar-overlay {
  opacity: 1;
}
.avatar-overlay i {
  font-size: 2rem;
}
.avatar-overlay span {
  font-size: 0.8rem;
  margin-top: 5px;
}
.list-group-item {
  transition: all 0.2s;
}
.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>
