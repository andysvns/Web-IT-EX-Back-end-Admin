import Vue from "vue";
import VueRouter from "vue-router";
import axios from "axios";

Vue.use(VueRouter);

// Axios interceptor for adding token to requests
axios.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

const routes = [
  {
    path: "/",
    name: "AdminPage",
    component: () => import("../adminpage/UserPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/usercreate",
    name: "userCreate",
    component: () => import("../adminpage/UserCreate.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/adminlogin",
    name: "AdminLogin",
    component: () => import("../adminpage/AdminLogin.vue"),
  },
  {
    path: "/adminregister",
    name: "AdminRegister",
    component: () => import("../adminpage/UserCreate.vue"),
  },
  {
    path: "/homepage",
    name: "Homepage",
    component: () => import("../components/HomePage.vue"),
    meta: { title: "Home Page", requiresAuth: true },
  },
  {
    path: "/background",
    name: "Background",
    component: () =>
      import("../components/HomeComponents/BackgroundPage/Background.vue"),
    meta: { title: "Background", requiresAuth: true },
  },

  {
    path: "/homeaboutus",
    name: "HomeAboutUs",
    component: () =>
      import("../components/HomeComponents/HomeAboutUsPage/HomeAboutUs.vue"),
    meta: { title: "Home About Us", requiresAuth: true },
  },
  {
    path: "/homeaboutus/edit/:id",
    name: "HomeAboutUsEdit",
    component: () =>
      import(
        "../components/HomeComponents/HomeAboutUsPage/HomeAboutUsEdit.vue"
      ),
    meta: { title: "Home About Us Edit", requiresAuth: true },
  },
  {
    path: "/listtask",
    name: "ListTask",
    component: () =>
      import("../components/HomeComponents/ListTaskPage/ListTask.vue"),
    meta: { title: "List Task", requiresAuth: true },
  },
  {
    path: "/listtask/create",
    name: "ListTaskCreate",
    component: () =>
      import("../components/HomeComponents/ListTaskPage/ListTaskCreate.vue"),
    meta: { title: "List Task Create", requiresAuth: true },
  },
  {
    path: "/listtask/edit/:id",
    name: "ListTaskEdit",
    component: () =>
      import("../components/HomeComponents/ListTaskPage/ListTaskEdit.vue"),
    meta: { title: "List Task Edit", requiresAuth: true },
  },
  {
    path: "/impact",
    name: "ImpactPage",
    component: () =>
      import("../components/HomeComponents/impactPage/impactPage.vue"),
    meta: { title: "Impact in number", requiresAuth: true },
  },
  {
    path: "/impact/create",
    name: "ImpactCreate",
    component: () =>
      import("../components/HomeComponents/impactPage/impactCreate.vue"),
    meta: { title: "Impact Create", requiresAuth: true },
  },
  {
    path: "/impact/edit/:id",
    name: "ImpactEdit",
    component: () =>
      import("../components/HomeComponents/impactPage/impactEdit.vue"),
    meta: { title: "impact Edit", requiresAuth: true },
  },

  {
    path: "/ourpartner",
    name: "OurPartner",
    component: () =>
      import("../components/HomeComponents/OurPartnerPage/OurPartner.vue"),
    meta: { title: "Our Partner", requiresAuth: true },
  },
  {
    path: "/ourpartner/create",
    name: "OurPartnerCreate",
    component: () =>
      import(
        "../components/HomeComponents/OurPartnerPage/OurPartnerCreate.vue"
      ),
    meta: { title: "Our Partner Create", requiresAuth: true },
  },
  {
    path: "/ourpartner/edit/:id",
    name: "OurPartnerEdit",
    component: () =>
      import("../components/HomeComponents/OurPartnerPage/OurPartnerEdit.vue"),
    meta: { title: "Our Partner Edit", requiresAuth: true },
  },
  {
    path: "/stacktools",
    name: "StackTools",
    component: () =>
      import("../components/HomeComponents/StackToolsPage/StackTools.vue"),
    meta: { title: "Stack & Tools", requiresAuth: true },
  },
  {
    path: "/stacktools/create",
    name: "StackToolsCreate",
    component: () =>
      import(
        "../components/HomeComponents/StackToolsPage/StackToolsCreate.vue"
      ),
    meta: { title: "Tools Create", requiresAuth: true },
  },
  {
    path: "/stacktools/edit/:id",
    name: "StackToolsEdit",
    component: () =>
      import("../components/HomeComponents/StackToolsPage/StackToolsEdit.vue"),
    meta: { title: "Tool Edit", requiresAuth: true },
  },
  {
    path: "/stacktype",
    name: "StackType",
    component: () =>
      import("../components/HomeComponents/StackToolsPage/StackToolType.vue"),
    meta: { title: "Stack Type", requiresAuth: true },
  },

  {
    path: "/ourproduct",
    name: "OurProduct",
    component: () => import("../components/OurProductPage/OurProduct.vue"),
    meta: { title: "Our Product", requiresAuth: true },
  },
  {
    path: "/ourproduct/create",
    name: "OurProductCreate",
    component: () =>
      import("../components/OurProductPage/OurProductCreate.vue"),
    meta: { title: "Our Product Create", requiresAuth: true },
  },
  {
    path: "/ourproduct/edit/:id",
    name: "OurProductEdit",
    component: () => import("../components/OurProductPage/OurProductEdit.vue"),
    meta: { title: "Our Product Edit", requiresAuth: true },
  },
  {
    path: "/intro",
    name: "Intro",
    component: () => import("../components/AboutusPage/introPage/intro.vue"),
    meta: { title: "Intro", requiresAuth: true },
  },
  {
    path: "/intro/edit/:id",
    name: "IntroEdit",
    component: () =>
      import("../components/AboutusPage/introPage/introEdit.vue"),
    meta: { title: "Intro Edit", requiresAuth: true },
  },

  {
    path: "/member",
    name: "MemberPage",
    component: () =>
      import("../components/AboutusPage/memberPage/memberPage.vue"),
    meta: { title: "Member", requiresAuth: true },
  },
  {
    path: "/member/create",
    name: "MemberCreate",
    component: () =>
      import("../components/AboutusPage/memberPage/memberCreate.vue"),
    meta: { title: "Member Create", requiresAuth: true },
  },
  {
    path: "/member/edit/:id",
    name: "MemberEdit",
    component: () =>
      import("../components/AboutusPage/memberPage/memberEdit.vue"),
    meta: { title: "Member Edit", requiresAuth: true },
  },

  {
    path: "/contact",
    name: "ContactPage",
    component: () =>
      import("../components/ContactPage/ContactUs/Contact_admin.vue"),
    meta: { title: "Contact", requiresAuth: true },
  },
  {
    path: "/contact/edit/:id",
    name: "ContactEdit",
    component: () =>
      import("../components/ContactPage/ContactUs/ContactEdit.vue"),
    meta: { title: "Contact Edit", requiresAuth: true },
  },

  {
    path: "/social",
    name: "Social",
    component: () =>
      import("../components/ContactPage/SocialContactPage/SocialUrl.vue"),
    meta: { title: "Social", requiresAuth: true },
  },
  {
    path: "/social/create",
    name: "SocialCreate",
    component: () =>
      import("../components/ContactPage/SocialContactPage/SocialUrlCreate.vue"),
    meta: { title: "Social Create", requiresAuth: true },
  },
  {
    path: "/social/edit/:id",
    name: "SocialEdit",
    component: () =>
      import("../components/ContactPage/SocialContactPage/SocialurlEdit.vue"),
    meta: { title: "Social Edit", requiresAuth: true },
  },
  {
    path: "/socialtype",
    name: "SocialType",
    component: () =>
      import("../components/ContactPage/SocialContactPage/SocialType.vue"),
    meta: { title: "Social Type", requiresAuth: true },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated =
    !!localStorage.getItem("token") || !!sessionStorage.getItem("token");

  if (to.name === "AdminLogin" && isAuthenticated) {
    next({ name: "AdminPage" });
  } else if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: "AdminLogin" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
