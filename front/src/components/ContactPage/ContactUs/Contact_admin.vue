<template>
  <v-card class="mx-auto mt-10" max-width="800" elevation="2">
    <v-card-title class="d-flex justify-space-between align-center">
      Contact Information
      <v-btn icon @click="editItem(contact)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <div class="contact-info">
        <div class="info-item">
          <v-icon color="secondary" large>mdi-phone</v-icon>
          <div class="info-content">
            <div class="info-label">Phone Number</div>
            <div class="info-value">{{ contact.phone_number }}</div>
          </div>
        </div>

        <div class="info-item">
          <v-icon color="secondary" large>mdi-email</v-icon>
          <div class="info-content">
            <div class="info-label">Email</div>
            <div class="info-value">{{ contact.email }}</div>
          </div>
        </div>

        <div class="info-item">
          <v-icon color="secondary" large>mdi-map-marker</v-icon>
          <div class="info-content">
            <div class="info-label">Location</div>
            <div class="info-value">{{ contact.address }}</div>
          </div>
        </div>
      </div>
    </v-card-text>

    <v-card-subtitle class="pt-4 pb-2">Find Us on Google Map</v-card-subtitle>

    <v-card-text>
      <div class="map-container">
        <iframe
          :src="contact.address_url"
          width="100%"
          height="300"
          style="border: 0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </v-card-text>
  </v-card>
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
  mounted() {
    this.fetchContactInfo();
  },
  methods: {
    async fetchContactInfo() {
      this.loading = true;
      try {
        const response = await axios.get("http://localhost:3000/contact");
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.contact = response.data[0]; // Display the first contact
        } else if (typeof response.data === "object") {
          this.contact = response.data;
        } else {
          throw new Error("No contact data available");
        }
      } catch (err) {
        console.error("Failed to fetch contact information:", err);
        // You might want to show an error message to the user here
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
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 500;
}

.map-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
}

.map-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
