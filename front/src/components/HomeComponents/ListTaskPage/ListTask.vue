<template>
    <v-container color="#E0E5F2">
        <v-card>
            <v-card-title>
                <v-btn color="secondary" @click="addNewItem">
                    ADD NEW
                    <v-icon right>mdi-plus</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                    hide-details></v-text-field>
            </v-card-title>

            <v-data-table :headers="headers" :items="items" :search="search" :loading="loading" :items-per-page="15"
                class="elevation-1 ">
                <template v-slot:item="{ item, index }">

                    <tr>
                        <td class="text-center">{{ index + 1 }}</td>
                        <td class="icon-td">
                            <v-icon color="secondary" class="icon-item">
                                {{ item.icon }}
                            </v-icon>
                        </td>
                        <td class="number-td">{{ item.icon }}</td>
                        <td class="title-td">{{ item.title }}</td>
                        <td class="desc-td">{{ item.desc }}</td>
                        <td class="action-td">
                            <v-btn text small @click="editItem(item)">
                                <v-icon color="secondary">mdi-pencil-outline</v-icon>
                            </v-btn>
                            <v-btn text small @click="confirmDelete(item)">
                                <v-icon color="#EA2A2D">mdi-delete</v-icon>
                            </v-btn>
                            <!-- Confirmation Dialog -->
                            <v-dialog v-model="dialog" max-width="400">
                                <v-card>
                                    <v-card-title class="headline">Are you sure?</v-card-title>
                                    <v-card-text>
                                        Are you sure you want to delete this item?
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="green darken-1" text @click="closeDialog">Cancel</v-btn>
                                        <v-btn color="red darken-1" text @click="deleteItem">Delete</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                            <!-- Snackbar for deletion confirmation -->
                            <v-snackbar v-model="snackbarSuccess" bottom right color="success">
                                <v-icon color="white" left>mdi-check-circle</v-icon>
                                Item deleted successfully!
                                <v-btn color="white" text @click="snackbarSuccess = false">Close</v-btn>
                            </v-snackbar>
                            <v-snackbar v-model="snackbarError" bottom right color="error">
                                <v-icon color="white" left>mdi-alert-circle</v-icon>
                                Failed to delete item. Please try again.
                                <v-btn color="white" text @click="snackbarError = false">Close</v-btn>
                            </v-snackbar>

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

                { text: 'List', value: 'list', headerClass: 'text-center', align: 'center', sortable: false },
                { text: 'Icon', value: 'icon', headerClass: 'text-center', align: 'center', sortable: false },
                { text: 'Name', value: 'icon name', headerClass: 'text-center', align: 'center', },
                { text: 'Title', value: 'title', align: 'center', },
                { text: 'Description', value: 'description', align: 'center', },
                { text: 'Actions', value: 'actions', sortable: false, align: 'center', },
            ],
            dialog: false, // Controls the dialog visibility
            snackbarSuccess: false, // Controls the success snackbar visibility
            snackbarError: false, // Controls the error snackbar visibility
            itemToDelete: null, // Stores the item to be deleted
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
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
        addNewItem() {
            this.$router.push({ name: 'ListTaskCreate' });
        },
        editItem(item) {
            this.$router.push({ name: 'ListTaskEdit', params: { id: item.list_task_id } });
        },
        // Opens the dialog and sets the item to delete
        confirmDelete(item) {
            this.itemToDelete = item;
            this.dialog = true;
        },
        // Closes the confirmation dialog
        closeDialog() {
            this.dialog = false;
        },
        async deleteItem() {
            try {
                // Perform the DELETE request to the API
                const response = await axios.put(`http://localhost:3000/listtask/del/${this.itemToDelete.list_task_id}`);

                if (response.status === 200) {
                    // Assuming deletion is successful:
                    this.dialog = false;
                    this.snackbarSuccess = true; // Show success snackbar

                    // Refetch the data after successful deletion
                    await this.fetchData();
                } else {
                    console.error("Failed to delete item", response);
                    this.snackbarError = true; // Show error snackbar if delete fails
                }
            } catch (error) {
                console.error("Error during deletion:", error);
                this.snackbarError = true; // Show error snackbar on error
            }
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

.title-td {
    min-width: 150px;
}

.desc-td {
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

.icon-item {
    font-size: 36px;
    display: flex;
    align-items: center;
}

::v-deep .v-data-table-header th {
    font-weight: 900;
    background-color: rgb(228, 228, 228);
}
</style>