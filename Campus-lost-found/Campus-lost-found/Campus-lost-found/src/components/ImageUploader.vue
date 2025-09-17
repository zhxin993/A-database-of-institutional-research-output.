<template>
  <div class="image-uploader mb-3">
    <label class="form-label">物品图片</label>
    <div v-if="previewUrl" class="mb-2">
      <img :src="previewUrl" alt="预览" class="img-thumbnail" style="max-height: 200px" />
    </div>
    <input type="file" class="form-control" accept="image/*" @change="handleFileChange" />
    <div v-if="error" class="text-danger mt-1">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["file-selected"]);
const previewUrl = ref(null);
const error = ref(null);

const handleFileChange = (e) => {
  const file = e.target.files[0];

  if (!file) {
    previewUrl.value = null;
    error.value = null;
    emit("file-selected", null);
    return;
  }

  // 验证文件类型
  if (!file.type.match("image.*")) {
    error.value = "请上传图片文件";
    return;
  }

  // 验证文件大小 (2MB以内)
  if (file.size > 2 * 1024 * 1024) {
    error.value = "图片大小不能超过2MB";
    return;
  }

  error.value = null;

  // 创建预览
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);

  // 触发事件
  emit("file-selected", file);
};
</script>
