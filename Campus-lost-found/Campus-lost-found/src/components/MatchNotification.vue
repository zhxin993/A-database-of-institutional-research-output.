<template>
  <div class="match-notification alert alert-info">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <h6 class="mb-1">发现匹配项！</h6>
        <p class="mb-0 small">
          <span v-if="notification.type === 'lost'">
            您发布的"{{ notification.lostItem?.title || notification.lostItem?.name }}"可能与拾获物品匹配
          </span>
          <span v-else> 您拾获的"{{ notification.foundItem?.title || notification.foundItem?.name }}"可能与失物匹配 </span>
        </p>
      </div>
      <router-link
        :to="
          notification.type === 'lost'
            ? `/item/${notification.foundItem?.id}`
            : `/item/${notification.lostItem?.id}`
        "
        class="btn btn-sm btn-outline-primary"
      >
        查看详情
      </router-link>
    </div>
  </div>
</template>

<script setup>
defineProps({
  notification: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.match-notification {
  border-left: 4px solid #0dcaf0;
}
</style>
