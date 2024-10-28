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
            >Add</v-btn
          >
        </v-toolbar>
      </v-col>
    </v-row>
    <v-form ref="form" v-model="valid" @submit.prevent="validateAndCreate">
      <v-row class="ml-5 mr-5">
        <v-col cols="12">
          <v-card>
            <v-card-title>Tool Detail</v-card-title>
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
              ></v-select>
              <v-text-field
                label="Name"
                v-model="item.title"
                outlined
                :rules="toolNameRules"
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
      socialOptions: [],
      snackbar: {
        show: false,
        color: "",
        icon: "",
        message: "",
      },
      item: {
        social_type_id: "",
        title_name: "",
        social_url: "",
      },
      toolNameRules: [
        (v) => !!v || "Name is required",
        (v) => (v && v.length <= 50) || "Name must be less than 50 characters",
      ],
      iconRules: [(v) => !!v || "Icon is required"],
      urlRules: [(v) => !!v || "URL is required"],
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    validateAndCreate() {
      if (this.$refs.form.validate()) {
        this.createItem();
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
    async createItem() {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/socialurl/create",
          this.item
        );
        if (response.data.success) {
          this.showSnackbar("success", "Social created successfully");
          setTimeout(() => {
            this.$router.go(-1);
          }, 1500);
        } else {
          this.showSnackbar(
            "error",
            response.data.message || "Failed to create Social"
          );
        }
      } catch (err) {
        console.error("Failed to create social:", err);
        this.showSnackbar(
          "error",
          "Failed to create social. Please try again."
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
  },
};
</script>
