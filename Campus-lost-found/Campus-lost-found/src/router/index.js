import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import PublishView from "@/views/PublishView.vue";
import ProfileView from "@/views/ProfileView.vue";
import ItemDetailView from "@/views/ItemDetailView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/publish",
    name: "publish",
    component: PublishView,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: "/item/:id",
    name: "item-detail",
    component: ItemDetailView,
    props: true,
  },
  {
    path: "/messages",
    name: "messages",
    component: () => import("@/views/MessagesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/message/:userId", // 【修复】这是新的、正确的方式，只依赖用户ID
    name: "message-detail",
    component: () => import("@/views/MessageDetailView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("token") !== null;
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;
