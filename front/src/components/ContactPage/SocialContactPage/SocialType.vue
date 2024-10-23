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
        <template v-slot:item="{ item, index }">
          <tr>
            <td class="text-center">{{ index + 1 }}</td>
            <td class="icon-td text-center">
              <v-icon color="secondary" class="icon-item">
                {{ item.icon }}
              </v-icon>
            </td>
            <td class="text-center">{{ item.s_type_name }}</td>
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
          <v-card-title>Add New Social Type</v-card-title>
          <v-card-text>
            <v-form ref="addForm" v-model="addFormValid">
              <v-text-field
                v-model.trim="newSocialType.s_type_name"
                label="Social Type Name"
                :rules="nameRules"
                required
                :error-messages="errorMessage"
                @input="errorMessage = ''"
                outlined
              ></v-text-field>

              <!-- Icon Preview Card -->
              <v-card class="mb-4 mt-4" outlined>
                <v-card-title>Icon Preview</v-card-title>
                <v-card-text>
                  <v-text-field
                    v-model.trim="newSocialType.icon"
                    label="Icon mdi name"
                    :rules="iconRules"
                    required
                    prefix="mdi-"
                    hint="Enter Material Design Icon name (e.g., 'facebook' for mdi-facebook)"
                    persistent-hint
                    outlined
                    @input="validateIconPreview"
                  ></v-text-field>
                  <div class="d-flex justify-center align-center mt-6">
                    <v-icon size="200" color="secondary">{{
                      getIconPreview(newSocialType.icon)
                    }}</v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="grey darken-1" text @click="closeAddDialog">
              Cancel
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="secondary"
              @click="createSocialType"
              :loading="loading"
              :disabled="!addFormValid || loading"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Edit Dialog -->
      <v-dialog v-model="editDialog" max-width="500">
        <v-card>
          <v-card-title>Edit Social Type</v-card-title>
          <v-card-text>
            <v-form ref="editForm" v-model="editFormValid">
              <v-text-field
                v-model="editedSocialType.s_type_name"
                label="Social Type Name"
                :rules="nameRules"
                required
                outlined
              ></v-text-field>

              <!-- Icon Preview Card -->
              <v-card class="mb-4 mt-4" outlined>
                <v-card-title>Icon Preview</v-card-title>
                <v-card-text>
                  <v-text-field
                    v-model="editedSocialType.icon"
                    label="Icon mdi name"
                    :rules="iconRules"
                    required
                    prefix="mdi-"
                    hint="Enter Material Design Icon name (e.g., 'facebook' for mdi-facebook)"
                    persistent-hint
                    outlined
                    @input="validateIconPreview"
                  ></v-text-field>
                  <div class="d-flex justify-center align-center mt-6">
                    <v-icon size="200" color="secondary">{{
                      getIconPreview(editedSocialType.icon)
                    }}</v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="grey darken-1" text @click="closeEditDialog">
              Cancel
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="secondary"
              @click="updateSocialType"
              :loading="loading"
            >
              Update
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
          <v-card-title class="headline">Delete Confirmation</v-card-title>
          <v-card-text>
            Are you sure you want to delete this social type?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDeleteDialog">
              Cancel
            </v-btn>
            <v-btn color="red darken-1" text @click="deleteItem">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        bottom
        right
        :timeout="3000"
      >
        <span class="d-flex align-center">
          <v-icon left>{{ snackbar.icon }}</v-icon>
          {{ snackbar.message }}
        </span>
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar.show = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "SocialTypeManagement",

  data() {
    return {
      // Table data
      search: "",
      loading: false,
      items: [],
      headers: [
        {
          text: "No.",
          value: "index",
          align: "center",
          sortable: false,
          width: "80",
        },
        {
          text: "Icon",
          value: "icon",
          align: "center",
          width: "100",
        },
        {
          text: "Social Type Name",
          value: "s_type_name",
          align: "center",
        },
        {
          text: "Actions",
          value: "actions",
          align: "center",
          sortable: false,
          width: "150",
        },
      ],

      // Form validation rules
      nameRules: [
        (v) => !!v || "Name is required",
        (v) => (v && v.length >= 2) || "Name must be at least 2 characters",
        (v) => (v && v.length <= 50) || "Name must be less than 50 characters",
      ],
      iconRules: [
        (v) => !!v || "Icon is required",
        (v) =>
          (v && !v.includes("mdi-")) ||
          "Please enter only the icon name without mdi- prefix",
        (v) =>
          (v && /^[a-z0-9-]+$/.test(v)) ||
          "Icon name can only contain lowercase letters, numbers, and hyphens",
      ],

      // Add dialog
      addDialog: false,
      addFormValid: false,
      errorMessage: "",
      newSocialType: {
        s_type_name: "",
        icon: "", // Initialize with empty string instead of potentially null
      },

      // Edit dialog
      editDialog: false,
      editFormValid: false,
      editedSocialType: {
        social_type_id: null,
        s_type_name: "",
        icon: "", // Initialize with empty string instead of potentially null
      },

      // Delete dialog
      deleteDialog: false,
      itemToDelete: null,

      // Snackbar
      snackbar: {
        show: false,
        message: "",
        color: "success",
        icon: "mdi-check-circle",
      },
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/socialtype/getall"
        );
        this.items = Array.isArray(response.data)
          ? response.data
          : [response.data];
      } catch (error) {
        this.showSnackbar("Failed to fetch data", "error");
        console.error("Fetch error:", error);
      } finally {
        this.loading = false;
      }
    },

    // Add methods
    openAddDialog() {
      this.addDialog = true;
      this.newSocialType = {
        s_type_name: "",
        icon: "", // Ensure icon is initialized as empty string
      };
      this.$nextTick(() => {
        if (this.$refs.addForm) {
          this.$refs.addForm.reset();
        }
      });
    },

    closeAddDialog() {
      this.addDialog = false;
      this.newSocialType = {
        s_type_name: "",
        icon: "",
      };
      this.errorMessage = "";
      if (this.$refs.addForm) {
        this.$refs.addForm.reset();
      }
    },

    async createSocialType() {
      if (!this.$refs.addForm.validate()) return;

      this.loading = true;
      try {
        const response = await axios.post(
          "http://localhost:3000/api/socialtype/create",
          {
            s_type_name: this.newSocialType.s_type_name.trim(),
            icon: this.getIconPreview(this.newSocialType.icon),
          }
        );

        if (response.data.success) {
          await this.fetchData();
          this.closeAddDialog();
          this.showSnackbar("Social type created successfully");
        } else {
          throw new Error(
            response.data.message || "Failed to create social type"
          );
        }
      } catch (error) {
        console.error("Create error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to create social type";
        this.errorMessage = errorMessage;
        this.showSnackbar(errorMessage, "error");
      } finally {
        this.loading = false;
      }
    },

    // Edit methods
    async openEditDialog(item) {
      this.loading = true;
      try {
        const response = await axios.get(
          `http://localhost:3000/api/socialtype/view/${item.social_type_id}`
        );
        const icon = response.data.icon || ""; // Default to empty string if null
        this.editedSocialType = {
          ...response.data,
          icon: icon.startsWith("mdi-") ? icon.replace("mdi-", "") : icon,
        };
        this.editDialog = true;
      } catch (error) {
        this.showSnackbar("Failed to fetch social type details", "error");
        console.error("Edit fetch error:", error);
      } finally {
        this.loading = false;
      }
    },
    closeEditDialog() {
      this.editDialog = false;
      this.editedSocialType = {
        social_type_id: null,
        s_type_name: "",
        icon: "",
      };
    },

    async updateSocialType() {
      if (!this.$refs.editForm.validate()) return;

      this.loading = true;
      try {
        await axios.put(
          `http://localhost:3000/api/socialtype/update/${this.editedSocialType.social_type_id}`,
          {
            s_type_name: this.editedSocialType.s_type_name.trim(),
            icon: this.getIconPreview(this.editedSocialType.icon),
          }
        );
        await this.fetchData();
        this.closeEditDialog();
        this.showSnackbar("Social type updated successfully");
      } catch (error) {
        this.showSnackbar("Failed to update social type", "error");
        console.error("Update error:", error);
      } finally {
        this.loading = false;
      }
    },

    // Delete methods
    confirmDelete(item) {
      this.itemToDelete = item;
      this.deleteDialog = true;
    },

    closeDeleteDialog() {
      this.deleteDialog = false;
      this.itemToDelete = null;
    },

    async deleteItem() {
      if (!this.itemToDelete) return;

      this.loading = true;
      try {
        await axios.put(
          `http://localhost:3000/api/socialtype/del/${this.itemToDelete.social_type_id}`
        );
        await this.fetchData();
        this.showSnackbar("Social type deleted successfully");
      } catch (error) {
        this.showSnackbar("Failed to delete social type", "error");
        console.error("Delete error:", error);
      } finally {
        this.loading = false;
        this.closeDeleteDialog();
      }
    },

    // Icon preview methods
    getIconPreview(icon) {
      if (!icon) return ""; // Early return if icon is null/undefined

      const iconValue = String(icon); // Ensure icon is a string
      return iconValue.startsWith("mdi-") ? iconValue : `mdi-${iconValue}`;
    },

    validateIconPreview(value) {
      if (!value) return; // Early return if value is null/undefined

      const iconValue = String(value); // Ensure value is a string
      if (iconValue.startsWith("mdi-")) {
        if (this.addDialog) {
          this.newSocialType.icon = iconValue.replace("mdi-", "");
        } else {
          this.editedSocialType.icon = iconValue.replace("mdi-", "");
        }
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
.icon-td {
  width: 100px;
  text-align: center;
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
