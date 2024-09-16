<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card>
            <v-card-title class="headline">
              Welcome to the Admin Dashboard
            </v-card-title>
            <v-card-text>
              <p>You have successfully logged in as an administrator.</p>
              <!-- Add more admin functionality here -->
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="logout">
                Logout
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    name: 'AdminPage',
    methods: {
      logout() {
        // Clear the token
        localStorage.removeItem('token');
        // Redirect to login page
        this.$router.push({ name: 'AdminLogin' });
      }
    }
  }
  </script>