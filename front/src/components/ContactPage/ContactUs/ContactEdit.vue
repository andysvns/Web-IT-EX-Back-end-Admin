<template>
  <v-container>
    <v-row justify="center" class="mt-5">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card elevation="2">
          <v-toolbar flat color="transparent mb-3">
            <v-btn icon @click="goBack">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>Contact Information</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              color="secondary"
              @click="validateAndUpdate"
              :loading="loading"
              :disabled="!valid || loading"
            >
              Update
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <!-- Phone Number -->
              <v-text-field
                v-model="contact.phone_number"
                :rules="phoneRules"
                label="Phone Number"
                placeholder="Please Enter"
                outlined
                required
                :loading="loading"
                :disabled="loading"
                prepend-inner-icon="mdi-phone"
              ></v-text-field>

              <!-- Email -->
              <v-text-field
                v-model="contact.email"
                :rules="emailRules"
                label="Email"
                placeholder="Please Enter"
                outlined
                required
                :loading="loading"
                :disabled="loading"
                prepend-inner-icon="mdi-email"
              ></v-text-field>

              <!-- Location -->
              <v-textarea
                v-model="contact.address"
                :rules="locationRules"
                label="Location"
                outlined
                rows="4"
                placeholder="Please Enter"
                required
                :loading="loading"
                :disabled="loading"
                prepend-inner-icon="mdi-map-marker"
              ></v-textarea>
              <!-- URL Address -->
              <v-textarea
                v-model="contact.address_url"
                :rules="urlRules"
                label="Address URL"
                outlined
                placeholder="Please Enter"
                required
                rows="5"
                auto-grow
                :loading="loading"
                :disabled="loading"
                prepend-inner-icon="mdi-text-box"
              ></v-textarea>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      bottom
      right
      :timeout="3000"
    >
      <v-icon left>{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "ContactForm",
  data: () => ({
    valid: true,
    loading: false,
    contact: {
      phone_number: "",
      email: "",
      address_url: "",
      address: "",
      updated_at: "",
    },
    snackbar: {
      show: false,
      color: "",
      icon: "",
      message: "",
    },
    phoneRules: [
      (v) => !!v || "Phone number is required",
      (v) =>
        /^[0-9+\-\s()]*$/.test(v) ||
        "Phone number must contain only digits and basic symbols",
    ],
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
    urlRules: [
      (v) => !!v || "Description is required",
      (v) => v.length <= 500 || "Description must be less than 500 characters",
    ],
    locationRules: [
      (v) => !!v || "Location is required",
      (v) => v.length <= 200 || "Location must be less than 200 characters",
    ],
  }),

  created() {
    this.fetchContactById();
  },

  methods: {
    validateAndUpdate() {
      if (this.$refs.form.validate()) {
        this.updateContact();
      }
    },

    showSnackbar(type, message) {
      this.snackbar.show = true;
      this.snackbar.color = type === "success" ? "success" : "error";
      this.snackbar.icon =
        type === "success" ? "mdi-check-circle" : "mdi-alert-circle";
      this.snackbar.message = message;
    },

    async fetchContactById() {
      const id = this.$route.params.id;
      if (!id) {
        this.showSnackbar("error", "No contact ID provided");
        setTimeout(() => this.goBack(), 1500);
        return;
      }

      this.loading = true;
      try {
        const response = await axios.get(
          `http://localhost:3000/api/contact/view/${id}`
        );
        if (response.data) {
          this.contact = response.data;
        } else {
          throw new Error("Contact not found");
        }
      } catch (error) {
        console.error("Failed to fetch contact:", error);
        this.showSnackbar("error", "Failed to load contact information");
        setTimeout(() => this.goBack(), 1500);
      } finally {
        this.loading = false;
      }
    },

    async updateContact() {
      const id = this.$route.params.id;
      if (!id) {
        this.showSnackbar("error", "No contact ID provided");
        return;
      }

      this.loading = true;
      try {
        const updateData = {
          ...this.contact,
          updated_at: new Date().toISOString(),
        };

        const response = await axios.put(
          `http://localhost:3000/api/contact/update/${id}`,
          updateData
        );

        // Check if the status is 200 (success)
        if (response.status === 200) {
          this.showSnackbar("success", "Contact updated successfully");
          setTimeout(() => this.goBack(), 1500);
        } else {
          // If not 200, treat as error
          throw new Error(response.data.message || "Update failed");
        }
      } catch (error) {
        console.error("Failed to update contact:", error);
        // Show error message from response if available, otherwise show generic error
        this.showSnackbar(
          "error",
          error.response?.data?.message || "Failed to update contact"
        );
      } finally {
        this.loading = false;
      }
    },

    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.v-btn {
  text-transform: none;
}

.v-card {
  border-radius: 8px;
}

.v-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Add consistent colors for snackbar text */
.v-snackbar .v-icon {
  color: white !important;
}

.v-snackbar .v-btn {
  color: white !important;
}
</style>
