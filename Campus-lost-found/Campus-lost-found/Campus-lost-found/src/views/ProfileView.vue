<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-lg-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">个人中心</h4>
          </div>
          <div class="card-body text-center">
            <div class="avatar mb-3">
              <img src="@/assets/smile.png" alt="用户头像" class="avatar-image" />
            </div>
            <h5>{{ itemStore.user.username }}</h5>
            <p class="text-muted mb-0">{{ itemStore.user.email }}</p>
            <!-- 在个人中心卡片底部添加 -->
            <div class="card-footer bg-white border-top">
              <router-link to="/messages" class="btn btn-block btn-outline-primary">
                <i class="bi bi-chat-dots"></i> 我的消息
              </router-link>
            </div>
            <hr />
            <button class="btn btn-outline-danger" @click="logout">
              <i class="bi bi-box-arrow-left me-1"></i> 退出登录
            </button>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <!-- 我的发布卡片 -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">我的发布</h4>
          </div>
          <div class="card-body">
            <div v-if="itemStore.myItems.length === 0" class="text-center py-4">
              <i class="bi bi-inbox" style="font-size: 3rem; opacity: 0.3"></i>
              <p class="mt-3">您还没有发布任何信息</p>
              <router-link to="/publish" class="btn btn-primary"> 去发布 </router-link>
            </div>

            <div v-else>
              <div class="mb-3">
                <div class="btn-group">
                  <button
                    v-for="filter in itemFilters"
                    :key="filter.value"
                    class="btn btn-sm"
                    :class="
                      activeItemFilter === filter.value ? 'btn-primary' : 'btn-outline-primary'
                    "
                    @click="activeItemFilter = filter.value"
                  >
                    {{ filter.label }}
                  </button>
                </div>
              </div>

              <div class="list-group">
                <div
                  v-for="item in filteredUserItems"
                  :key="item.id"
                  class="list-group-item list-group-item-action"
                >
                  <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{ item.title }}</h5>
                    <small>{{ formatDate(item.posted_at) }}</small>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mt-2">
                    <div>
                      <span class="badge me-2" :class="statusClass(item.status)">
                        {{ statusText(item.status) }}
                      </span>
                      <span class="text-muted small">
                        {{ item.type === "lost" ? "丢失" : "拾获" }} · {{ item.location }}
                      </span>
                    </div>
                    <div>
                      <button
                        v-if="item.status !== 'returned'"
                        class="btn btn-sm btn-success me-1"
                        @click="updateItemStatus(item.id, 'returned')"
                      >
                        <i class="bi bi-check-circle"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-secondary me-1"
                        @click="editItem(item.id)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="deleteItem(item.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
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
//import MatchResultCard from "@/components/MatchResultCard.vue";

const itemStore = useItemStore();
const router = useRouter();
const activeItemFilter = ref("all");
//const loading = ref(false);
//const testMatches = ref([]); // 测试匹配结果
//const showTestResults = ref(false); // 是否显示测试结果

const itemFilters = [
  { label: "全部", value: "all" },
  { label: "待处理", value: "pending" },
  { label: "已完成", value: "returned" },
];

const myItems = computed(() => itemStore.myItems);



const filteredUserItems = computed(() => {
  // 【修改这里】让筛选器作用于 myItems
  if (activeItemFilter.value === "all") return myItems.value;
  return myItems.value.filter((item) => item.status === activeItemFilter.value);
});

const statusText = (status) => {
  const statusMap = {
    pending: "待认领",
    returned: "已归还",
    found: "已拾获",
  };
  return statusMap[status] || status;
};

const statusClass = (status) => {
  const classMap = {
    pending: "bg-warning",
    returned: "bg-success",
    found: "bg-info",
  };
  return classMap[status] || "bg-secondary";
};

const formatDate = (dateString) => {
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
    return date.toLocaleString("zh-CN", options);
  } catch {
    return "无效日期";
  }
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



console.log("当前用户：", itemStore.currentUser);

onMounted(async () => {
  await itemStore.fetchMyItems();
});
</script>

<style scoped>
.avatar-placeholder {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto;
}
/* --- 【请在这里新增下面的样式】 --- */
.avatar-image {
  width: 100px; /* 设置头像宽度 */
  height: 100px; /* 设置头像高度 */
  border-radius: 50%; /* 关键：这会让图片变成圆形 */
  object-fit: cover; /* 防止图片被拉伸变形，它会裁剪图片以适应容器 */
  border: 3px solid #fff; /* (可选) 添加一个白色边框 */
  box-shadow: 0 2px 4px rgba(144, 81, 81, 0.1); /* (可选) 添加一点阴影效果 */
}
/* --- 新增样式结束 --- */
.list-group-item {
  transition: all 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>
