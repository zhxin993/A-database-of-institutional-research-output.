<template>
  <div class="login-background" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="login-text-overlay">
      <h2 class="main-text">请您进行登录</h2>
      <p class="sub-text">我们会尽力帮助您找回您的物品</p>
    </div>
    <div class="container login-container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h3 class="text-center">登录</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="login">
                <div class="mb-3">
                  <label for="username" class="form-label">用户名</label>
                  <input
                    type="text"
                    class="form-control"
                    id="username"
                    v-model="form.username"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">密码</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    v-model="form.password"
                    required
                  />
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    {{ loading ? "登录中..." : "登录" }}
                  </button>
                </div>
                <div class="mt-3 text-center">
                  <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useItemStore } from "@/stores/lostItems";
import api from "@/axios";
import backgroundImage from '../assets/background_image_1.jpg';


const itemStore = useItemStore();
const router = useRouter();

const form = ref({
  username: "",
  password: ""
});
const loading = ref(false);

const login = async () => {
  if (!form.value.username || !form.value.password) {
    alert("请输入用户名和密码");
    return;
  }

  loading.value = true;
  try {
    const res = await api.post("/login", {
      username: form.value.username,
      password: form.value.password
    });

    const { token, user } = res.data;

    localStorage.setItem("token", token);
    

    itemStore.login({
      id: user.id,
      username: user.username,
      token: token
    });

    alert("登录成功！");
    router.push("/");
  } catch (err) {
    console.error("登录请求错误:", err);
    if (err.response) {
      alert("登录失败：" + (err.response.data.message || "服务器错误"));
    } else if (err.request) {
      alert("登录失败：无法连接服务器");
    } else {
      alert("登录失败：" + err.message);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-background {
  min-height: calc(100vh - 50px); /* Adjust based on your header/footer height */
  background-size: cover; /* Ensures the background image covers the entire element */
  background-position: center center; /* Centers the background image */
  background-repeat: no-repeat; /* Prevents the background image from repeating */
  position: relative; /* Prepares for content positioning */
  display: flex;
  flex-direction: column; /* Arranges child elements vertically */
  justify-content: flex-start; /* Aligns content to the top */
  align-items: center; /* Horizontally centers content */
  padding: 40px 20px; /* Adds top and bottom padding */
  box-sizing: border-box;
  overflow: hidden; /* Prevents content overflow from affecting layout */
}

.login-container {
  z-index: 10; /* Ensures the login box is above the text */
  /* #background-color: #ffffff; /* Optional: semi-transparent white background for the container to enhance readability */
  padding: 30px;
  border-radius: 8px;
  margin-right: 30px;
  margin-top: 30px; /* Increases spacing between the login box and the top text */
  width: 100%; /* Ensures proper width on small screens */
  max-width: 800px; /* Limits maximum width */
}

.login-text-overlay {
  color: #000; /* White text */
  text-align: center;
  z-index: 1; /* Ensures text is above the background */
  margin-bottom: 20px; /* Increases spacing between text and login box */
  width: 90%;
  max-width: 600px;

  padding: 10px 20px;
  border-radius: 5px;
}

.main-text {
  font-size: 2.2em; /* Slightly smaller font size */
  font-weight: bold;
  margin-bottom: 5px; /* Reduces spacing between main and sub-text */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Adds text shadow for better contrast */
  color: white; /* 【新增】将文字颜色设置为白色 */
}

.sub-text {
  font-size: 1.1em; /* Slightly smaller font size */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Adds text shadow for better contrast */
  color: white; /* 【新增】将文字颜色设置为白色 */
}

/* Media queries for responsive adjustments */
@media (max-width: 768px) {
  .main-text {
    font-size: 1.8em;
  }
  .sub-text {
    font-size: 1em;
  }
  .login-container {
    padding: 20px;
  }
  .login-text-overlay {
    padding: 8px 15px;
  }
}
</style>
