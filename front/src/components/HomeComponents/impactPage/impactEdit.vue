<template>
  <v-container>
    <v-form ref="form" v-model="valid" @submit.prevent="validateAndUpdate">
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
              :disabled="!valid"
              >Save</v-btn
            >
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row class="ml-5 mr-5">
        <v-col cols="12" md="5">
          <v-card>
            <v-card-title>Images</v-card-title>
            <v-card-text>
              <v-img
                :src="
                  displayedImageUrl ||
                  item.img ||
                  require('@/assets/default.png')
                "
                :lazy-src="require('@/assets/default.png')"
                max-height="200"
                contain
                class="mt-3"
                @error="() => handleImageError(item)"
              ></v-img>
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                style="display: none"
                @change="(event) => handleImageUpload('img', event)"
              />
              <v-btn
                class="mt-4"
                color="secondary"
                @click="$refs.fileInput.click()"
              >
                Upload Image
              </v-btn>

              <v-img
                :src="
                  displayedImageHoverUrl ||
                  item.img_hover ||
                  require('@/assets/default.png')
                "
                max-height="200"
                contain
                class="mt-3"
                @error="() => handleImageHoverError(item)"
              ></v-img>
              <input
                type="file"
                ref="imgHoverInput"
                accept="image/*"
                style="display: none"
                @change="(event) => handleImageUpload('imgHover', event)"
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

    <v-snackbar v-model="snackbarSuccess" bottom right color="success">
      <v-icon color="white" left>mdi-check-circle</v-icon>
      Edited item successfully!
      <v-btn color="white" text @click="snackbarSuccess = false">Close</v-btn>
    </v-snackbar>

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
  name: "ContactForm",
  data() {
    return {
      valid: false,
      snackbarSuccess: false,
      snackbarError: false,
      errorMessage: "",
      item: {
        img: "",
        img_hover: "",
        num_text: "",
        desc: "",
        updated_at: "",
      },
      imageFile: null,
      imageHoverFile: null,
      displayedImageUrl: null,
      displayedImageHoverUrl: null,
      numRules: [(v) => !!v || "Number is required"],
      descRules: [(v) => !!v || "Description is required"],
    };
  },
  created() {
    this.fetchItemById();
  },
  methods: {
    handleImageError(item) {
      console.error("Image failed to load for item:", item);
      this.$set(item, "img", require("@/assets/default.png"));
    },
    handleImageHoverError(item) {
      console.error("Hover image failed to load for item:", item);
      this.$set(item, "img_hover", require("@/assets/default.png"));
    },
    handleImageUpload(type, event) {
      const file = event.target.files[0];
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
    async fetchItemById() {
      const id = this.$route.params.id;
      console.log("Fetched ID:", id);

      if (!id) {
        console.error("No ID found in route params.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/impact/view/${id}`
        );
        this.item = response.data;
      } catch (err) {
        console.error("Failed to fetch item by ID:", err);
        this.errorMessage = "Failed to fetch item. Please try again.";
        this.snackbarError = true;
      }
    },
    validateAndUpdate() {
      if (this.$refs.form.validate()) {
        this.updateItem();
      } else {
        console.error("Form validation failed");
        this.errorMessage = "Please fill in all required fields.";
        this.snackbarError = true;
      }
    },
    async updateItem() {
      const id = this.$route.params.id;
      if (!id) {
        console.error("No ID found in route params.");
        this.errorMessage = "No item ID found. Please try again.";
        this.snackbarError = true;
        return;
      }

      try {
        const formData = new FormData();
        formData.append("num_text", this.item.num_text);
        formData.append("desc", this.item.desc);

        if (this.imageFile) {
          formData.append("img", this.imageFile);
        }
        if (this.imageHoverFile) {
          formData.append("img_hover", this.imageHoverFile);
        }

        const response = await axios.put(
          `http://localhost:3000/api/impact/update/${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          this.$emit("item-updated", response.data);
          this.snackbarSuccess = true;
          setTimeout(() => {
            this.$router.go(-1);
          }, 1500);
        }
      } catch (err) {
        console.error("Failed to update item:", err);
        this.errorMessage = "Failed to update item. Please try again.";
        this.snackbarError = true;
      }
    },
  },
};
</script>
