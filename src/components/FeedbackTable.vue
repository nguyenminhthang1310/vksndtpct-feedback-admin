<template>
  <div>
    <table class="table table-striped align-middle">
      <thead>
        <tr>
          <th>Tên</th>
          <th>Email</th>
          <th>Nội dung</th>
          <th>Trả lời</th>
          <th>Hiển thị</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in feedbacks" :key="f._id">
          <td>{{ f.name }}</td>
          <td>{{ f.email }}</td>
          <td>{{ f.content }}</td>
          <td>
            <input v-model="f.answer" class="form-control" placeholder="Nhập trả lời..." />
          </td>
          <td>
            <input type="checkbox" v-model="f.visible" />
          </td>
          <td>
            <button class="btn btn-success btn-sm me-2" @click="saveAnswer(f)">💬 Lưu</button>
            <button class="btn btn-secondary btn-sm" @click="toggleVisible(f)">👁 Ẩn/Hiện</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import API from "../api";

const feedbacks = ref([]);

const getFeedbacks = async () => {
  const res = await API.get("/feedbacks/admin");
  feedbacks.value = res.data;
};

const saveAnswer = async (f) => {
  await API.put(`/feedbacks/${f._id}/answer`, { answer: f.answer });
  alert("✅ Đã lưu trả lời!");
};

const toggleVisible = async (f) => {
  await API.put(`/feedbacks/${f._id}/visible`, { visible: f.visible });
  alert("✅ Đã cập nhật hiển thị!");
};

onMounted(getFeedbacks);
</script>
