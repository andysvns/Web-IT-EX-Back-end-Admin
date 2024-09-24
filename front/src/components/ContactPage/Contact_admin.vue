<template>
    <v-container color="#E0E5F2">
        <v-card>
            <v-card-title>
                <v-btn color="secondary" @click="addNew">
                    ADD NEW
                    <v-icon right>mdi-plus</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                    hide-details></v-text-field>
            </v-card-title>

            <v-data-table 
            :headers="headers" 
            :items="contacts" 
            :search="search" 
            :loading="loading" 
            :items-per-page="5"
                class="elevation-1">
                <template v-slot:item="{ item, index }">

                    <tr>
                        <td>{{ index + 1 }}</td>
                        <td class="number-td">{{ item.phone_number }}</td>
                        <td>{{ item.email }}</td>
                        <td class="address-url-td">{{ item.address_url }}</td>
                        <td class="location-td">{{ item.address }}</td>
                        <td>
                            <v-btn small color="secondary" @click="editItem(item)">
                                ແກ້ໄຂ
                            </v-btn>
                            <v-btn small color="red" @click="deleteItem(item)">
                                ລົບ
                            </v-btn>
                            
                        </td>

                    </tr>
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>

<script>
import axios from 'axios';


export default {
    data() {
        return {
            search: '',
            loading: true,
            contacts: [],
            error: null,
            headers: [

                { text: 'List', value: 'list',sortable: false },
                { text: 'Number Phone', value: 'phone_number' },
                { text: 'Email', value: 'email' },
                { text: 'URL Address', value: 'address_url' },
                { text: 'Location', value: 'address' },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
        };
    },
    mounted() {
        this.fetchContactInfo();
    },
    methods: {
        async fetchContactInfo() {
            try {
                const response = await axios.get('http://localhost:3000/contact');
                this.contacts = Array.isArray(response.data) ? response.data : [response.data];
                this.loading = false;
            } catch (err) {
                this.error = 'Failed to fetch contact information: ' + err.message;
                this.loading = false;
                console.error('Error fetching data:', err);
            }
        },
        addNew() {
            console.log('Add new item');
        },
        editItem(item) {
            this.$router.push({ name: 'ContactEdit', params: { id: item.contact_id } });
        },
    },
};
</script>

<style scoped>
.url-container {
    max-width: 200px;
    overflow-x: auto;
    white-space: nowrap;
}

.url-content {
    display: inline-block;
    padding-bottom: 5px;
}
.number-td{
    min-width: 175px;
}
.address-url-td{
    max-width: 250px;      /* Set a max-width for the cell */
    white-space: nowrap;   /* Prevent text wrapping */
    overflow-x: hidden;
    text-overflow: ellipsis; /* Show ellipsis (...) for overflow text */ 
}
.location-td{
    overflow-x: auto;      /* Enable horizontal scrolling */
    overflow-y: hidden;  
    max-width: 300px; 
    min-width: 150px;
}
::v-deep .v-data-table-header th {
  font-weight: 900;
  background-color: rgb(228, 228, 228);
}
</style>