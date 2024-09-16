import Vue from 'vue'
import VueRouter from 'vue-router'
// import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  // {
  //   path: '/',
  //   name: 'home',
  //   component: HomeView
  // },
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
]
const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  
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
