<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-4">
        <div class="card shadow">
          <div class="card-body">
            <h4 class="text-center mb-4">🔒 Đăng nhập Quản trị</h4>
            <form @submit.prevent="login">
              <div class="mb-3">
                <label class="form-label">Tài khoản</label>
                <input v-model="username" type="text" class="form-control" placeholder="Nhập username" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Mật khẩu</label>
                <input v-model="password" type="password" class="form-control" placeholder="Nhập mật khẩu" required />
              </div>
              <button type="submit" class="btn btn-primary w-100">Đăng nhập</button>
            </form>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../config/api"; // import axios instance

const router = useRouter();
const username = ref("");
const password = ref("");
const error = ref("");

const login = async () => {
  error.value = "";
  try {
    const res = await api.post("/users/login", {
      username: username.value,
      password: password.value
    });

    // Lưu token và role
    localStorage.setItem("adminToken", res.data.token);
    localStorage.setItem("role", res.data.role); // <--- lưu role

    router.push("/dashboard");
  } catch (err) {
    error.value = err.response?.data?.message || "Đăng nhập thất bại";
  }
};
</script>
