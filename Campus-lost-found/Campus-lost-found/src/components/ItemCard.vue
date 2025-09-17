<template>
  <div class="card h-100 shadow-sm">
    <div v-if="item.image" class="card-img-top-container">
      <img :src="item.image" class="card-img-top" alt="物品图片" />
    </div>
    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start">
        <h5 class="card-title">{{ item.title }}</h5>
        <span class="badge" :class="statusClass">{{ statusText }}</span>
      </div>
      <p class="card-text text-muted small mb-1">
        <i class="bi bi-geo-alt"></i> {{ item.location }}
      </p>
      <p class="card-text text-muted small mb-2">
        <i class="bi bi-clock"></i> {{ formatDate(item.lost_or_found_time) }}
      </p>
      <p class="card-text clamp-2 flex-grow-1">{{ item.description }}</p>
      <div class="d-flex justify-content-between align-items-center mt-auto pt-2">
        <span class="text-muted small">发布者: {{ item.username }}</span>
        
        <div class="d-flex align-items-center gap-2">
          <span class="text-danger d-flex align-items-center">
            <i class="bi bi-heart-fill me-1"></i>
            {{ item.like_count || 0 }}
          </span>
          <router-link :to="`/item/${item.id}`" class="btn btn-sm btn-outline-primary">
            查看详情
          </router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const statusText = computed(() => {
  const statusMap = {
    lost: "丢失",
    found: "拾获",
    returned: "已归还",
    pending: "待认领",
  };
  return statusMap[props.item.status] || props.item.status;
});

const statusClass = computed(() => {
  const classMap = {
    lost: "bg-danger",
    found: "bg-success",
    returned: "bg-secondary",
    pending: "bg-warning",
  };
  return classMap[props.item.status] || "bg-secondary";
});

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return '无具体时间';
  try {
    // 直接将 "2025-07-03T09:47:00" 这样的字符串截取成 "2025-07-03 09:47"
    return dateTimeString.replace('T', ' ').substring(0, 16);
  } catch {
    return '日期无效';
  }
};
</script>

<style scoped>
.card-img-top-container {
  height: 180px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.card-img-top {
  max-height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
