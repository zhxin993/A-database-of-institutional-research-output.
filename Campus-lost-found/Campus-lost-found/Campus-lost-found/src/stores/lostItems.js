// src/stores/lostItems.js (最终正确版)

import { defineStore } from "pinia";
import api from "@/axios";

export const useItemStore = defineStore("itemStore", {
  state: () => ({
    user: {
      username: "",
      token: localStorage.getItem("token") || null,
      id: null,
      avatar: null,
    },
    categories: ["手机", "钱包", "钥匙", "证件", "书籍", "其他"],
    items: [],
    myItems: [],
    matches: [],
    latestMatches: [], // 【新增】用于存储发布后的最新匹配结果
    conversations: [],
    currentConversation: null,
    loading: false,
    error: null,
  }),

  actions: {
    // 【新增】一个 action 用于设置和清空最新匹配结果
    setLatestMatches(matches) {
      this.latestMatches = matches;
    },
    
    async updateItemStatus(itemId, status) {
      try {
        await api.put(`/items/${itemId}`, { status: status }); // 移除了 /api
        const item = this.myItems.find(i => i.id === itemId);
        if (item) {
          item.status = status;
        }
        alert("状态更新成功！");
      } catch (err) {
        console.error(`更新物品 ${itemId} 状态失败:`, err);
        alert("更新状态失败，请稍后再试。");
      }
    },

    async deleteItem(itemId) {
      try {
        await api.delete(`/items/${itemId}`); // 移除了 /api
        this.myItems = this.myItems.filter(i => i.id !== itemId);
        alert("删除成功！");
      } catch (err) {
        console.error(`删除物品 ${itemId} 失败:`, err);
        alert("删除失败，请稍后再试。");
      }
    },

    async fetchMyItems() {
      this.loading = true;
      try {
        const token = this.getToken();
        if (!token) return;
        const res = await api.get("/my-items", { // 移除了 /api
          headers: { Authorization: `Bearer ${token}` }
        });
        this.myItems = res.data.map(item => ({ ...item, userId: item.user_id ?? item.userId }));
      } catch (err) {
        console.error("获取'我的物品'列表失败:", err);
        this.error = "获取'我的物品'列表失败";
      } finally {
        this.loading = false;
      }
    },

    login(user) {
      this.user = {
        username: user.username,
        token: user.token,
        id: user.id,
        avatar: user.avatar,
      };
      localStorage.setItem("token", user.token);
    },

    logout() {
      this.user = {
        username: "",
        token: null,
        id: null,
        avatar: null,
      };
      localStorage.removeItem("token");
    },

    register(user) {
      this.login(user);
    },

    async updateProfile(userData) {
      try {
        const res = await api.put(`/users/${this.user.id}`, userData, { // 移除了 /api
          headers: { Authorization: `Bearer ${this.user.token}` },
        });
        this.user = { ...this.user, ...res.data };
        return res.data;
      } catch (err) {
        console.error("更新用户信息失败:", err);
        throw err;
      }
    },

    addItem(item) {
      this.items.unshift(item);
    },

    getToken() {
      return this.user.token;
    },

    async fetchItems(params = {}) {
      try {
        this.loading = true;
        const query = new URLSearchParams(params).toString();
        const url = query ? `/items/search?${query}` : `/items/search`; // 移除了 /api
        const res = await api.get(url);
        this.items = res.data.map(item => ({ ...item, userId: item.user_id ?? item.userId }));
      } catch (err) {
        console.error("获取物品失败:", err);
        this.error = "获取物品列表失败";
        this.items = [];
      } finally {
        this.loading = false;
      }
    },

    async findMatches(itemId) {
      try {
        const itemRes = await api.get(`/items/${itemId}`); // 移除了 /api
        const item = { ...itemRes.data, userId: itemRes.data.user_id ?? itemRes.data.userId };
        const res = await api.post('/match_item', { // 移除了 /api
          title: item.title,
          type: item.type
        }, {
          headers: { Authorization: `Bearer ${this.user.token}` },
        });
        return res.data.map(match => ({ ...match, userId: match.user_id ?? match.userId }));
      } catch (err) {
        console.error("获取匹配项失败:", err);
        this.error = "获取匹配项失败";
        throw err;
      }
    },

    async getMatchNotifications() {
      try {
        const res = await api.get("/notifications", { // 移除了 /api
          headers: { Authorization: `Bearer ${this.user.token}` },
        });
        this.matches = res.data.map(match => ({ ...match, userId: match.user_id ?? match.userId }));
        return this.matches;
      } catch (err) {
        console.error("获取匹配通知失败:", err);
        this.error = "获取匹配通知失败";
        throw err;
      }
    },

    async getConversations() {
      try {
        this.loading = true;
        const res = await api.get("/message/conversations", { // 移除了 /api (虽然之前是对的，但为了统一，改为不带 /api)
          headers: { Authorization: `Bearer ${this.user.token}` },
        });
        this.conversations = res.data;
        return res.data;
      } catch (err) {
        console.error("获取对话列表失败:", err);
        this.error = "获取对话列表失败";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getMessages(itemId, recipientId) {
      try {
        this.loading = true;
        const res = await api.get(`/messages?itemId=${itemId}&recipientId=${recipientId}`, { // 移除了 /api
          headers: { Authorization: `Bearer ${this.user.token}` },
        });
        this.currentConversation = res.data;
        return res.data;
      } catch (err) {
        console.error("获取消息失败:", err);
        this.error = "获取消息失败";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async sendMessage({ itemId, recipientId, content }) {
      try {
        const res = await api.post(
          "/messages", // 移除了 /api
          { itemId, recipientId, content },
          { headers: { Authorization: `Bearer ${this.user.token}` } }
        );

        if (this.currentConversation) {
          this.currentConversation.messages.push(res.data);
        }

        return res.data;
      } catch (err) {
        console.error("发送消息失败:", err);
        this.error = "发送消息失败";
        throw err;
      }
    },

    getMyItems() {
      if (!this.user.id) return [];
      return this.items.filter(item => item.userId === this.user.id);
    },
  },

  getters: {
    userItems: (state) => {
      if (!state.user.id) return [];
      return state.items.filter((item) => item.user_id === state.user.id);
    },
    isAuthenticated: (state) => !!state.user.token,
  },
});