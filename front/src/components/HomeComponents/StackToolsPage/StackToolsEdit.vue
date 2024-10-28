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
            <v-btn color="secondary" @click="validateAndUpdate" :disabled="!valid"
              >Update</v-btn
            >
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="form" v-model="valid" @submit.prevent="validateAndUpdate">
        <v-row class="ml-5 mr-5">
          <v-col cols="12" md="5">
            <v-card>
              <v-card-title>Image</v-card-title>
              <v-card-text>
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  style="display: none"
                  @change="handleImageUpload"
                />
                <v-btn color="secondary" @click="$refs.fileInput.click()">
                  Upload New Image
                </v-btn>
                <v-img
                  :src="displayedImageUrl"
                  max-height="200"
                  contain
                  class="mt-6"
                ></v-img>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="7">
            <v-card>
              <v-card-title>Tool Detail</v-card-title>
              <v-card-text>
                <v-select
                  v-model="item.stack_type_id"
                  :items="stackOptions"
                  item-text="stack_name"
                  item-value="stack_type_id"
                  label="Stack Type"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Stack type is required']"
                ></v-select>
                <v-text-field
                  label="Tool name"
                  v-model="item.tool_name"
                  outlined
                  :rules="toolNameRules"
                ></v-text-field>
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
    name: "StackToolUpdatePage",
    data() {
      return {
        valid: false,
        stackOptions: [],
        imageFile: null,
        snackbar: {
          show: false,
          color: "",
          icon: "",
          message: "",
        },
        item: {
          our_st_id: null,
          stack_type_id: "",
          tool_name: "",
          img: "",
        },
        toolNameRules: [
          (v) => !!v || "Tool name is required",
          (v) =>
            (v && v.length <= 50) || "Tool name must be less than 50 characters",
        ],
        displayedImageUrl: "",
      };
    },
    methods: {
      async loadItem() {
        try {
          const id = this.$route.params.id;
          if (!id) {
            console.error("No ID provided in route params");
            this.showSnackbar("error", "No ID provided");
            return;
          }
          
          const response = await axios.get(
            `http://localhost:3000/api/stacktool/view/${id}`
          );
          const tool = response.data;
          this.item = {
            our_st_id: tool.our_st_id,
            stack_type_id: tool.stack_type_id,
            tool_name: tool.tool_name,
            img: tool.img,
          };
          this.displayedImageUrl = tool.img || require("@/assets/default.png");
        } catch (error) {
          console.error("Error loading stack tool:", error);
          this.showSnackbar(
            "error",
            "Error loading stack tool. Please try again."
          );
        }
      },
      handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            this.showSnackbar("error", "File size should not exceed 5MB");
            return;
          }
          this.imageFile = file;
          this.displayedImageUrl = URL.createObjectURL(file);
        }
      },
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
            "http://localhost:3000/api/stacktype/getall/"
          );
          this.stackOptions = response.data;
        } catch (error) {
          console.error("Error fetching stack types:", error);
          this.showSnackbar("error", "Failed to fetch stack types");
        }
      },
      async updateItem() {
        const formData = new FormData();
        // Send id in the request body as expected by the backend
        formData.append("id", this.$route.params.id);
        formData.append("tool_name", this.item.tool_name);
        formData.append("stack_type_id", this.item.stack_type_id);
  
        if (this.imageFile) {
          formData.append("img", this.imageFile);
        }
  
        try {
          const response = await axios.put(
            `http://localhost:3000/api/stacktool/update/${this.$route.params.id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (response.data.success) {
            this.showSnackbar("success", "Stack tool updated successfully");
            setTimeout(() => {
              this.$router.go(-1);
            }, 1500);
          } else {
            this.showSnackbar(
              "error",
              response.data.message || "Failed to update stack tool"
            );
          }
        } catch (err) {
          console.error("Failed to update stack tool:", err);
          this.showSnackbar(
            "error",
            err.response?.data?.message || "Failed to update stack tool. Please try again."
          );
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
      this.loadItem();
    },
  };
  </script>