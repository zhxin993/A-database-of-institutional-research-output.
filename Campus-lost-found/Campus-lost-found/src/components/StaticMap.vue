<template>
  <div class="map-display-container">
    <label class="form-label">地图位置</label>
    <div :id="mapId" style="height: 250px; border: 1px solid #ced4da; border-radius: .25rem;"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

// 生成一个唯一的ID，防止页面上有多个地图时冲突
const mapId = ref(`static-map-${Math.random().toString(36).substr(2, 9)}`);
let map = null;

onMounted(() => {
  if (window.AMap && props.latitude && props.longitude) {
    initMap();
  }
});

const initMap = () => {
  const position = [props.longitude, props.latitude];
  map = new AMap.Map(mapId.value, {
    zoom: 16,
    center: position,
    dragEnable: false, // 禁止拖拽
    zoomEnable: false, // 禁止缩放
  });

  const marker = new AMap.Marker({
    position: position,
  });
  map.add(marker);
};

// 监听属性变化，以防数据异步加载
watch(props, (newProps) => {
  if (!map && newProps.latitude && newProps.longitude && window.AMap) {
    initMap();
  }
});
</script>