<template>
  <div class="search-bar mb-4">
    <div class="input-group">
      <input
        type="text"
        class="form-control"
        placeholder="搜索物品名称或描述..."
        v-model="keyword"
        @keyup.enter="search"
      />
      <button class="btn btn-primary" type="button" @click="search">
        <i class="bi bi-search"></i>
      </button>
      <button class="btn btn-outline-secondary" type="button" @click="resetFilters">
        重置
      </button>
    </div>

    <div class="row mt-2 g-2">
      <div class="col-md-6">
        <select class="form-select" v-model="category">
          <option value="">所有分类</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="col-md-6">
        <select class="form-select" v-model="type">
          <option value="">所有类型</option>
          <option value="lost">丢失物品</option>
          <option value="found">拾获物品</option>
        </select>
      </div>
    </div>

    <div class="row mt-2 g-2">
      <div class="col-md-6">
        <label class="form-label small text-muted">开始日期时间</label>
        <div class="input-group">
          <input type="date" class="form-control" v-model="start_date" />
          <input type="time" class="form-control" v-model="start_time" />
        </div>
      </div>
      <div class="col-md-6">
        <label class="form-label small text-muted">结束日期时间</label>
        <div class="input-group">
          <input type="date" class="form-control" v-model="end_date" />
          <input type="time" class="form-control" v-model="end_time" />
        </div>
      </div>
    </div>

    <div class="row mt-2 g-2">
      <div class="col-md-4">
        <input
          type="number"
          step="0.0001"
          class="form-control"
          v-model.number="center_lat"
          placeholder="中心纬度"
        />
      </div>
      <div class="col-md-4">
        <input
          type="number"
          step="0.0001"
          class="form-control"
          v-model.number="center_lon"
          placeholder="中心经度"
        />
      </div>
      <div class="col-md-4">
        <input
          type="number"
          step="0.1"
          class="form-control"
          v-model.number="radius_km"
          placeholder="半径(公里)"
        />
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, defineEmits } from "vue";

const emit = defineEmits(["search"]);

// 定义所有筛选条件对应的 ref
const keyword = ref("");
const category = ref("");
const type = ref("");
const start_date = ref("");
const start_time = ref("");
const end_date = ref("");
const end_time = ref("");
const center_lat = ref(null);
const center_lon = ref(null);
const radius_km = ref(null);

const categories = ["证件类", "电子产品", "书籍资料", "衣物配饰", "生活用品", "钥匙", "其他"];


const search = () => {
  // 准备一个将要发送给父组件的参数对象
  const params = {
    keyword: keyword.value,
    category: category.value,
    type: type.value,
    start_date: undefined, // 先置为 undefined
    end_date: undefined,   // 先置为 undefined
    center_lat: center_lat.value,
    center_lon: center_lon.value,
    radius_km: radius_km.value,
  };

  // 只有当日期和时间都填写了，才合并它们
  if (start_date.value && start_time.value) {
    params.start_date = `${start_date.value}T${start_time.value}`;
  }

  if (end_date.value && end_time.value) {
    params.end_date = `${end_date.value}T${end_time.value}`;
  }

  // 清理掉所有值为 null, undefined, 或空字符串 "" 的字段
  // 这样可以确保我们只发送有意义的筛选条件
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === undefined || params[key] === '') {
      delete params[key];
    }
  });

  console.log("【前端日志】最终发送的筛选参数:", params);
  emit("search", params);
};

const resetFilters = () => {
  // 1. 将所有用于筛选的 ref 变量全部清空或恢复到初始值
  keyword.value = "";
  category.value = "";
  type.value = "";
  start_date.value = "";
  start_time.value = "";
  end_date.value = "";
  end_time.value = "";
  center_lat.value = null;
  center_lon.value = null;
  radius_km.value = null;
  
  // 2. 调用一次 search() 函数
  //    因为所有筛选条件都已清空，这次搜索会向后端发送一个空的请求，
  //    从而获取到所有物品的列表，实现“回归原始状态”的效果。
  search(); 
};
</script>