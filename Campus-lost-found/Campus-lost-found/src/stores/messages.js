import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/axios";

export const useMessageStore = defineStore("messages", () => {
  const conversations = ref([]);
  const currentChat = ref([]); // 用于存储单个聊天窗口的消息记录
  const loading = ref(false);
  const error = ref(null);

  /**
   * 获取对话列表，用于“我的消息”页面
   */
  const getConversations = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get("/message/conversations");
      conversations.value = response.data;
    } catch (err) {
      error.value = "获取对话列表失败: " + (err.response?.data?.message || err.message);
      conversations.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取与特定用户的详细聊天记录
   * @param {number} userId - 对方用户的ID
   */
  const getChatHistory = async (userId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/message/chat/${userId}`);
      currentChat.value = response.data;
    } catch (err) {
      error.value = "获取聊天记录失败: " + (err.response?.data?.message || err.message);
      currentChat.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 统一的发送消息函数
   * @param {number} receiver_id - 接收者ID
   * @param {string} content - 消息内容
   */
  const sendMessage = async (receiver_id, content) => {
    try {
      const response = await api.post("/message/send", { receiver_id, content });
      return response.data;
    } catch (err) {
      error.value = "发送消息失败: " + (err.response?.data?.message || err.message);
      throw err; // 抛出错误，以便组件可以捕获
    }
  };

  return {
    conversations,
    currentChat,
    loading,
    error,
    getConversations,
    getChatHistory, // 清晰的函数名
    sendMessage,    // 统一的发送函数
  };
});