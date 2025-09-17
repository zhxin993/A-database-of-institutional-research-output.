<template>
  <div class="map-container mb-3">
    <label class="form-label">在地图上标记位置 (单击地图选点)</label>
    <div id="pickerMap" style="height: 300px; border: 1px solid #ced4da; border-radius: .25rem;"></div>
    <div v-if="selectedAddress" class="form-text mt-1">
      当前选择位置: {{ selectedAddress }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  // 用于编辑时回显位置
  initialPosition: {
    type: Object,
    default: null // { latitude: number, longitude: number }
  }
});

const emit = defineEmits(['location-selected']);

let map = null;
let marker = null;
const selectedAddress = ref('');

onMounted(() => {
  // 确保高德地图API已加载
  if (window.AMap) {
    initMap();
  } else {
    console.error("高德地图JS API未加载！");
  }
});

// 组件销毁时，销毁地图实例
onUnmounted(() => {
  if (map) {
    map.destroy();
  }
});

// 监听 initialPosition 的变化，用于编辑时的数据填充
watch(() => props.initialPosition, (newPos) => {
  if (newPos && newPos.latitude && newPos.longitude && map) {
    const lnglat = [newPos.longitude, newPos.latitude];
    placeMarker(lnglat);
    map.setCenter(lnglat);
  }
}, { immediate: true });


const initMap = () => {
  const startPosition = (props.initialPosition && props.initialPosition.longitude) 
    ? [props.initialPosition.longitude, props.initialPosition.latitude] 
    : [116.397428, 39.90923]; // 默认中心点（北京天安门）

  map = new AMap.Map('pickerMap', {
    zoom: 15,
    center: startPosition,
  });

  // 如果有初始位置，放置标记
  if (props.initialPosition && props.initialPosition.longitude) {
    placeMarker(startPosition);
  }

  // 监听地图点击事件
  map.on('click', (e) => {
    const lnglat = [e.lnglat.lng, e.lnglat.lat];
    placeMarker(lnglat);
  });
};

const placeMarker = (lnglat) => {
  // 如果已有标记，则清除
  if (marker) {
    map.remove(marker);
  }
  
  // 创建新标记
  marker = new AMap.Marker({
    position: lnglat,
  });
  map.add(marker);

  // 将经纬度转换为地址
  getAddress(lnglat);
};

const getAddress = (lnglat) => {
  AMap.plugin('AMap.Geocoder', function() {
    const geocoder = new AMap.Geocoder({
      radius: 1000,
      extensions: "base"
    });

    geocoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete' && result.info === 'OK') {
        const address = result.regeocode.formattedAddress;
        selectedAddress.value = address;

        // 触发事件，将经纬度和地址传给父组件
        emit('location-selected', {
          latitude: lnglat[1],
          longitude: lnglat[0],
          address: address
        });
      } else {
        selectedAddress.value = '无法获取地址';
        // 即使无法获取地址，也要把经纬度传出去
        emit('location-selected', {
          latitude: lnglat[1],
          longitude: lnglat[0],
          address: '未知地点'
        });
      }
    });
  });
}
</script>