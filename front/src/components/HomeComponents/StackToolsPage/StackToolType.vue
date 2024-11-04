<template>
  <v-container color="#E0E5F2">
    <v-card>
      <v-card-title>
        <v-btn icon @click="goBack" class="mr-4">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-btn color="secondary" @click="openAddDialog">
          ADD NEW
          <v-icon right>mdi-plus</v-icon>
        </v-btn>
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
        :items="items"
        :search="search"
        :loading="loading"
        :items-per-page="15"
        class="elevation-1"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td class="text-center">{{ getSequentialNumber(item) }}</td>
            <td class="icon-text-td">{{ item.stack_name }}</td>
            <td class="action-td">
              <v-btn class="mr-5" text small @click="openEditDialog(item)">
                <v-icon color="secondary">mdi-pencil-outline</v-icon>
              </v-btn>
              <v-btn text small @click="confirmDelete(item)">
                <v-icon color="#EA2A2D">mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>

      <!-- Add New Dialog -->
      <v-dialog v-model="addDialog" max-width="500">
        <v-card>
          <v-card-title>Add New Stack Type</v-card-title>
          <v-card-text>
            <v-form ref="addForm" v-model="addFormValid" @submit.prevent>
              <v-text-field
                v-model.trim="newStackType.stack_name"
                label="Stack Name"
                :rules="nameRules"
                required
                outlined
                :error-messages="errorMessage"
                @input="errorMessage = ''"
                @keyup.enter="createStackType"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="grey darken-1" text @click="closeAddDialog"
              >Cancel</v-btn
            >
            <v-spacer></v-spacer>
            <v-btn
              color="secondary"
              @click="createStackType"
              :loading="loading"
              :disabled="!addFormValid || loading"
              >Save</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Edit Dialog -->
      <v-dialog v-model="editDialog" max-width="500">
        <v-card>
          <v-card-title>Edit Stack Type</v-card-title>
          <v-card-text>
            <v-form ref="editForm" v-model="editFormValid">
              <v-text-field
                v-model="editedStackType.stack_name"
                label="Stack Name"
                :rules="[(v) => !!v || 'Stack name is required']"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="grey darken-1" text @click="closeEditDialog"
              >Cancel</v-btn
            >
            <v-spacer></v-spacer>
            <v-btn color="secondary" @click="updateStackType" :loading="loading"
              >Update</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="dialog" max-width="400">
        <v-card>
          <v-card-title class="headline">Are you sure?</v-card-title>
          <v-card-text>
            Are you sure you want to delete this item?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="closeDialog"
              >Cancel</v-btn
            >
            <v-btn color="red darken-1" text @click="deleteItem">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbars -->
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" bottom right>
        <v-icon :color="snackbar.color" left>{{ snackbar.icon }}</v-icon>
        {{ snackbar.message }}
        <v-btn text @click="snackbar.show = false">Close</v-btn>
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
      loading: false,
      items: [],
      headers: [
        {
          text: "List",
          value: "stack_type_id",
          headerClass: "text-center",
          align: "center",
        },
        {
          text: "Name",
          value: "stack_name",
          headerClass: "text-center",
          align: "center",
        },
        { text: "Actions", value: "actions", sortable: false, align: "center" },
      ],
      // Delete dialog
      dialog: false,
      itemToDelete: null,

      addDialog: false,
      addFormValid: false,
      errorMessage: "",
      newStackType: {
        stack_name: "",
      },
      nameRules: [
        (v) => !!v || "Stack name is required",
        (v) =>
          (v && v.length >= 2) || "Stack name must be at least 2 characters",
        (v) =>
          (v && v.length <= 50) || "Stack name must be less than 50 characters",
      ],

      // Edit dialog
      editDialog: false,
      editFormValid: false,
      editedStackType: {
        stack_type_id: null,
        stack_name: "",
      },

      // Unified snackbar
      snackbar: {
        show: false,
        message: "",
        color: "success",
        icon: "mdi-check-circle",
      },
    };
  },
  computed: {
    sortedItems() {
      return [...this.items].sort((a, b) => a.stack_type_id - b.stack_type_id);
    },
  },
  mounted() {
    this.fetchData();
  },

  methods: {
    getSequentialNumber(item) {
      return (
        this.sortedItems.findIndex(
          (i) => i.stack_type_id === item.stack_type_id
        ) + 1
      );
    },
    // Fetch all stack types
    async fetchData() {
      this.loading = true;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/stacktype/getall"
        );
        this.items = Array.isArray(response.data)
          ? response.data
          : [response.data];
      } catch (err) {
        this.showSnackbar("Failed to fetch data", "error");
      } finally {
        this.loading = false;
      }
    },

    // Add new stack type methods
    openAddDialog() {
      this.addDialog = true;
      this.$nextTick(() => {
        if (this.$refs.addForm) {
          this.$refs.addForm.reset();
        }
      });
    },

    closeAddDialog() {
      this.addDialog = false;
      this.newStackType.stack_name = "";
      this.errorMessage = "";
      if (this.$refs.addForm) {
        this.$refs.addForm.reset();
      }
    },

    async createStackType() {
      if (!this.$refs.addForm.validate()) return;

      this.loading = true;
      try {
        const response = await axios.post(
          "http://localhost:3000/api/stacktype/create",
          {
            stack_name: this.newStackType.stack_name.trim(),
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          await this.fetchData();
          this.closeAddDialog();
          this.showSnackbar("Stack type created successfully");
        } else {
          throw new Error(
            response.data.message || "Failed to create stack type"
          );
        }
      } catch (error) {
        console.error("Create error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to create stack type";
        this.errorMessage = errorMessage;
        this.showSnackbar(errorMessage, "error");
      } finally {
        this.loading = false;
      }
    },

    // Edit stack type methods
    async openEditDialog(item) {
      this.loading = true;
      try {
        const response = await axios.get(
          `http://localhost:3000/api/stacktype/view/${item.stack_type_id}`
        );
        this.editedStackType = { ...response.data };
        this.editDialog = true;
      } catch (error) {
        this.showSnackbar("Failed to fetch stack type details", "error");
      } finally {
        this.loading = false;
      }
    },

    closeEditDialog() {
      this.editDialog = false;
      this.editedStackType = {
        stack_type_id: null,
        stack_name: "",
      };
    },

    async updateStackType() {
      if (!this.$refs.editForm.validate()) return;

      this.loading = true;
      try {
        await axios.put(
          `http://localhost:3000/api/stacktype/update/${this.editedStackType.stack_type_id}`,
          {
            stack_name: this.editedStackType.stack_name,
          }
        );
        await this.fetchData();
        this.closeEditDialog();
        this.showSnackbar("Stack type updated successfully");
      } catch (error) {
        this.showSnackbar("Failed to update stack type", "error");
      } finally {
        this.loading = false;
      }
    },

    // Delete methods
    confirmDelete(item) {
      this.itemToDelete = item;
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      this.itemToDelete = null;
    },

    async deleteItem() {
      if (!this.itemToDelete) return;

      this.loading = true;
      try {
        await axios.put(
          `http://localhost:3000/api/stacktype/del/${this.itemToDelete.stack_type_id}`
        );
        await this.fetchData();
        this.showSnackbar("Stack type deleted successfully");
      } catch (error) {
        this.showSnackbar("Failed to delete stack type", "error");
      } finally {
        this.loading = false;
        this.closeDialog();
      }
    },

    // Utility methods
    goBack() {
      this.$router.go(-1);
    },

    showSnackbar(message, type = "success") {
      this.snackbar.message = message;
      this.snackbar.color = type;
      this.snackbar.icon =
        type === "success" ? "mdi-check-circle" : "mdi-alert-circle";
      this.snackbar.show = true;
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
  max-width: 350px;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
}

.action-td {
  display: flex;
  justify-content: center;
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
