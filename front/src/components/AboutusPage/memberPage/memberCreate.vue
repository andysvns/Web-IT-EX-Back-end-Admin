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
            <v-btn color="secondary" @click="validateAndCreate" :disabled="!valid">
              Add
            </v-btn>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="form" v-model="valid" @submit.prevent="validateAndCreate">
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
                  Upload Image
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
              <v-card-title>Member Detail</v-card-title>
              <v-card-text>
                <v-text-field
                  label="Full name"
                  :rules="nameRules"
                  v-model="item.mem_name"
                  outlined
                ></v-text-field>
                <v-text-field
                  label="Age"
                  :rules="ageRules"
                  v-model.number="item.mem_age"
                  type="number"
                  outlined
                ></v-text-field>
                <v-text-field
                  label="Position"
                  :rules="positionRules"
                  v-model="item.mem_position"
                  outlined
                ></v-text-field>
                <v-textarea
                  label="Address"
                  :rules="addressRules"
                  v-model="item.mem_address"
                  rows="3"
                  outlined
                ></v-textarea>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
      <v-snackbar v-model="snackbarSuccess" bottom right color="success">
        <template v-slot:default>
          <v-icon color="white" class="mr-2">mdi-check-circle</v-icon>
          Member created successfully!
        </template>
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbarSuccess = false">Close</v-btn>
        </template>
      </v-snackbar>
  
      <v-snackbar v-model="snackbarError" bottom right color="error">
        <template v-slot:default>
          <v-icon color="white" class="mr-2">mdi-alert-circle</v-icon>
          {{ errorMessage }}
        </template>
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbarError = false">Close</v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "MemberForm",
    data() {
      return {
        imageFile: null,
        valid: false,
        snackbarSuccess: false,
        snackbarError: false,
        errorMessage: "Failed to create member. Please try again.",
        item: {
          mem_img: "",
          mem_name: "",
          mem_age: "",
          mem_position: "",
          mem_address: "",
          created_at: "",
          updated_at: "",
        },
        nameRules: [
          v => !!v || "Name is required",
          v => (v && v.length <= 50) || "Name must be less than 50 characters"
        ],
        ageRules: [
          v => !!v || "Age is required",
          v => (v && v >= 0) || "Age must be a positive number"
        ],
        positionRules: [
          v => !!v || "Position is required"
        ],
        addressRules: [
          v => !!v || "Address is required"
        ],
        displayedImageUrl: require("@/assets/default.png"),
      };
    },
  
    methods: {
      handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
          if (file.size > 5000000) { // 5MB limit
            this.errorMessage = "Image size must be less than 5MB";
            this.snackbarError = true;
            return;
          }
          
          this.imageFile = file;
          const reader = new FileReader();
          reader.onload = (e) => {
            this.displayedImageUrl = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      },
  
      goBack() {
        this.$router.go(-1);
      },
  
      validateAndCreate() {
        if (this.$refs.form.validate()) {
          this.createMember();
        }
      },
  
      async createMember() {
        const formData = new FormData();
        formData.append("mem_name", this.item.mem_name);
        formData.append("mem_age", this.item.mem_age);
        formData.append("mem_position", this.item.mem_position);
        formData.append("mem_address", this.item.mem_address);
  
        if (this.imageFile) {
          formData.append("mem_img", this.imageFile);
        }
  
        try {
          const response = await axios.post(
            "http://localhost:3000/api/member/create",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              }
            }
          );
          
          if (response.data.success) {
            this.$emit("member-created", response.data);
            this.snackbarSuccess = true;
            setTimeout(() => {
              this.$router.go(-1);
            }, 1500);
          }
        } catch (error) {
          console.error("Failed to create member:", error);
          this.errorMessage = error.response?.data?.message || "Failed to create member. Please try again.";
          this.snackbarError = true;
        }
      },
    },
  };
  </script>