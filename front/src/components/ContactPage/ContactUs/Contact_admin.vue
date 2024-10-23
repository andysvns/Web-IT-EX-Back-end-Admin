<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8">
        <v-card class="mt-10" elevation="2">
          <v-skeleton-loader
            v-if="loading"
            type="card"
            :loading="loading"
          ></v-skeleton-loader>

          <template v-else>
            <v-card-title
              class="headline d-flex justify-space-between align-center"
            >
              Contact Information
              <v-btn icon @click="editItem(contact)" color="secondary">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <v-list two-line>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon color="secondary">mdi-phone</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>Phone Number</v-list-item-title>
                    <v-list-item-subtitle>{{
                      contact.phone_number
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon color="secondary">mdi-email</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>Email</v-list-item-title>
                    <v-list-item-subtitle>{{
                      contact.email
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon color="secondary">mdi-map-marker</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>Location</v-list-item-title>
                    <v-list-item-subtitle
                      v-html="formattedDesc"
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-card-subtitle class="pt-4 pb-2 text-h6"
              >Find Us on Google Map</v-card-subtitle
            >

            <v-card-text>
              <v-responsive aspect-ratio="16/9">
                <iframe
                  :src="contact.address_url"
                  width="100%"
                  height="330px"
                  style="border: 0"
                  allowfullscreen
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
              </v-responsive>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      contact: {
        contact_id: null,
        phone_number: "",
        email: "",
        address: "",
        address_url: "",
      },
      loading: true,
    };
  },
  computed: {
    formattedDesc() {
      return this.contact.address.replace(/\n/g, "<br>");
    },
  },
  mounted() {
    this.fetchContactInfo();
  },
  methods: {
    async fetchContactInfo() {
      this.loading = true;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/contact/getall"
        );
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.contact = response.data[0];
        } else if (typeof response.data === "object") {
          this.contact = response.data;
        } else {
          throw new Error("No contact data available");
        }
      } catch (err) {
        console.error("Failed to fetch contact information:", err);
        this.$vuetify.snackbar = {
          color: "error",
          text: "Failed to load contact information. Please try again later.",
          visible: true,
        };
      } finally {
        this.loading = false;
      }
    },
    editItem(item) {
      this.$router.push({
        name: "ContactEdit",
        params: { id: item.contact_id },
      });
    },
  },
};
</script>

<style scoped>
.v-list-item__subtitle {
  white-space: pre-line;
}
</style>
