<template>
    <v-card class="mx-auto ma-10" max-width="600" elevation="2">
        <v-card-title class="text-h5 font-weight-regular">Contact Information</v-card-title>
        <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
                <!-- Phone Number -->
                <v-text-field v-model="contact.phone_number" :rules="phoneRules" label="Phone Number"
                    placeholder="Please Enter" outlined required></v-text-field>

                <!-- Email -->
                <v-text-field v-model="contact.email" :rules="emailRules" label="Email" placeholder="Please Enter" outlined
                    required></v-text-field>

                <!-- URL Address -->
                <v-textarea v-model="contact.address_url" :rules="urlRules" label="Description" outlined
                    placeholder="Please Enter" required rows="5" auto-grow></v-textarea>

                <!-- Location -->
                <v-text-field v-model="contact.address" :rules="locationRules" label="Location" outlined
                    placeholder="Please Enter" required></v-text-field>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="!valid" color="secondary" @click="updateContact">
                        ແກ້ໄຂ
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ContactForm',
    data: () => ({
        valid: true,
        contact: {
            phone_number: '',
            email: '',
            address_url: '',
            address: '',
            updated_at: '',
        },
        phoneRules: [
            v => !!v || 'Phone number is required',
        ],
        emailRules: [
            v => !!v || 'E-mail is required',
            v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
        ],
        urlRules: [
            v => !!v || 'URL is required',
        ],
        locationRules: [
            v => !!v || 'Location is required'
        ],
    }),
    created() {
        this.fetchContactById(); // Fetch the contact data when the component is created
    },
    methods: {
        async fetchContactById() {
            const id = this.$route.params.id; // Get the ID from route params
            console.log('Fetched ID:', id); // Debugging log to check if the ID is defined

            if (!id) {
                console.error('No ID found in route params.');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3000/contact/${id}`);
                this.contact = response.data; // Assign the fetched data to the contact object
            } catch (err) {
                console.error('Failed to fetch contact by ID:', err);
            }
        },
        async updateContact() {
            const id = this.$route.params.id; // Get the ID from route params
            this.contact.update_att = new Date().toISOString();
            if (!id) {
                console.error('No ID found in route params.');
                return;
            }

            try {
                const response = await axios.put(`http://localhost:3000/contact/update/${id}`, this.contact);
                if (response.status === 200) {
                    alert('Contact updated successfully!');
                }
            } catch (err) {
                console.error('Failed to update contact:', err);
            }
        }
    }
}
</script>

<style scoped>
.v-btn {
    text-transform: none;
}

</style>
