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
      }
    },
    methods: {
      goBack() {
        this.$router.go(-1)
      },
      validateAndCreate() {
        if (this.$refs.form.validate()) {
          this.CreateItem();
        }
      },
      async CreateItem() {
        this.item.created_at = new Date().toISOString();
        this.item.updated_at = new Date().toISOString();
        try {
          const response = await axios.post('http://localhost:3000/listtask/create/', this.item);
          if (response.status === 200) {
            this.$emit('item-created', response.data);
            // Check if $vuetify and snackbar are available
            if (this.$vuetify && this.$vuetify.snackbar) {
              this.$vuetify.snackbar.success('Item created successfully!');
            } else {
              alert('Item created successfully!');
            }
            this.$router.go(-1);
          }
        } catch (err) {
          console.error('Failed to create item:', err);
          // Check if $vuetify and snackbar are available
          if (this.$vuetify && this.$vuetify.snackbar) {
            this.$vuetify.snackbar.error('Failed to create item. Please try again.');
          } else {
            alert('Failed to create item. Please try again.');
          }
        }
      }
    }
  }
  </script>