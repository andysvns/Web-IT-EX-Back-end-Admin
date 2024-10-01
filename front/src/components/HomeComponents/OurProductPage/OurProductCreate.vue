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
                    <v-btn color="secondary" @click="validateAndCreate" :disabled="!valid">Add</v-btn>

                </v-toolbar>
            </v-col>
        </v-row>
        <v-form ref="form" v-model="valid" @submit.prevent="validateAndCreate">
            <v-row class="ml-5 mr-5">
                <v-col cols="12" md="5">
                    <v-card>
                        <v-card-title>Image</v-card-title>
                        <v-card-text>
                            <input type="file" ref="fileInput" accept="image/*" style="display: none"
                                @change="handleImageUpload">
                            <v-btn color="primary" @click="$refs.fileInput.click()">
                                Upload Image
                            </v-btn>
                            <v-img :src="displayedImageUrl" max-height="200" contain class="mt-4"></v-img>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="7">
                    <v-card>
                        <v-card-title>Product Detail</v-card-title>
                        <v-card-text>
                            <v-text-field label="Title" :rules="titleRules" v-model="item.title"
                                outlined></v-text-field>
                            <v-textarea label="Description" :rules="descRules" v-model="item.desc" rows="8"
                                outlined></v-textarea>
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
import axios from 'axios';

export default {
    name: 'ContactForm',
    data() {
        return {
            imageFile: null,
            valid: false,
            snackbarSuccess: false,
            snackbarError: false,
            item: {
                image: '',
                title: '',
                desc: '',
                created_at: '',
                updated_at: '',
            },
            iconRules: [
                v => !!v || 'Icon is required',
            ],
            titleRules: [
                v => !!v || 'Title is required',
            ],
            descRules: [
                v => !!v || 'Description required',
            ],
            displayedImageUrl: require('@/assets/default.png'),
        }
    },

    methods: {
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.imageFile = file;  // Store the file object
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.displayedImageUrl = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },
        handleImageUrlInput() {
            // You can add additional logic here if needed
        },
        goBack() {
            this.$router.go(-1)
        },
        validateAndCreate() {
            if (this.$refs.form.validate()) {
                this.CreateItem();
            }
        },
        async CreateItem() {
            const formData = new FormData();
            formData.append('title', this.item.title);
            formData.append('desc', this.item.desc);

            if (this.imageFile) {
                formData.append('img', this.imageFile);
            }

            try {
                const response = await axios.post('http://localhost:3000/ourproduct/create', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.data.success) {
                    this.$emit('item-created', response.data);
                    this.snackbarSuccess = true;
                    setTimeout(() => {
                        this.$router.go(-1);
                    }, 1500);
                }
            } catch (err) {
                console.error('Failed to create item:', err);
                this.snackbarError = true;
            }
        }

    }
}
</script>