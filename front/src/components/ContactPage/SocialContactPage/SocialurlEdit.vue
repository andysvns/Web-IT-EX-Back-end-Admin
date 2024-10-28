<template>
  <!-- Template remains the same -->
  <v-container>
    <v-row class="ml-5 mr-5">
      <v-col cols="12">
        <v-toolbar flat color="transparent">
          <v-btn icon @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>Back</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            @click="validateAndUpdate"
            :disabled="!valid || loading"
            >Update</v-btn
          >
        </v-toolbar>
      </v-col>
    </v-row>
    <v-form ref="form" v-model="valid" @submit.prevent="validateAndUpdate">
      <v-row class="ml-5 mr-5">
        <v-col cols="12">
          <v-card>
            <v-card-title>Update Tool Detail</v-card-title>
            <v-card-text>
              <v-select
                v-model="item.social_type_id"
                :items="socialOptions"
                item-text="s_type_name"
                item-value="social_type_id"
                label="Social Type"
                outlined
                dense
                :rules="[(v) => !!v || 'Social type is required']"
                :loading="loading"
              ></v-select>
              <v-text-field
                label="Name"
                v-model="item.title"
                outlined
                :rules="toolNameRules"
                :loading="loading"
              ></v-text-field>
              <v-textarea
                v-model="item.social_url"
                :rules="urlRules"
                label="URL"
                outlined
                placeholder="Please Enter"
                required
                rows="5"
                auto-grow
                :loading="loading"
              ></v-textarea>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" bottom right>
      <v-icon :color="snackbar.color" left>{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
      <v-btn color="white" text @click="snackbar.show = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "StackToolForm",
  data() {
    return {
      valid: false,
      loading: false,
      socialOptions: [],
      snackbar: {
        show: false,
        color: "",
        icon: "",
        message: "",
      },
      item: {
        social_url_id: null, // Changed from id to social_url_id
        social_type_id: "",
        title: "",
        social_url: "",
      },
      toolNameRules: [
        (v) => !!v || "Name is required",
        (v) => (v && v.length <= 50) || "Name must be less than 50 characters",
      ],
      urlRules: [(v) => !!v || "URL is required"],
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    validateAndUpdate() {
      if (this.$refs.form.validate()) {
        this.updateItem();
      }
    },
    async fetchStackTypes() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/socialtype/getall/"
        );
        this.socialOptions = response.data;
      } catch (error) {
        console.error("Error fetching stack types:", error);
        this.showSnackbar("error", "Failed to fetch social types");
      }
    },
    async fetchItemData() {
      this.loading = true;
      try {
        const id = this.$route.params.id;
        const response = await axios.get(
          `http://localhost:3000/api/socialurl/view/${id}`
        );
        if (response.data) {
          // Store the social_url_id in the item object
          this.item = {
            ...response.data,
            social_url_id: id, // Ensure ID is included with correct field name
          };
        } else {
          this.showSnackbar("error", "Failed to fetch item data");
          this.$router.go(-1);
        }
      } catch (error) {
        console.error("Error fetching item data:", error);
        this.showSnackbar("error", "Failed to fetch item data");
        this.$router.go(-1);
      } finally {
        this.loading = false;
      }
    },
    async updateItem() {
      this.loading = true;
      try {
        // Update the API endpoint and request structure
        const updateData = {
          id: this.item.social_url_id, // Match the backend expectation
          title: this.item.title,
          social_type_id: this.item.social_type_id,
          social_url: this.item.social_url,
        };

        // Log the request data for debugging
        console.log("Updating with data:", updateData);

        const response = await axios.put(
          // Changed to PUT method
          `http://localhost:3000/api/socialurl/update/${this.item.social_url_id}`, // Added ID to URL
          updateData
        );

        if (response.data.success) {
          this.showSnackbar("success", "Social updated successfully");
          setTimeout(() => {
            this.$router.go(-1);
          }, 1500);
        } else {
          this.showSnackbar(
            "error",
            response.data.message || "Failed to update Social"
          );
        }
      } catch (err) {
        console.error("Failed to update social:", err);
        this.showSnackbar(
          "error",
          err.response?.data?.message ||
            "Failed to update social. Please try again."
        );
      } finally {
        this.loading = false;
      }
    },
    showSnackbar(type, message) {
      this.snackbar.show = true;
      this.snackbar.color = type === "success" ? "success" : "error";
      this.snackbar.icon =
        type === "success" ? "mdi-check-circle" : "mdi-alert-circle";
      this.snackbar.message = message;
    },
  },
  created() {
    this.fetchStackTypes();
    this.fetchItemData();
  },
};
</script>
