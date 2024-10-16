<template>
  <div class="main-warper">
    <v-container fluid class="fill-height bg-deep-blue">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <div class="card-warper">
            <v-card-title
              class="text-h1 white--text text-center justify-center mb-4 font-weight-regular"
              >Log in</v-card-title
            >
            <v-card-subtitle
              class="text-subtitle-1 white--text text-center mb-6 font-weight-regular"
              >Welcome to IT Excellence</v-card-subtitle
            >
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="username"
                label="Username"
                name="User"
                prepend-inner-icon="mdi-account"
                type="text"
                color="white"
                dark
                outlined
                class="mb-4 custom-text-field"
                :error-messages="usernameError"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                name="password"
                prepend-inner-icon="mdi-lock"
                color="white"
                dark
                outlined
                class="mb-4 custom-text-field"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                :error-messages="passwordError"
              ></v-text-field>

              <v-row no-gutters class="align-center">
                <v-col cols="6">
                  <v-checkbox
                    v-model="rememberMe"
                    label="Remember me"
                    color="white"
                    dark
                  ></v-checkbox>
                </v-col>
                <v-col cols="6" class="text-right">
                  <a href="/adminregister" class="white--text custom-register"
                    >Register</a
                  >
                </v-col>
              </v-row>

              <v-alert v-if="errorMessage" type="error" dense outlined>
                {{ errorMessage }}
              </v-alert>

              <v-btn
                color="red"
                dark
                large
                block
                @click="login"
                :loading="loading"
              >
                Login
              </v-btn>
            </v-form>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <img class="footer_login" src="../assets/admin_l.png" alt="" />
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminLogin",
  data: () => ({
    username: "",
    password: "",
    showPassword: false,
    rememberMe: false,
    loading: false,
    errorMessage: "",
    usernameError: "",
    passwordError: "",
  }),
  mounted() {
    const storedUsername = localStorage.getItem("rememberedUsername");
    const storedPassword = localStorage.getItem("rememberedPassword");
    if (storedUsername && storedPassword) {
      this.username = storedUsername;
      this.password = atob(storedPassword);
      this.rememberMe = true;
    }
  },
  methods: {
    async login() {
      this.resetErrors();
      if (!this.validateForm()) return;

      this.loading = true;
      try {
        const response = await axios.post(
          "http://localhost:3000/authen/login",
          {
            username: this.username,
            password: this.password,
          }
        );

        if (response.data.success) {
          console.log("Login successful");
          this.storeUserData(response.data);
          this.handleRememberMe();
          location.reload();
          this.$router.push({ name: "AdminPage" });
        }
      } catch (error) {
        console.error("Login error:", error.response || error);
        this.handleLoginError(error);
      } finally {
        this.loading = false;
      }
    },

    storeUserData(data) {
      const { token, user } = data;
      const storage = this.rememberMe ? localStorage : sessionStorage;

      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));
    },

    validateForm() {
      let isValid = true;
      if (!this.username) {
        this.usernameError = "Username is required";
        isValid = false;
      }
      if (!this.password) {
        this.passwordError = "Password is required";
        isValid = false;
      }
      return isValid;
    },
    resetErrors() {
      this.errorMessage = "";
      this.usernameError = "";
      this.passwordError = "";
    },
    handleLoginError(error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during login";
      if (errorMessage.includes("User not found")) {
        this.usernameError = "User not found";
      } else if (errorMessage.includes("Incorrect password")) {
        this.passwordError = "Incorrect password";
      } else {
        this.errorMessage = errorMessage;
      }
    },
    storeToken(token) {
      if (this.rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }
    },
    handleRememberMe() {
      if (this.rememberMe) {
        localStorage.setItem("rememberedUsername", this.username);
        localStorage.setItem("rememberedPassword", btoa(this.password));
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberedPassword");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.main-warper {
  background-color: #002140;
  height: 100vh;
}
.bg-deep-blue {
  background-color: #001f3f !important;
  // margin-top: -50px;
}
.bg-input {
  background-color: #224957;
}

.card-warper {
  // width: 25vw;
  padding-left: 10%;
  padding-right: 10%;
  margin-top: -100px;
}
.v-input__control {
  border-radius: 50px; /* This adds the border radius */
  background-color: #224957;
}
.footer_login {
  position: absolute;
  bottom: 0;
  width: 100vw;
  z-index: 1;
  // opacity: 0.5;
}
.custom-text-field ::v-deep .v-input__slot {
  background-color: #224957; /* light blue background color */
}
.custom-register {
  text-decoration: none;
}
@media only screen and (max-width: 1200px) {
  .card-warper {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
