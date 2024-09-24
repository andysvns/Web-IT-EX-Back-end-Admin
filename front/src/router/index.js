import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'

Vue.use(VueRouter)

// Axios interceptor for adding token to requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

const routes = [
  {
    path: '/',
    name: 'AdminPage',
    component: () => import('../adminpage/Admin.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: "/adminlogin",
    name: "AdminLogin",
    component: () => import("../adminpage/AdminLogin.vue"),
  },
  {
    path: "/adminregister",
    name: "AdminRegister",
    component: () => import("../adminpage/AdminRegister.vue"),
  },
  {
    path: "/homepage",
    name: "Homepage",
    component: () => import("../components/HomePage.vue"),
    meta: { title: 'Home Page' ,requiresAuth: true }
  },
  {
    path: "/listtask",
    name: "ListTask",
    component: () => import("../components/HomeComponents/ListTaskPage/ListTask.vue"),
    meta: { title: 'List Task' ,requiresAuth: true }
  },

  {
    path: "/contact",
    name: "ContactPage",
    component: () => import("../components/ContactPage/Contact_admin.vue"),
    meta: { title: 'Contact' ,requiresAuth: true }
  },
  {
    path: '/contact/edit/:id',
    name: 'ContactEdit',
    component: () => import("../components/ContactPage/ContactEdit.vue"),
    meta: { title: 'Contact Edit' ,requiresAuth: true }
  },



]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token') || !!sessionStorage.getItem('token')
  
  if (to.name === 'AdminLogin' && isAuthenticated) {
    next({ name: 'AdminPage' })
  } else if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'AdminLogin' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router