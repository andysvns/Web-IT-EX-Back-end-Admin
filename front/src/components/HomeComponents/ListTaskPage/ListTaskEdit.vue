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
              <v-card-title>List Icon</v-card-title>
              <v-card-text>
                <v-text-field label="Icon mdi name" :rules="iconRules" v-model="item.icon" outlined></v-text-field>
                <v-icon size="200" color="secondary">{{ item.icon }}</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="7">
            <v-card>
              <v-card-title>List Detail</v-card-title>
              <v-card-text>
                <v-text-field label="Title" :rules="titleRules" v-model="item.title" outlined></v-text-field>
                <v-textarea label="Description" :rules="descRules" v-model="item.desc" rows="8" outlined></v-textarea>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'ContactForm',
    data() {
      return {
        valid: false,
        item: {
          icon: '',
          title: '',
          desc: '',
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
      }
    },
    created() {
      this.fetchItemById();
    },
    methods: {
      goBack() {
        this.$router.go(-1)
      },
      async fetchItemById() {
        const id = this.$route.params.id;
        console.log('Fetched ID:', id);
  
        if (!id) {
          console.error('No ID found in route params.');
          return;
        }
  
        try {
          const response = await axios.get(`http://localhost:3000/listtask/view/${id}`);
          this.item = response.data;
        } catch (err) {
          console.error('Failed to fetch item by ID:', err);
        }
      },
      validateAndUpdate() {
        if (this.$refs.form.validate()) {
          this.updateItem();
        } else {
          console.error('Form validation failed');
        }
      },
      async updateItem() {
        const id = this.$route.params.id;
        this.item.updated_at = new Date().toISOString();
        if (!id) {
          console.error('No ID found in route params.');
          return;
        }
  
        try {
          const response = await axios.put(`http://localhost:3000/listtask/update/${id}`, this.item);
          if (response.status === 200) {
            this.$emit('item-updated', response.data);
            alert('Item updated successfully!');
            this.$router.go(-1);
          }
        } catch (err) {
          console.error('Failed to update item:', err);
          alert('Failed to update item. Please try again.');
        }
      }
    }
  }
  </script>