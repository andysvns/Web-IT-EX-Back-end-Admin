<template>
  <v-container>
    <v-row class="ml-5 mr-5">
      <v-col cols="12">
        <v-toolbar flat color="transparent">
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="editItem">Edit</v-btn>
        </v-toolbar>
      </v-col>
    </v-row>
    <v-row class="ml-5 mr-5">
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title>Image</v-card-title>
          <v-card-text>
            <v-img
              :src="item.img || require('@/assets/default.png')"
              :lazy-src="require('@/assets/default.png')"
              max-height="250"
              contain
              class="mt-6"
              @error="handleImageError"
            ></v-img>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="7">
        <v-card class="custom-card">
          <v-card-title class="custom-card-title">Detail</v-card-title>
          <v-card-text>
            <div class="custom-section">
              <h2 class="section-label">Title:</h2>
              <div class="section-content">{{ item.title }}</div>
            </div>
            <div class="custom-section">
              <h2 class="section-label">Description:</h2>
              <div class="section-content" v-html="formattedDesc"></div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "IntroDisplay",
  data() {
    return {
      item: {
        about_us_id: null,
        img: "",
        title: "",
        desc: "",
        updated_at: "",
      },
      loading: false,
      error: null,
    };
  },
  computed: {
    formattedDesc() {
      return this.item.desc.replace(/\n/g, '<br>');
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    handleImageError() {
      this.item.img = require("@/assets/default.png");
    },
    async fetchData() {
      this.loading = true;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/intro/getfirst",
          {
            timeout: 10000,
          }
        );
        this.item = response.data;
      } catch (err) {
        console.error("Error fetching data:", err);
        this.error =
          "Failed to fetch intro information: " +
          (err.response?.data?.message || err.message);
      } finally {
        this.loading = false;
      }
    },
    editItem() {
      if (this.item.about_us_id) {
        this.$router.push({
          name: "IntroEdit",
          params: { id: this.item.about_us_id },
        });
      } else {
        console.error("No about_us_id available for editing");
        // You might want to show an error message to the user here
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.custom-card {
  // padding: 16px;
  font-family: Arial, sans-serif;
}

.custom-card-title {
  font-weight: bold;
  font-size: 24px;
  // color: #3f51b5
}

.custom-section {
  margin-top: 16px;
}

.section-label {
  font-size: 24px;
  font-weight: 600;
  color: #333; /* Darker color for label */
  margin-bottom: 4px;
}

.section-content {
  margin-top: 12px;
  font-size: 1.25rem;
  color: #666; /* Lighter color for content */
  line-height: 1.6;
}
</style>
