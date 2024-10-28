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
          <v-btn
            color="secondary"
            @click="validateAndCreate"
            :disabled="!valid"
          >
            Add
          </v-btn>
        </v-toolbar>
      </v-col>
    </v-row>
    <v-form ref="form" v-model="valid" @submit.prevent="validateAndCreate">
      <v-row class="ml-5 mr-5">
        <v-col cols="12" md="5">
          <v-card>
            <v-card-title>Images</v-card-title>
            <v-card-text>
              <!-- Display main image -->
              <v-img
                :src="displayedImageUrl"
                max-height="200"
                contain
                class="mt-3"
              ></v-img>
              <input
                type="file"
                ref="imgInput"
                accept="image/*"
                style="display: none"
                @change="handleImageUpload('img')"
              />
              <v-btn
                class="mt-4"
                color="secondary"
                @click="$refs.imgInput.click()"
              >
                Upload Gif
              </v-btn>

              <!-- Display hover image -->
              <v-img
                :src="displayedImageHoverUrl"
                max-height="200"
                contain
                class="mt-3"
              ></v-img>
              <input
                type="file"
                ref="imgHoverInput"
                accept="image/*"
                style="display: none"
                @change="handleImageUpload('imgHover')"
              />
              <v-btn
                class="mt-4"
                color="secondary"
                @click="$refs.imgHoverInput.click()"
              >
                Upload Hover Image
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="7">
          <v-card>
            <v-card-title>Impact of number Detail</v-card-title>
            <v-card-text>
              <v-text-field
                label="Number"
                :rules="numRules"
                v-model="item.num_text"
                outlined
              ></v-text-field>
              <v-text-field
                label="Description"
                :rules="descRules"
                v-model="item.desc"
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
      Item created successfully!
      <v-btn color="white" text @click="snackbarSuccess = false">Close</v-btn>
    </v-snackbar>

    <!-- Error snackbar -->
    <v-snackbar v-model="snackbarError" bottom right color="error">
      <v-icon color="white" left>mdi-alert-circle</v-icon>
      Failed to create item. Please try again.
      <v-btn color="white" text @click="snackbarError = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "ContactForm",
  data() {
    return {
      imageFile: null,
      imageHoverFile: null, 
      valid: false,
      snackbarSuccess: false,
      snackbarError: false,
      item: {
        image: "",
        num_text: "",
        desc: "",
        created_at: "",
        updated_at: "",
      },
      iconRules: [(v) => !!v || "Icon is required"],
      numRules: [(v) => !!v || "Number is required"],
      descRules: [(v) => !!v || "Description is required"],
      displayedImageUrl: require("@/assets/default.png"),
      displayedImageHoverUrl: require("@/assets/default.png"),
    };
  },

  methods: {
    handleImageUpload(type) {
      const input =
        type === "img" ? this.$refs.imgInput : this.$refs.imgHoverInput;
      const file = input.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (type === "img") {
            this.imageFile = file;
            this.displayedImageUrl = e.target.result;
          } else if (type === "imgHover") {
            this.imageHoverFile = file;
            this.displayedImageHoverUrl = e.target.result;
          }
        };
        reader.readAsDataURL(file);
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    validateAndCreate() {
      if (this.$refs.form.validate()) {
        this.CreateItem();
      }
    },
    async CreateItem() {
      const formData = new FormData();
      formData.append("num_text", this.item.num_text);
      formData.append("desc", this.item.desc);

      if (this.imageFile) {
        formData.append("img", this.imageFile);
      }
      if (this.imageHoverFile) {
        formData.append("img_hover", this.imageHoverFile);
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/api/impact/create",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.success) {
          this.$emit("item-created", response.data);
          this.snackbarSuccess = true;
          setTimeout(() => {
            this.$router.go(-1);
          }, 1500);
        }
      } catch (err) {
        console.error("Failed to create item:", err);
        this.snackbarError = true;
      }
    },
  },
};
</script>
