<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="6" lg="4">
                <v-card elevation="6">
                    <v-card-title class="text-center">
                        <h2>Admin Login</h2>
                    </v-card-title>
                    <v-card-text>
                        <v-form @submit.prevent="login">
                            <v-text-field v-model="username" label="Username" prepend-icon="mdi-account" type="text"
                                required></v-text-field>
                            <v-text-field v-model="password" label="Password" prepend-icon="mdi-lock"
                                :type="showPassword ? 'text' : 'password'"
                                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append="showPassword = !showPassword" required></v-text-field>
                            <v-btn type="submit" color="primary" block class="mt-4" :loading="loading">
                                Login
                            </v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>


<script>
import axios from 'axios';

export default {
  name: 'AdminLogin',
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
      loading: false,
      errorMessage: '',
    }
  },
  methods: {
    async login() {
      this.loading = true;
      this.errorMessage = '';
      try {
        const response = await axios.post('http://localhost:3000/login', {
          username: this.username,
          password: this.password
        });
        
        if (response.data.success) {
          console.log('Login successful');
          // Store the token
          localStorage.setItem('token', response.data.token);
          // Redirect to admin page
          this.$router.push({ name: 'AdminPage' });
        } else {
          this.errorMessage = response.data.message || 'Login failed';
        }
      } catch (error) {
        console.error('Login error:', error.response || error);
        this.errorMessage = error.response?.data?.message || 'An error occurred during login';
      } finally {
        this.loading = false;
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.main-warper {
    background-color: rgb(212, 212, 212);
}
</style>