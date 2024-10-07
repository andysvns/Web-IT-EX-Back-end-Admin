<template>
  <div>
    <v-app>
      <v-navigation-drawer
        v-model="outerDrawer"
        app
        class="side-bar-nav"
        v-if="!isLoginPage && !isRegisterPage"
      >
        <img class="logo" src="./assets/logo1.png" alt="" />
        <v-list nav>
          <template v-for="item in menuItems">
            <v-list-group
              :key="item.title"
              v-if="item.subitems"
              :prepend-icon="item.icon"
              no-action
            >
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title class="title-text">{{
                    item.title
                  }}</v-list-item-title>
                </v-list-item-content>
              </template>

              <v-list-item
                v-for="subitem in item.subitems"
                :key="subitem.title"
                :to="subitem.path"
              >
                <v-list-item-content>
                  <v-list-item-title class="title-text">{{
                    subitem.title
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>

            <v-list-item v-else :key="item.title" :to="item.path">
              <v-list-item-icon>
                <v-icon class="custom-icon">{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="title-text">{{
                  item.title
                }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>
      </v-navigation-drawer>

      <div class="top-navbar" v-if="!isLoginPage && !isRegisterPage">
        <v-app-bar-nav-icon
          @click="outerDrawer = !outerDrawer"
          class="drawer-icon"
          style="color: #000000; display: show"
        />
        <h1>
          {{ appTitle }}
        </h1>

        <div class="admin-icon">
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            :nudge-width="200"
            offset-y
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="avatar-btn admin_img" icon v-bind="attrs" v-on="on">
                <v-avatar size="60">
                  <img
                    src="https://xsgames.co/randomusers/avatar.php?g=male"
                    alt="User Avatar"
                  />
                </v-avatar>
              </v-btn>
            </template>

            <v-card class="profile-menu" color="primary" dark>
              <v-card-text class="text-center">
                <v-avatar size="80" class="mb-3">
                  <img
                    src="https://xsgames.co/randomusers/avatar.php?g=male"
                    alt="User Image"
                  />
                </v-avatar>
                <div class="text-h6 mb-3">User Name</div>
                <v-btn block outlined class="mb-2" @click="RePassword">
                  Reset Password
                </v-btn>
                <v-btn block outlined @click="logout"> Log out </v-btn>
                <!-- <v-btn class="Logout-btn" color="#154391" @click="logout">
            Logout
          </v-btn> -->
              </v-card-text>
            </v-card>
          </v-menu>
          <!-- <v-btn @click="openProfile" class="avatar-btn admin_img" icon>
            <v-avatar size="40">
              <img src="https://xsgames.co/randomusers/avatar.php?g=male" alt="User Avatar">
            </v-avatar>
          </v-btn>
          <v-btn class="Logout-btn" color="#154391" @click="logout">
            Logout
          </v-btn> -->
        </div>
      </div>
      <!-- <v-toolbar-title class="toolbar-title" v-if="!isLoginPage">
        
        <router-link to="/" tag="span" style="cursor: pointer">
          {{ appTitle }}
        </router-link>
      </v-toolbar-title> -->

      <v-main class="router-warper">
        <router-view></router-view>
      </v-main>
    </v-app>
  </div>
</template>

<script>
export default {
  name: "AdminPage",
  data() {
    return {
      menu: false,
      outerDrawer: true,

      // sidebar: false,
      menuItems: [
        {
          title: "Admin",
          icon: "mdi-account-cog-outline",
          path: "/admin",
        },
        {
          title: "Home",
          icon: "mdi-home",
          subitems: [
            { title: "Background", path: "/background" },
            { title: "About Us", path: "/homeaboutus" },
            { title: "List Task", path: "/listtask" },
            { title: "Impact Number", path: "/impact" },
            { title: "Our Partner", path: "/ourpartner" },
            { title: "Our Stack & tools", path: "/stacktools" },
          ],
        },
        {
          title: "About Us",
          icon: "mdi-account-group-outline",
          subitems: [
            { title: "Intro", path: "/intro" },
            { title: "Member", path: "/member" },
          ],
        },
        {
          title: "Our Product",
          icon: "mdi-cog-outline",
          path: "/ourproduct",
        },
        {
          title: "Contact",
          icon: "mdi-contacts",
          subitems: [
            { title: "Contact Information", path: "/contact" },
            { title: "Social", path: "/social" },
          ],
        },
      ],
    };
  },
  methods: {
    logout() {
      // Clear the token
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("rememberedUsername");
      localStorage.removeItem("rememberedPassword");
      // Redirect to login page
      this.$router.push({ name: "AdminLogin" });
    },
  },
  computed: {
    appTitle() {
      // Check if a meta title exists and use it; otherwise fallback to default
      return this.$route.meta.title || "Dashboard"; // Fallback to default title
    },
    isLoginPage() {
      // Check if the current route is the login page
      return this.$route.name === "AdminLogin"; // Assuming your login route is named 'login'
    },
    isRegisterPage() {
      return this.$route.name === "AdminRegister";
    },
  },
};
</script>

<style lang="scss" scoped>
.side-bar-nav {
  background-color: #002140;
}
.logo {
  width: 150px;
  margin: 5%;
}
.router-warper {
  background-color: #e0e5f2;
}
.title-text {
  color: #ffffff;
}
// .toolbar-title{
//   text-align: center;
//   height: 80px;
//   border-bottom: black 1px solid;
//   box-shadow: 0 8px 10px rgba(0, 0, 0, 0.1);
// }
.logout-btn {
  position: absolute;
  bottom: 0;
}
::v-deep .v-list-item__icon .v-icon {
  color: rgb(255, 255, 255) !important;
}
.top-navbar {
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: space-between;
  height: 90px;
  // border-bottom: black 1px solid;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
}
.top-navbar h1 {
  font-weight: 500;
}
.drawer-icon {
  margin-left: 1%;
  margin-right: 10%;
}
.admin-icon {
  // display: flex;
  // width: 200px;
  margin-right: 2%;
  // justify-content: space-evenly;
}
.profile-menu {
  width: 250px;
}
.admin_img {
}
.Logout-btn {
  color: #ffffff;
}
@media (max-width: 1263px) {
  .drawer-icon {
    margin-right: 0;
  }
}
</style>
