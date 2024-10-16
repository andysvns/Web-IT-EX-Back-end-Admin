<template>
  <v-container>
    <v-row class="ml-5 mr-5">
      <v-col cols="12">
        <v-toolbar flat color="transparent">
          <v-btn icon @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>Back</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="validateAndCreate" :disabled="!valid"
            >Create user</v-btn
          >
        </v-toolbar>
      </v-col>
    </v-row>
    <v-form ref="form" v-model="valid" @submit.prevent="validateAndCreate">
      <v-row class="ml-5 mr-5">
        <v-col cols="12">
          <v-card>
            <v-card-title>User Registration</v-card-title>
            <v-card-text>
              <v-text-field
                label="Username"
                :rules="usernameRules"
                v-model="user.username"
                outlined
              ></v-text-field>
              <v-text-field
                label="Password"
                :rules="passwordRules"
                v-model="user.password"
                type="password"
                outlined
              ></v-text-field>
              <v-text-field
                label="Confirm Password"
                :rules="confirmPasswordRules"
                v-model="user.confirmpassword"
                type="password"
                outlined
              ></v-text-field>
              <v-text-field
                label="Full Name"
                :rules="nameRules"
                v-model="user.name"
                outlined
              ></v-text-field>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
    <!-- Success snackbar -->
    <v-snackbar v-model="snackbarSuccess" bottom right color="success">
      <v-icon color="white" left>mdi-check-circle</v-icon>
      Registration successful!
      <v-btn color="white" text @click="snackbarSuccess = false">Close</v-btn>
    </v-snackbar>

    <!-- Error snackbar -->
    <v-snackbar v-model="snackbarError" bottom right color="error">
      <v-icon color="white" left>mdi-alert-circle</v-icon>
      {{ errorMessage }}
      <v-btn color="white" text @click="snackbarError = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "UserRegistrationForm",
  data() {
    return {
      valid: false,
      snackbarSuccess: false,
      snackbarError: false,
      errorMessage: "",
      user: {
        username: "",
        password: "",
        confirmpassword: "",
        name: "",
      },
      usernameRules: [(v) => !!v || "Username is required"],
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => v.length >= 6 || "Password must be at least 6 characters",
      ],
      confirmPasswordRules: [
        (v) => !!v || "Confirm password is required",
        (v) => v === this.user.password || "Passwords do not match",
      ],
      nameRules: [(v) => !!v || "Name is required"],
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    validateAndCreate() {
      if (this.$refs.form.validate()) {
        this.registerUser();
      }
    },
    async registerUser() {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/user/create",
          this.user
        );
        if (response.data.success) {
          this.snackbarSuccess = true;
          // Store the token in localStorage or Vuex store
          localStorage.setItem("token", response.data.token);
          setTimeout(() => {
            this.$router.push("/"); // Redirect to dashboard or home page
          }, 1500);
        }
      } catch (err) {
        console.error("Failed to register user:", err);
        this.errorMessage =
          err.response?.data?.message ||
          "Failed to register. Please try again.";
        this.snackbarError = true;
      }
    },
  },
};
</script>
