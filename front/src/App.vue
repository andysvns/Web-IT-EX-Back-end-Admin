<template>
  <div>
    <v-app>
      <v-navigation-drawer
        v-model="outerDrawer"
        app
        class="side-bar-nav"
        v-if="!isLoginPage"
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

      <div class="top-navbar" v-if="!isLoginPage">
        <v-app-bar-nav-icon
          @click="outerDrawer = !outerDrawer"
          class="drawer-icon"
        />
        <h1>{{ appTitle }}</h1>
        <div class="admin-icon">
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            :nudge-width="200"
            offset-y
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="avatar-btn admin_img" icon v-bind="attrs" v-on="on">
                <v-icon size="60">mdi-account</v-icon>
              </v-btn>
            </template>
            <v-card class="profile-menu" color="primary" dark>
              <v-card-text class="text-center">
                <v-icon size="80">mdi-account</v-icon>
                <div class="text-h6 mb-3">{{ user ? user.name : "" }}</div>
                <v-btn block outlined class="mb-2" @click="openDialog"
                  >Reset Password</v-btn
                >
                <v-btn block outlined @click="logout">Log out</v-btn>
              </v-card-text>
            </v-card>
          </v-menu>
        </div>
      </div>

      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>Reset Password</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="resetPassword">
              <v-text-field
                :value="user ? user.username : ''"
                label="Username"
                required
                outlined
                disabled
              ></v-text-field>
              <v-text-field
                v-model="oldPassword"
                label="Current Password"
                type="password"
                required
                outlined
                :error-messages="oldPasswordError"
              ></v-text-field>
              <v-text-field
                v-model="newPassword"
                label="New Password"
                type="password"
                required
                outlined
                :error-messages="newPasswordError"
              ></v-text-field>
              <v-text-field
                v-model="confirmNewPassword"
                label="Confirm New Password"
                type="password"
                required
                outlined
                :error-messages="confirmNewPasswordError"
              ></v-text-field>
              <v-card-actions>
                <v-btn text @click="closeDialog">Cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  color="secondary"
                  @click="resetPassword"
                  :loading="loading"
                  :disabled="!user"
                >
                  Reset Password
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- New success dialog -->
      <v-dialog v-model="successDialog" persistent max-width="400px">
        <v-card>
          <v-card-title class="headline"
            >Password Reset Successful</v-card-title
          >
          <v-card-text>
            Your password has been successfully changed. For security reasons,
            you will now be logged out. Please log in again with your new
            password.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="secondary" @click="forceLogout"> Log Out </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
        bottom
        right
      >
        {{ snackbar.text }}
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar.show = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>

      <v-main class="router-warper">
        <router-view></router-view>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminPage",
  data() {
    return {
      menu: false,
      user: null,
      outerDrawer: true,
      dialog: false,
      successDialog: false,
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      loading: false,
      oldPasswordError: "",
      newPasswordError: "",
      confirmNewPasswordError: "",
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => v.length >= 6 || "Password must be at least 6 characters",
      ],
      confirmPasswordRules: [
        (v) => !!v || "Confirmation is required",
        (v) => v === this.newPassword || "Passwords must match",
      ],
      menuItems: [
        {
          title: "Admin",
          icon: "mdi-account-cog-outline",
          path: "/",
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
          icon: "mdi-package-variant-closed",
          path: "/ourproduct",
        },
        {
          title: "Contact",
          icon: "mdi-phone",
          subitems: [
            { title: "Contact Information", path: "/contact" },
            { title: "Social", path: "/social" },
          ],
        },
      ],
      snackbar: {
        show: false,
        text: "",
        color: "success",
        timeout: 3000,
      },
    };
  },
  mounted() {
    this.fetchUserDetails();
  },
  methods: {
    async fetchUserDetails() {
      try {
        let userData =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        let token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (userData && token) {
          this.user = JSON.parse(userData);
        } else if (token) {
          const response = await axios.get(
            "http://localhost:3000/authen/user",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data.success) {
            this.user = response.data.user;
            (localStorage.getItem("token")
              ? localStorage
              : sessionStorage
            ).setItem("user", JSON.stringify(this.user));
          } else {
            console.error(
              "Failed to fetch user details:",
              response.data.message
            );
            this.redirectToLogin();
          }
        } else {
          this.redirectToLogin();
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        if (error.response && error.response.status === 401) {
          this.clearUserData();
          this.redirectToLogin();
        }
      }
    },
    clearUserData() {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      this.user = null;
    },
    redirectToLogin() {
      this.$router.push("/adminlogin");
    },
    logout() {
      this.clearUserData();
      this.redirectToLogin();
    },
    openDialog() {
      if (this.user) {
        this.dialog = true;
      } else {
        this.showSnackbar(
          "User data not available. Please try logging in again.",
          "error"
        );
      }
    },
    closeDialog() {
      this.dialog = false;
      this.resetForm();
    },
    resetForm() {
      this.oldPassword = "";
      this.newPassword = "";
      this.confirmNewPassword = "";
      this.resetErrors();
    },

    async resetPassword() {
      if (!this.user) {
        this.showSnackbar(
          "User data not available. Please try logging in again.",
          "error"
        );
        return;
      }

      this.resetErrors();
      if (!this.validateForm()) return;

      this.loading = true;
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:3000/api/user/reset-password",
          {
            username: this.user.username,
            oldPassword: this.oldPassword,
            newPassword: this.newPassword,
            confirmNewPassword: this.confirmNewPassword,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          this.closeDialog();
          this.successDialog = true;
        } else {
          this.showSnackbar(
            response.data.message || "Password reset failed.",
            "error"
          );
        }
      } catch (error) {
        console.error("Password reset error:", error.response || error);
        this.handleResetError(error);
      } finally {
        this.loading = false;
      }
    },
    validateForm() {
      let isValid = true;
      if (!this.oldPassword) {
        this.oldPasswordError = "Current password is required";
        isValid = false;
      }
      if (!this.newPassword) {
        this.newPasswordError = "New password is required";
        isValid = false;
      }
      if (!this.confirmNewPassword) {
        this.confirmNewPasswordError = "Please confirm your new password";
        isValid = false;
      }
      if (this.newPassword !== this.confirmNewPassword) {
        this.confirmNewPasswordError = "Passwords do not match";
        isValid = false;
      }
      return isValid;
    },

    resetErrors() {
      this.oldPasswordError = "";
      this.newPasswordError = "";
      this.confirmNewPasswordError = "";
    },

    handleResetError(error) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred during password reset";
      this.showSnackbar(errorMessage, "error");
    },
    showSnackbar(text, color = "success") {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    forceLogout() {
      this.clearUserData();
      this.successDialog = false;
      this.redirectToLogin();
    },
  },
  computed: {
    appTitle() {
      return this.$route.meta.title || "Dashboard";
    },
    isLoginPage() {
      return this.$route.name === "AdminLogin";
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
.logout-btn {
  position: absolute;
  bottom: 0;
}
::v-deep .v-list-item__icon .v-icon {
  color: #ffffff !important;
}
.top-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 90px;
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
  margin-right: 2%;
}
.profile-menu {
  width: 250px;
}
@media (max-width: 1263px) {
  .drawer-icon {
    margin-right: 0;
  }
}
</style>
