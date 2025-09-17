<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">发布失物/招领信息</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitForm">
              <div class="mb-3">
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    id="lost"
                    value="lost"
                    v-model="form.type"
                  />
                  <label class="form-check-label" for="lost">丢失物品</label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    id="found"
                    value="found"
                    v-model="form.type"
                  />
                  <label class="form-check-label" for="found">拾获物品</label>
                </div>
              </div>

              <div class="mb-3">
                <label for="name" class="form-label">物品名称</label>
                <input type="text" class="form-control" id="name" v-model="form.name" required />
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="category" class="form-label">物品分类</label>
                  <select class="form-select" id="category" v-model="form.category" required>
                    <option v-for="category in categories" :key="category" :value="category">
                      {{ category }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="location" class="form-label">地点</label>
                  <input
                    type="text"
                    class="form-control"
                    id="location"
                    v-model="form.location"
                    required
                    placeholder="可手动输入，或在下方地图上点击选择"
                  />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="date" class="form-label">日期</label>
                  <input type="date" class="form-control" id="date" v-model="form.date" required />
                </div>
                <div class="col-md-6">
                  <label for="time" class="form-label">时间</label>
                  <input type="time" class="form-control" id="time" v-model="form.time" required />
                </div>
              </div>

              <div class="mb-3">
                <label for="description" class="form-label">详细描述</label>
                <textarea
                  class="form-control"
                  id="description"
                  rows="4"
                  v-model="form.description"
                  placeholder="请详细描述物品特征、颜色、品牌等信息..."
                ></textarea>
              </div>

              <ImageUploader @file-selected="handleImageSelected" :initial-image-url="form.imageUrl" />

              <LocationPicker 
                @location-selected="handleLocationSelected"
                :initial-position="{ latitude: form.latitude, longitude: form.longitude }"
              />

              <div class="d-grid mt-4">
                <button type="submit" class="btn btn-primary btn-lg">发布信息</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemStore } from "@/stores/lostItems";
import ImageUploader from "@/components/ImageUploader.vue";
import api from "@/axios"; // <--- 关键修改：导入 api 实例
import LocationPicker from "@/components/LocationPicker.vue"; // 【新增】导入地图组件

const itemStore = useItemStore();
const router = useRouter();
const route = useRoute();

const form = ref({
  type: "lost",
  name: "",
  category: "",
  location: "",
  date: "",
  time: "",
  description: "",
  image: null,
  latitude: null,  // 【新增】
  longitude: null, // 【新增】
  imageUrl: '' // 用于编辑时显示旧图片
});

const categories = itemStore.categories;
const isEditing = ref(false);
const editingItemId = ref(null);



const handleLocationSelected = (data) => {
  form.value.latitude = data.latitude;
  form.value.longitude = data.longitude;
  form.value.location = data.address; // 用逆地理编码的地址自动填充地点输入框
};

onMounted(async () => {
  if (route.query.edit) {
    isEditing.value = true;
    editingItemId.value = route.query.edit;

    try {
      // <--- 关键修改：使用 api 并移除 /api 前缀
      const res = await api.get(`/items/${editingItemId.value}`);
      const itemData = res.data;

      form.value = {
        type: itemData.type,
        name: itemData.title,
        category: itemData.category,
        location: itemData.location,
        description: itemData.description,
        date: itemData.lost_or_found_time ? itemData.lost_or_found_time.split("T")[0] : "",
        time: itemData.lost_or_found_time
          ? itemData.lost_or_found_time.split("T")[1].substring(0, 5)
          : "",
        image: null,
        latitude: itemData.latitude,   // 【新增】
        longitude: itemData.longitude, // 【新增】
        imageUrl: itemData.image_url,
      };
    } catch (err) {
      console.error("获取待编辑物品信息失败:", err);
      alert("加载物品信息失败！");
      router.push("/profile");
    }
  }
});

const handleImageSelected = (file) => {
  form.value.image = file;
};

const submitForm = async () => {
  const formData = new FormData();
  formData.append("title", form.value.name);
  formData.append("description", form.value.description);
  formData.append("type", form.value.type);
  formData.append("location", form.value.location);
  formData.append("category", form.value.category);

  if (form.value.latitude && form.value.longitude) {
    formData.append('latitude', form.value.latitude);
    formData.append('longitude', form.value.longitude);
  }

  if (form.value.image) {
    formData.append("image", form.value.image);
  }

  if (form.value.date && form.value.time) {
    const fullDateTime = `${form.value.date}T${form.value.time}`;
    formData.append("lost_or_found_time", fullDateTime);
  }

  if (isEditing.value) {
    try {
      // <--- 关键修改：使用 api.put 并移除 /api 前缀，移除手动添加的 headers
      await api.put(`/items/${editingItemId.value}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("更新成功！");
      router.push("/profile");
    } catch (err) {
      console.error("更新失败：", err);
      if (err.response) {
        alert("更新失败：" + (err.response.data.message || JSON.stringify(err.response.data)));
      } else {
        alert("更新失败：" + err.message);
      }
    }
  } else {
    try {
      // <--- 关键修改：使用 api.post 并移除 /api 前缀，移除手动添加的 headers
      const res = await api.post("/post_item", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newItemId = res.data.id;
      if (newItemId) {
        // 1. 调用智能匹配
        const matches = await itemStore.findMatches(newItemId);
        
        // 2. 将匹配结果存入 Store
        itemStore.setLatestMatches(matches);
      }
      
      // 3. 提示用户并跳转页面
      alert("发布成功！正在跳转到匹配结果页...");
      router.push("/messages"); // 或者 router.push({ name: 'messages' });

      }
      catch (err) {
      console.error("发布失败：", err);
      if (err.response) {
        alert("发布失败：" + (err.response.data.message || JSON.stringify(err.response.data)));
      } else {
        alert("发布失败：" + err.message);
      }
    }
  }
};
</script>