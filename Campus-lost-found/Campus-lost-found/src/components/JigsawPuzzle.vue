<template>
  <!-- 游戏模态框的遮罩层 -->
  <div class="puzzle-overlay" @click.self="closeGame">
    <div class="puzzle-container card shadow-lg">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">校园拼图挑战 (8x8)</h5>
        <button type="button" class="btn-close" @click="closeGame"></button>
      </div>
      <div class="card-body">
        <!-- 游戏胜利提示 -->
        <div v-if="isComplete" class="completion-message alert alert-success text-center">
          <h4>太棒了，挑战成功！</h4>
          <button class="btn btn-primary mt-2" @click="initPuzzle">再玩一次</button>
        </div>

        <!-- 游戏主区域 -->
        <div class="game-area">
          <!-- 拼图板 -->
          <div class="puzzle-board" :style="gridStyle">
            <div
              v-for="i in gridSize * gridSize"
              :key="`cell-${i}`"
              class="puzzle-cell"
              @dragover.prevent
              @drop="onDrop(i - 1)"
            >
              <div
                v-if="board[i - 1]"
                class="puzzle-piece"
                :style="getPieceStyle(board[i - 1])"
                :draggable="false"
              ></div>
            </div>
          </div>

          <!-- 待选碎片区 -->
          <div class="pieces-pool">
            <div
              v-for="piece in shuffledPieces"
              :key="`piece-${piece.id}`"
              class="puzzle-piece-container"
              :draggable="!piece.placed"
              @dragstart="onDragStart(piece)"
              :class="{ 'is-placed': piece.placed }"
            >
              <div
                v-if="!piece.placed"
                class="puzzle-piece"
                :style="getPieceStyle(piece)"
              ></div>
            </div>
          </div>
        </div>
        <div class="text-center mt-3">
            <button class="btn btn-secondary btn-sm" @click="initPuzzle">重置游戏</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineEmits } from 'vue';

const emit = defineEmits(['close']);

// --- 【关键修改】游戏配置 ---
const gridSize = ref(8); // 将网格大小改为 8x8
const puzzleImage = ref('/good.png'); // 使用一张新的占位图，您也可以替换成自己的图片URL
const containerSize = 400; // 拼图板的尺寸，调整为400px以适应更多碎片

// --- 游戏状态 (保持不变) ---
const pieces = ref([]);
const shuffledPieces = ref([]);
const board = ref([]);
const draggedPiece = ref(null);
const isComplete = ref(false);

// --- 计算属性 (保持不变) ---
const pieceSize = computed(() => containerSize / gridSize.value);
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridSize.value}, 1fr)`,
  gridTemplateRows: `repeat(${gridSize.value}, 1fr)`,
  width: `${containerSize}px`,
  height: `${containerSize}px`,
}));

// --- 游戏方法 (保持不变) ---
const getPieceStyle = (piece) => ({
  backgroundImage: `url(${puzzleImage.value})`,
  backgroundSize: `${containerSize}px ${containerSize}px`,
  backgroundPosition: `-${piece.col * pieceSize.value}px -${piece.row * pieceSize.value}px`,
  width: `${pieceSize.value}px`,
  height: `${pieceSize.value}px`,
});

const initPuzzle = () => {
  isComplete.value = false;
  pieces.value = [];
  board.value = Array(gridSize.value * gridSize.value).fill(null);

  for (let i = 0; i < gridSize.value; i++) {
    for (let j = 0; j < gridSize.value; j++) {
      pieces.value.push({
        id: i * gridSize.value + j,
        row: i,
        col: j,
        placed: false,
      });
    }
  }
  shuffledPieces.value = [...pieces.value].sort(() => Math.random() - 0.5);
};

const onDragStart = (piece) => {
  draggedPiece.value = piece;
};

const onDrop = (cellIndex) => {
  if (draggedPiece.value && !board.value[cellIndex]) {
    if (draggedPiece.value.id === cellIndex) {
      board.value[cellIndex] = draggedPiece.value;
      const pieceInPool = shuffledPieces.value.find(p => p.id === draggedPiece.value.id);
      if (pieceInPool) {
        pieceInPool.placed = true;
      }
      draggedPiece.value = null;
      checkCompletion();
    } else {
      // 放置错误，可以给个提示，但为了流畅性暂时省略
    }
  }
};

const checkCompletion = () => {
  if (board.value.every(p => p !== null)) {
    isComplete.value = true;
  }
};

const closeGame = () => {
  emit('close');
};

onMounted(initPuzzle);
</script>

<style scoped>
.puzzle-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.puzzle-container {
  width: 90%;
  /* 【关键修改】加宽容器以适应更大的拼图板和碎片池 */
  max-width: 720px; 
  background: white;
  border-radius: 8px;
}

.game-area {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  align-items: start;
}

.puzzle-board {
  display: grid;
  border: 2px solid #0d6efd;
  padding: 2px;
  background-color: #e9ecef;
}

.puzzle-cell {
  border: 1px dashed #adb5bd;
  background-color: #f8f9fa;
}

.pieces-pool {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(v-bind(pieceSize + 'px'), 1fr));
  gap: 5px;
  align-content: start;
  height: 100%;
  /* 【关键修改】确保碎片池的最大高度与拼图板一致 */
  max-height: v-bind(containerSize + 'px');
  overflow-y: auto;
  padding: 5px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.puzzle-piece-container {
  width: v-bind(pieceSize + 'px');
  height: v-bind(pieceSize + 'px');
  cursor: grab;
  transition: opacity 0.3s;
}

.puzzle-piece-container.is-placed {
  opacity: 0.3;
  cursor: default;
}

.puzzle-piece {
  border: 1px solid #999;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.completion-message {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
