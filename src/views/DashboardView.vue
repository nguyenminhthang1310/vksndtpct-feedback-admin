<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="bg-primary text-white p-3 mb-4 d-flex justify-content-between align-items-center">
      <h2>🛠 Quản trị Hỏi đáp</h2>
      <button class="btn btn-outline-light" @click="logout">Đăng xuất</button>
    </header>

    <div class="container">
      <!-- Nút chuyển danh sách -->
      <div class="d-flex justify-content-center mb-3 gap-2">
        <button
          class="btn"
          :class="showFeedback ? 'btn-primary' : 'btn-outline-primary'"
          @click="toggleSection('feedback')"
        >
          💬 Hỏi đáp
        </button>
        <button
          v-if="role === 'admin'"
          class="btn"
          :class="showUsers ? 'btn-primary' : 'btn-outline-primary'"
          @click="toggleSection('users')"
        >
          👤 Người dùng
        </button>
      </div>

      <!-- Hỏi đáp Section -->
      <section v-if="showFeedback" class="mb-5 scrollable-section">
        <h4 class="mb-3">💬 Quản lý Hỏi đáp</h4>
        <table class="table table-striped table-hover align-middle">
          <thead class="table-dark">
            <tr>
              <th>Nội dung câu hỏi</th>
              <th>Người hỏi</th>
              <th>Liên hệ</th>
              <th>Ngày gửi</th>
              <th>Trả lời</th>
              <th>Hiển thị</th>
              <th v-if="role === 'admin' || role === 'user'">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fb in feedbacks" :key="fb._id">
              <td>{{ fb.message }}</td>
              <td>{{ fb.username || 'Khách' }}</td>
              <td>{{ fb.phone || '-' }}</td>
              <td>{{ new Date(fb.createdAt).toLocaleString() }}</td>
              <td>{{ fb.answer || '-' }}</td>
              <td class="text-center">
                <span 
                  class="badge" 
                  :class="fb.visible ? 'bg-success' : 'bg-secondary'" 
                  @click="toggleVisible(fb)"
                  style="cursor:pointer"
                >
                  {{ fb.visible ? 'Hiển thị' : 'Ẩn' }}
                </span>
              </td>
              <td>
                <!-- Quyền cho user: chỉ được sửa (trả lời) -->
                <button 
                  v-if="role === 'user' || role === 'admin'" 
                  class="btn btn-sm btn-warning me-1" 
                  @click="openEditFeedbackModal(fb)"
                >
                  Trả lời
                </button>

                <!-- Chỉ admin mới được xóa -->
                <button 
                  v-if="role === 'admin'" 
                  class="btn btn-sm btn-danger" 
                  @click="deleteFeedback(fb._id)"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Quản lý User (chỉ admin) -->
      <section v-if="showUsers && role === 'admin'" class="mb-5 scrollable-section">
        <h4 class="mb-3">👤 Quản lý Người dùng</h4>
        <button class="btn btn-success mb-2" @click="openAddUserModal">Thêm User</button>
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u._id">
              <td>{{ u.username }}</td>
              <td>{{ u.role }}</td>
              <td>
                <button class="btn btn-sm btn-warning me-1" @click="editUser(u)">Sửa</button>
                <button class="btn btn-sm btn-danger me-1" @click="deleteUser(u._id)">Xóa</button>
                <button class="btn btn-sm btn-info" @click="resetUserPassword(u._id)">Reset PW</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <!-- Modal Trả lời / Sửa Hỏi đáp -->
    <div v-if="showFeedbackModal">
      <div class="modal-backdrop fade show"></div>
      <div class="modal d-block">
        <div class="modal-dialog">
          <div class="modal-content p-3">
            <h5>📝 {{ role === 'user' ? 'Trả lời câu hỏi' : 'Sửa câu hỏi & trả lời' }}</h5>
            
            <!-- Admin có thể sửa cả nội dung câu hỏi -->
            <textarea 
              v-if="role === 'admin'"
              v-model="feedbackForm.message" 
              class="form-control mb-2" 
              placeholder="Nội dung câu hỏi"
            ></textarea>

            <textarea 
              v-model="feedbackForm.answer" 
              class="form-control mb-2" 
              placeholder="Nhập câu trả lời..."
            ></textarea>
            <div class="text-end">
              <button class="btn btn-primary me-2" @click="saveFeedback">Lưu</button>
              <button class="btn btn-secondary" @click="closeFeedbackModal">Hủy</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Add/Edit User -->
    <div v-if="showUserModal">
      <div class="modal-backdrop fade show"></div>
      <div class="modal d-block">
        <div class="modal-dialog">
          <div class="modal-content p-3">
            <h5>{{ editingUser ? "Sửa User" : "Thêm User" }}</h5>
            <input v-model="userForm.username" placeholder="Username" class="form-control mb-2" />
            <input v-model="userForm.password" placeholder="Password" type="password" class="form-control mb-2" />
            <select v-model="userForm.role" class="form-control mb-2">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button class="btn btn-primary me-2" @click="saveUser">Lưu</button>
            <button class="btn btn-secondary" @click="closeUserModal">Hủy</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-light text-center p-3 border-top">
      © 2025 Viện Kiểm sát - Dashboard Hỏi đáp
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../api";

const router = useRouter();
const feedbacks = ref([]);
const users = ref([]);
const role = ref(localStorage.getItem("role") || "user");

// Điều khiển hiển thị
const showFeedback = ref(true);
const showUsers = ref(false);

const toggleSection = (type) => {
  showFeedback.value = type === "feedback";
  showUsers.value = type === "users";
};

// Modal Hỏi đáp
const showFeedbackModal = ref(false);
const feedbackForm = ref({ _id: "", message: "", answer: "" });

// Modal User
const showUserModal = ref(false);
const editingUser = ref(null);
const userForm = ref({ username: "", password: "", role: "user" });

// Logout
const logout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("role");
  router.push("/");
};

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("adminToken")}` });

// Hỏi đáp
const fetchFeedback = async () => {
  try {
    const res = await api.get("/feedbacks", { headers: authHeader() });
    feedbacks.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const openEditFeedbackModal = fb => {
  feedbackForm.value = { ...fb };
  showFeedbackModal.value = true;
};
const closeFeedbackModal = () => (showFeedbackModal.value = false);

const saveFeedback = async () => {
  try {
    const payload =
      role.value === "admin"
        ? { message: feedbackForm.value.message, answer: feedbackForm.value.answer }
        : { answer: feedbackForm.value.answer }; // user chỉ được cập nhật câu trả lời

    await api.put(`/feedbacks/${feedbackForm.value._id}`, payload, { headers: authHeader() });
    fetchFeedback();
    closeFeedbackModal();
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi lưu hỏi đáp");
  }
};

const deleteFeedback = async id => {
  if (role.value !== "admin") return alert("Bạn không có quyền xóa!");
  if (!confirm("Xác nhận xóa hỏi đáp?")) return;
  try {
    await api.delete(`/feedbacks/${id}`, { headers: authHeader() });
    fetchFeedback();
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi xóa hỏi đáp");
  }
};

const toggleVisible = async fb => {
  try {
    await api.put(`/feedbacks/${fb._id}`, { visible: !fb.visible }, { headers: authHeader() });
    fetchFeedback();
  } catch (err) {
    console.error(err);
  }
};

// User quản lý (chỉ admin)
const fetchUsers = async () => {
  try {
    const res = await api.get("/users", { headers: authHeader() });
    users.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const openAddUserModal = () => {
  editingUser.value = null;
  userForm.value = { username: "", password: "", role: "user" };
  showUserModal.value = true;
};
const editUser = u => {
  editingUser.value = u;
  userForm.value = { username: u.username, password: "", role: u.role };
  showUserModal.value = true;
};
const closeUserModal = () => (showUserModal.value = false);

const saveUser = async () => {
  try {
    if (editingUser.value) {
      await api.put(`/users/admin/edit-user/${editingUser.value._id}`, userForm.value, { headers: authHeader() });
    } else {
      await api.post("/users/admin/add-user", userForm.value, { headers: authHeader() });
    }
    fetchUsers();
    closeUserModal();
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi lưu user");
  }
};

const deleteUser = async id => {
  if (!confirm("Xác nhận xóa user?")) return;
  try {
    await api.delete(`/users/admin/delete-user/${id}`, { headers: authHeader() });
    fetchUsers();
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi xóa user");
  }
};

const resetUserPassword = async id => {
  const newPassword = prompt("Nhập mật khẩu mới:");
  if (!newPassword) return;
  try {
    await api.post(`/users/admin/reset-password/${id}`, { newPassword }, { headers: authHeader() });
    alert("Reset mật khẩu thành công");
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi reset mật khẩu");
  }
};

onMounted(() => {
  fetchFeedback();
  if (role.value === "admin") fetchUsers();
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.container {
  flex: 1;
  padding-bottom: 80px;
}
.scrollable-section {
  max-height: 420px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #999 #f1f1f1;
}
.scrollable-section::-webkit-scrollbar {
  width: 8px;
}
.scrollable-section::-webkit-scrollbar-thumb {
  background-color: #aaa;
  border-radius: 4px;
}
.scrollable-section::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}
header { box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
footer { margin-top: auto; font-size: 0.9rem; color: #555; }
.modal-backdrop { position: fixed; top:0; left:0; right:0; bottom:0; background-color: rgba(0,0,0,0.5); }
.modal { position: fixed; top:20%; left:50%; transform: translateX(-50%); z-index:1050; }
</style>
