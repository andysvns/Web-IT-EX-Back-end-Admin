<template>
  <v-container color="#E0E5F2">
    <v-card>
      <v-card-title>
        <v-btn color="secondary" @click="addNewItem">
          ADD NEW
          <v-icon right>mdi-plus</v-icon>
        </v-btn>
        <v-select
          v-model="selectedType"
          :items="stackOptions"
          item-text="s_type_name"
          item-value="social_type_id"
          label="Social type"
          outlined
          dense
          hide-details
          class="mt-0 pt-0 ml-6"
          style="max-width: 150px"
          @change="filterItems"
        ></v-select>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :search="search"
        :loading="loading"
        :items-per-page="15"
        class="elevation-1"
      >
        <template v-slot:item="{ item, index }">
          <tr>
            <td class="text-center">{{ index + 1 }}</td>
            <td class="img-td">
              <v-icon color="secondary" class="icon-item">
                {{ item.icon }}
              </v-icon>
            </td>
            <td class="title-td">{{ item.title }}</td>
            <td class="title-td">{{ item.social_url }}</td>
            <td class="action-td">
              <v-btn text small @click="editItem(item)">
                <v-icon color="secondary">mdi-pencil-outline</v-icon>
              </v-btn>
              <v-btn text small @click="confirmDelete(item)">
                <v-icon color="#EA2A2D">mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>

      <!-- Confirmation Dialog -->
      <v-dialog v-model="dialog" max-width="400">
        <v-card>
          <v-card-title class="headline">Are you sure?</v-card-title>
          <v-card-text>
            Are you sure you want to delete this item?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="green darken-1"
              text
              @click="closeDialog"
              ref="cancelBtn"
              >Cancel</v-btn
            >
            <v-btn color="red darken-1" text @click="deleteItem">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbars -->
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
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      search: "",
      loading: true,
      items: [],
      filteredItems: [],
      selectedType: null,
      stackOptions: [],
      error: null,
      headers: [
        { text: "List", value: "list", align: "center", sortable: false },
        { text: "Icon", value: "img", align: "center", sortable: false },
        { text: "Name", value: "title", align: "center" },
        { text: "Link", value: "social_url", align: "center" },
        { text: "Actions", value: "actions", sortable: false, align: "center" },
      ],
      dialog: false,
      snackbarSuccess: false,
      snackbarError: false,
      itemToDelete: null,
    };
  },
  mounted() {
    this.fetchStackTypes();
    this.fetchData();
  },
  methods: {
    async fetchStackTypes() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/socialtype/getall/"
        );
        this.stackOptions = [
          { s_type_name: "All Social", social_type_id: null },
          ...response.data,
        ];
      } catch (error) {
        console.error("Error fetching stack types:", error);
      }
    },
    async fetchData() {
      this.loading = true;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/socialurl/getall",
          {
            timeout: 10000,
          }
        );
        this.items = Array.isArray(response.data)
          ? response.data
          : [response.data];
        this.filterItems();
      } catch (err) {
        console.error("Error fetching data:", err);
        this.error =
          "Failed to fetch stack tool information: " +
          (err.response?.data?.message || err.message);
      } finally {
        this.loading = false;
      }
    },
    filterItems() {
      if (this.selectedType) {
        this.filteredItems = this.items.filter(
          (item) => item.social_type_id === this.selectedType
        );
      } else {
        this.filteredItems = this.items;
      }
    },
    addNewItem() {
      this.$router.push({ name: "SocialCreate" });
    },
    editItem(item) {
      this.$router.push({
        name: "SocialEdit",
        params: { id: item.social_url_id },
      });
    },
    confirmDelete(item) {
      this.itemToDelete = item;
      this.dialog = true;
      this.$nextTick(() => {
        if (this.$refs.cancelBtn) {
          this.$refs.cancelBtn.$el.focus();
        }
      });
    },
    closeDialog() {
      this.dialog = false;
      this.itemToDelete = null;
    },
    async deleteItem() {
      if (!this.itemToDelete) {
        console.error("No item selected for deletion");
        this.closeDialog();
        return;
      }

      this.loading = true;
      try {
        const response = await axios.put(
          `http://localhost:3000/api/socialurl/del/${this.itemToDelete.social_url_id}`
        );
        if (response.status === 200) {
          this.snackbarSuccess = true;
          await this.fetchData();
        } else {
          throw new Error("Unexpected response status");
        }
      } catch (error) {
        console.error("Error during deletion:", error);
        this.snackbarError = true;
      } finally {
        this.loading = false;
        this.closeDialog();
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
  /* min-width: 150px; */
}

.desc-td {
  max-width: 250px;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
}

.action-td {
  height: inherit;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.icon-item {
  font-size: 36px;
  display: flex;
  align-items: center;
}

td {
  min-height: 80px;
}

.img-td {
  max-width: 100px;
}

::v-deep .v-data-table-header th {
  font-weight: 900;
  background-color: rgb(228, 228, 228);
}
</style>
