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
                        <v-btn color="secondary" @click="validateAndUpdate" :disabled="!valid">Save</v-btn>
                    </v-toolbar>
                </v-col>
            </v-row>
            <v-row class="ml-5 mr-5">
                <v-col cols="12" md="5">
                    <v-card>
                        <v-card-title>Image</v-card-title>
                        <v-card-text>
                            <input type="file" ref="fileInput" accept="image/*" style="display: none"
                                @change="handleImageUpload">
                            <v-btn color="secondary" @click="$refs.fileInput.click()">
                                Upload Image
                            </v-btn>

                            <v-img :src="displayedImageUrl || item.mem_img || require('@/assets/default.png')"
                                :lazy-src="require('@/assets/default.png')" max-height="250" contain class="mt-6"
                                @error="() => handleImageError(item)"></v-img>
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
        <!-- Success snackbar -->
        <v-snackbar v-model="snackbarSuccess" bottom right color="success">
            <v-icon color="white" left>mdi-check-circle</v-icon>
            Edited member successfully!
            <v-btn color="white" text @click="snackbarSuccess = false">Close</v-btn>
        </v-snackbar>

        <!-- Error snackbar -->
        <v-snackbar v-model="snackbarError" bottom right color="error">
            <v-icon color="white" left>mdi-alert-circle</v-icon>
            Failed to edit member. Please try again.
            <v-btn color="white" text @click="snackbarError = false">Close</v-btn>
        </v-snackbar>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    name: 'MemberEditForm',
    data() {
        return {
            valid: false,
            snackbarSuccess: false,
            snackbarError: false,
            item: {
                mem_img: '',
                mem_name: '',
                mem_age: '',
                mem_position: '',
                mem_address: '',
                updated_at: '',
            },
            imageFile: null,
            displayedImageUrl: null,
            nameRules: [
                v => !!v || 'Name is required',
            ],
            ageRules: [
                v => !!v || 'Age is required',
                v => (v && v >= 0) || 'Age must be a positive number'
            ],
            positionRules: [
                v => !!v || 'Position is required',
            ],
            addressRules: [
                v => !!v || 'Address is required',
            ],
        }
    },
    created() {
        this.fetchMemberById();
    },
    methods: {
        handleImageError(item) {
            console.error("Image failed to load for item:", item);
            this.$set(item, "mem_img", require("@/assets/default.png"));
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
        goBack() {
            this.$router.go(-1)
        },
        async fetchMemberById() {
            const id = this.$route.params.id;
            console.log('Fetching member ID:', id);

            if (!id) {
                console.error('No ID found in route params.');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3000/api/member/view/${id}`);
                this.item = response.data;
            } catch (err) {
                console.error('Failed to fetch member by ID:', err);
            }
        },
        validateAndUpdate() {
            if (this.$refs.form.validate()) {
                this.updateMember();
            } else {
                console.error('Form validation failed');
            }
        },
        async updateMember() {
            const id = this.$route.params.id;
            if (!id) {
                console.error('No ID found in route params.');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('mem_name', this.item.mem_name);
                formData.append('mem_age', this.item.mem_age);
                formData.append('mem_position', this.item.mem_position);
                formData.append('mem_address', this.item.mem_address);
                
                if (this.imageFile) {
                    formData.append('mem_img', this.imageFile);
                }

                const response = await axios.put(`http://localhost:3000/api/member/update/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.status === 200) {
                    this.$emit('member-updated', response.data);
                    this.snackbarSuccess = true;
                    setTimeout(() => {
                        this.$router.go(-1);
                    }, 1500);
                }
            } catch (err) {
                console.error('Failed to update member:', err);
                this.snackbarError = true;
            }
        }
    }
}
</script>