import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";

const routes = [
  { path: "/", name: "Login", component: LoginView },
  { path: "/dashboard", name: "Dashboard", component: DashboardView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Bảo vệ route Dashboard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("adminToken");
  if (to.name === "Dashboard" && !token) next({ name: "Login" });
  else next();
});

export default router;
