<template>
  <v-container color="#E0E5F2">
    <v-card>
      <v-card-title>
        <v-btn color="secondary" @click="addNewItem">
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
        :items="sortedItems"
        :search="search"
        :loading="loading"
        :items-per-page="15"
        class="elevation-1"
        :sort-by="['impact_num_id']"
        :sort-desc="[false]"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td class="text-center">{{ getSequentialNumber(item) }}</td>
            <td class="img-td">
              <v-img
                :src="item.img || require('@/assets/default.png')"
                :lazy-src="require('@/assets/default.png')"
                max-height="60"
                contain
                @error="() => handleImageError(item)"
              ></v-img>
            </td>
            <td class="img-td">
              <v-img
                :src="item.img_hover || require('@/assets/default.png')"
                :lazy-src="require('@/assets/default.png')"
                max-height="60"
                contain
                @error="() => handleImageError(item)"
              ></v-img>
            </td>
            <td class="title-td">{{ item.num_text }}</td>
            <td class="title-td">
              <div v-html="formatText(item.desc)" class="p-desc"></div>
            </td>
            <td class="action-td">
              <v-btn class="mr-5" text small @click="editItem(item)">
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
          <v-card-text>Are you sure you want to delete this item?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="closeDialog"
              >Cancel</v-btn
            >
            <v-btn color="red darken-1" text @click="deleteItem">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbars remain unchanged -->
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
  components: {},
  data() {
    return {
      search: "",
      loading: true,
      items: [],
      error: null,
      headers: [
        {
          text: "List",
          value: "impact_num_id",
          headerClass: "text-center",
          align: "center",
        },
        {
          text: "Gif",
          value: "img",
          headerClass: "text-center",
          align: "center",
          sortable: false,
        },
        {
          text: "image hover",
          value: "Img_hover",
          headerClass: "text-center",
          align: "center",
          sortable: false,
        },
        { text: "Number of impact", value: "num_text", align: "center" },
        { text: "Description", value: "desc", align: "center" },
        { text: "Actions", value: "actions", sortable: false, align: "center" },
      ],
      dialog: false,
      snackbarSuccess: false,
      snackbarError: false,
      itemToDelete: null,
    };
  },

  computed: {
    sortedItems() {
      return [...this.items].sort((a, b) => a.impact_num_id - b.impact_num_id);
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    getSequentialNumber(item) {
      return (
        this.sortedItems.findIndex(
          (i) => i.impact_num_id === item.impact_num_id
        ) + 1
      );
    },
    formatText(text) {
      return text ? text.replace(/\n/g, "<br>") : "";
    },
    async fetchData() {
      this.loading = true;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/impact/getall",
          {
            timeout: 10000,
          }
        );
        this.items = Array.isArray(response.data)
          ? response.data
          : [response.data];
      } catch (err) {
        console.error("Error fetching data:", err);
        this.error =
          "Failed to fetch list task information: " +
          (err.response?.data?.message || err.message);
      } finally {
        this.loading = false;
      }
    },
    addNewItem() {
      this.$router.push({ name: "ImpactCreate" });
    },
    editItem(item) {
      this.$router.push({
        name: "ImpactEdit",
        params: { id: item.impact_num_id },
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
          `http://localhost:3000/api/impact/del/${this.itemToDelete.impact_num_id}`
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
    handleImageError(item) {
      console.error("Image failed to load for item:", {
        impact_num_id: item.impact_num_id,
        num_text: item.num_text,
        img: item.img,
        img_hover: item.img_hover,
      });

      let correctedUrl = item.img;
      this.$set(item, "img", correctedUrl || require("@/assets/default.png"));
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
  min-width: 75px;
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
  justify-content: center;
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
.p-desc {
  margin-top: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
