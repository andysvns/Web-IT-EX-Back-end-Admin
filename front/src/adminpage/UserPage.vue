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
        :items="items"
        :search="search"
        :loading="loading"
        :items-per-page="15"
        class="elevation-1"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td class="text-center">{{ getSequentialNumber(item) }}</td>
            <td class="username-text-td">{{ item.username }}</td>
            <td class="name-text-td">{{ item.name }}</td>
            <td>{{ formatDate(item.created_at) }}</td>
            <td>{{ formatDate(item.updated_at) }}</td>
          </tr>
        </template>
      </v-data-table>




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
          value: "id",
          headerClass: "text-center",
          align: "center",
        },
        {
          text: "User name",
          value: "username",
          headerClass: "text-center",
          align: "center",
          sortable: false,
        },
        {
          text: "Full name",
          value: "name",
          headerClass: "text-center",
          align: "center",
        },
        { text: "Created at", value: "created_at", align: "center" },
        { text: "Updated at", value: "updated_at", align: "center" },
        // { text: "Actions", value: "actions", sortable: false, align: "center" },
      ],

    };
  },
  computed: {
    sortedItems() {
      return [...this.items].sort((a, b) => a.id - b.id);
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    getSequentialNumber(item) {
      return this.sortedItems.findIndex((i) => i.id === item.id) + 1;
    },
    async fetchData() {
      this.loading = true;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/user/getall",
          {
            timeout: 10000, // 10 seconds timeout
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
      this.$router.push({ name: "userCreate" });
    },

    // Opens the dialog and sets the item to delete



    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);

      // Format date as DD MMM YYYY
      const dateFormatted = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // Format time as HH:MM (24-hour format)
      const timeFormatted = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return `${dateFormatted} ${timeFormatted}`;
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
.username-text-td {
  min-width: 150px;
}
.name-text-td {
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
