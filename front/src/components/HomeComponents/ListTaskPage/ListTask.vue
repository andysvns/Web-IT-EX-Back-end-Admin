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

            <v-data-table :headers="headers" :items="items" :search="search" :loading="loading" :items-per-page="5" 
                class="elevation-1 ">
                <template v-slot:item="{ item, index }">

                    <tr>
                        <td>{{ index + 1 }}</td>
                        <td class="icon-td">
                            <v-icon>
                                {{ item.icon }}
                            </v-icon>
                        </td>
                        <td class="number-td">{{ item.icon }}</td>
                        <td>{{ item.title }}</td>
                        <td class="desc-td">{{ item.desc }}</td>
                        <td class="action-td">
                            <v-btn small color="green" @click="editItem(item)">
                                <v-icon>mdi-pencil-outline</v-icon>
                            </v-btn>
                            <v-btn small color="red" @click="deleteItem(item)">
                                <v-icon>mdi-delete</v-icon>
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
    components: {
    },
    data() {
        return {
            search: '',
            loading: true,
            items: [],
            error: null,
            headers: [

                { text: 'List', value: 'list',headerClass: 'text-center',align: 'center', sortable: false },
                { text: 'Icon', value: 'icon',headerClass: 'text-center',align: 'center', },
                { text: 'Name', value: 'icon name',headerClass: 'text-center',align: 'center', },
                { text: 'Title', value: 'title', align: 'center', },
                { text: 'Description', value: 'description', align: 'center', },
                { text: 'Actions', value: 'actions', sortable: false,align: 'center', },
            ],
        };
    },
    mounted() {
        this.fetchContactInfo();
    },
    methods: {
        async fetchContactInfo() {
            try {
                const response = await axios.get('http://localhost:3000/listtask');
                this.items = Array.isArray(response.data) ? response.data : [response.data];
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
            this.$router.push({ name: 'ListTaskEdit', params: { id: item.list_task_id } });
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

.desc-td{
    max-width: 250px; 
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis; 
}

.action-td {
    display: flex;
    justify-content: space-evenly;
    align-items: center;

}

::v-deep .th {
  text-align: center;
}

::v-deep .v-data-table-header th {
    font-weight: 900;
    background-color: rgb(228, 228, 228);
}
</style>