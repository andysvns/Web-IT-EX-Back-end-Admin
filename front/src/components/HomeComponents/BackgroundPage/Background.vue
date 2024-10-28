<template>
  <v-container>
    <v-row class="ml-5 mr-5">
      <v-col cols="12">
        <v-toolbar flat color="transparent">
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="openEditDialog">Edit</v-btn>
        </v-toolbar>
      </v-col>
    </v-row>
    <v-row class="ml-5 mr-5">
      <v-col cols="12">
        <v-card class="custom-card">
          <v-card-title class="custom-card-title">
            Background Image:
            <span class="section-content">{{ item.img_name }}</span>
          </v-card-title>
          <v-card-text>
            <v-img
              :src="item.img || require('@/assets/default.png')"
              :lazy-src="require('@/assets/default.png')"
              max-height="550"
              contain
              class="mt-6 mb-10"
              @error="handleImageError"
            ></v-img>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="headline primary white--text">
          Edit Background
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form ref="form" v-model="valid">
            <v-text-field
              label="Background name"
              :rules="titleRules"
              v-model="editedItem.img_name"
              outlined
              dense
              class="mb-4"
            ></v-text-field>
            <v-card outlined class="mb-4">
              <v-img
                :src="
                  displayedImageUrl ||
                  editedItem.img ||
                  require('@/assets/default.png')
                "
                :lazy-src="require('@/assets/default.png')"
                max-height="300"
                contain
                @error="handleImageError"
              >
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="primary"
                    ></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-card>
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              style="display: none"
              @change="handleImageUpload"
            />
            <v-btn
              color="primary"
              @click="$refs.fileInput.click()"
              block
              class="mb-4"
            >
              <v-icon left>mdi-image-edit</v-icon>
              Change Image
            </v-btn>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="" text @click="closeDialog"> Cancel </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            @click="validateAndUpdate"
            :disabled="!valid"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbars -->
    <v-snackbar right v-model="snackbarSuccess" color="success" :timeout="3000">
      Item updated successfully!
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbarSuccess = false"
          >Close</v-btn
        >
      </template>
    </v-snackbar>

    <v-snackbar right v-model="snackbarError" color="error" :timeout="3000">
      Failed to update item. Please try again.
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbarError = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "IntroDisplay",
  data() {
    return {
      item: {
        background_id: null,
        img_name: "",
        img: "",
        updated_at: "",
      },
      editedItem: {},
      dialog: false,
      valid: true,
      titleRules: [(v) => !!v || "Name is required"],
      displayedImageUrl: null,
      imageFile: null,
      loading: false,
      error: null,
      snackbarSuccess: false,
      snackbarError: false,
    };
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
          "http://localhost:3000/api/background/getfirst",
          {
            timeout: 10000,
          }
        );
        this.item = response.data;
      } catch (err) {
        console.error("Error fetching data:", err);
        this.error =
          "Failed to fetch background information: " +
          (err.response?.data?.message || err.message);
      } finally {
        this.loading = false;
      }
    },
    openEditDialog() {
      this.editedItem = { ...this.item };
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = {};
      });
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.imageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.displayedImageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    validateAndUpdate() {
      if (this.$refs.form.validate()) {
        this.updateItem();
      } else {
        console.error("Form validation failed");
      }
    },
    async updateItem() {
      try {
        const formData = new FormData();
        formData.append("img_name", this.editedItem.img_name);

        if (this.imageFile) {
          formData.append("img", this.imageFile);
        }

        const response = await axios.put(
          `http://localhost:3000/api/background/update/${this.editedItem.background_id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          this.item = response.data;
          this.snackbarSuccess = true;
          this.closeDialog();
          this.fetchData(); // Refresh the data
        }
      } catch (err) {
        console.error("Failed to update item:", err);
        this.snackbarError = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.custom-card {
  font-family: Arial, sans-serif;
}

.custom-card-title {
  font-weight: bold;
  font-size: 24px;
}

.custom-section {
  margin-top: 16px;
}

.section-label {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.section-content {
  margin-left: 12px;
  font-size: 1.25rem;
  color: #666;
}
</style>
