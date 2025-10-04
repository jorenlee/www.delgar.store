<script setup>
import { ref } from "vue";
import moment from "moment";
import axios from "axios";

// -----------------------------
// Environment-based API URL
// -----------------------------
const isProd = import.meta.env.PROD; // Nuxt automatically sets this
const BASE_URL = isProd
  ? "https://api.techsavvies.space"
  : "http://127.0.0.1:8000";

// -----------------------------
// Navigation items
// -----------------------------
const navItems = [
  { name: "Dashboard", icon: "🏠" },
  { name: "Orders", icon: "🛒" },
  { name: "Products", icon: "📦" },
  { name: "Customers", icon: "👥" },
  { name: "Reports", icon: "📊" },
  { name: "Settings", icon: "⚙️" }
];

// -----------------------------
// Logout
// -----------------------------
const handleLogout = async () => {
  navigateTo("/admin/login");
};

// -----------------------------
// Product form
// -----------------------------
const product = ref({
  product_id: "PID" + moment().valueOf(),
  product_image: [
    {
      name: "N/A",
      url: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/registrar/ImageNotFound.png",
    },
  ],
  product_name: "",
  wholesale_price: "",
  retail_price: "",
  category: "",
  stocks_remaining: "",
});

const selectedFiles = ref([]);
const uploadedFiles = ref([]);
const uploadStatus = ref("");
const fileInput = ref(null);
const loading = ref(false);
const success = ref(null);
const error = ref(null);
const showToast = ref(false);

// -----------------------------
// File upload handlers
// -----------------------------
const handleFileUpload = (event) => {
  if (typeof window === "undefined") return;
  const files = Array.from(event.target.files);
  selectedFiles.value = files;

  if (files.length > 0) {
    const newImages = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    uploadedFiles.value = newImages;
    product.value.product_image = newImages;
  }
};

const uploadFiles = async () => {
  if (typeof window === "undefined" || !selectedFiles.value.length) return [];

  const formData = new FormData();
  selectedFiles.value.forEach(file => formData.append("file", file));

  try {
    uploadStatus.value = "Uploading images...";
    const response = await axios.post(
      `${BASE_URL}/api/delgar/upload/`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    uploadStatus.value = "Upload successful!";
    let uploaded = [];
    if (Array.isArray(response.data)) {
      uploaded = response.data.map(item => ({
        name: item.name || item.file.split("/").pop(),
        url: item.url || item.file,
      }));
    } else {
      uploaded = [{ name: response.data.file.split("/").pop(), url: response.data.file }];
    }

    selectedFiles.value = [];
    if (fileInput.value) fileInput.value.value = "";
    return uploaded;
  } catch (err) {
    uploadStatus.value = "Upload failed: " + err.message;
    console.error("Upload error:", err);
    return [];
  }
};

// -----------------------------
// Save product
// -----------------------------
const saveProduct = async () => {
  loading.value = true;
  success.value = null;
  error.value = null;

  try {
    if (selectedFiles.value.length) {
      const serverImages = await uploadFiles();
      product.value.product_image = serverImages;
    }

    await axios.post(`${BASE_URL}/api/delgar/product/create/`, product.value);

    success.value = "✅ Product saved successfully!";
    showToast.value = true;

    // Cleanup local URLs
    uploadedFiles.value.forEach(file => URL.revokeObjectURL(file.url));

    // Reset form
    product.value = {
      product_id: "PID" + moment().valueOf(),
      product_image: [
        {
          name: "N/A",
          url: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/registrar/ImageNotFound.png",
        },
      ],
      product_name: "",
      wholesale_price: "",
      retail_price: "",
      category: "",
      stocks_remaining: "",
    };
    uploadedFiles.value = [];
    selectedFiles.value = [];
    if (fileInput.value) fileInput.value.value = "";
  } catch (err) {
    error.value = "❌ Failed to save product.";
    showToast.value = true;
    console.error(err);
  } finally {
    loading.value = false;
    setTimeout(() => (showToast.value = false), 3000);
  }
};
</script>





<template>


<div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-gradient-to-t from-red-900 via-red-700 to-rose-950 text-white flex flex-col">
      <div class="p-4 text-2xl font-bold border-b border-red-500">
        Delgar's Frozen Products
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-2">
        <a v-for="item in navItems" :key="item.name" href="#" @click.prevent="activePage = item.name"
          class="flex items-center p-2 rounded-lg hover:bg-red-600 transition"
          :class="{ 'bg-red-800': activePage === item.name }">
          <span class="w-5 h-5 mr-3">{{ item.icon }}</span>
          {{ item.name }}
        </a>
      </nav>

      <!-- Logout Button -->
      <div class="p-4 border-t border-red-500">
        <button @click="handleLogout"
          class="w-full flex items-center justify-center px-4 py-2 bg-black hover:bg-red-600 rounded-lg transition">
          🚪 Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Topbar -->
      <header class="flex items-center justify-end bg-white border-b p-4">
        <div class="flex items-center space-x-4">
          <button class="relative text-red-600">
            <!-- Notifications -->
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">3</span>
            🔔
          </button>
          <!-- Account Icon -->
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/delgar-to-remove-bg-removebg-preview.png"
            alt="User" class="rounded-full w-10 h-10 border" />
        </div>
      </header>

      <!-- Dashboard Content -->
      <main class="flex-1 p-6 overflow-y-auto">

        <!-- Products -->
        <section v-if="activePage === 'Products'">
          <div class="flex justify-between mb-4">
            <h3 class="font-semibold text-red-600">Products</h3>
            <button class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
              + Add Product
            </button>
          </div>

          <table class="w-full text-sm bg-white rounded-lg border table-fixed">
            <thead>
              <tr class="text-left border-b bg-gray-50">
                <th class="p-2 w-1/12">ID</th>
                <th class="p-2 w-2/12">Image</th>
                <th class="p-2 w-2/12">Name</th>
                <th class="p-2 w-2/12">Category</th>
                <th class="p-2 w-1/12">Stock</th>
                <th class="p-2 w-1/12">Retail</th>
                <th class="p-2 w-1/12">Wholesale</th>
                <th class="p-2 w-2/12 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id" class="border-b hover:bg-gray-50 transition">
                <td class="p-2">#{{ product.id }}</td>
                <td class="p-2">
                  <img :src="product.image" alt="Product Image" class="w-12 h-12 object-cover rounded" />
                </td>
                <td class="p-2">{{ product.name }}</td>
                <td class="p-2">{{ product.category }}</td>
                <td class="p-2">{{ product.stock }}</td>
                <td class="p-2">₱{{ product.retail }}</td>
                <td class="p-2">₱{{ product.wholesale }}</td>
                <td class="p-2 flex justify-end space-x-3">
                  <button
                    class="px-3 py-1 rounded-full text-black text-s border border-black hover:bg-black hover:text-white transition">
                    View
                  </button>
                  <button
                    class="px-3 py-1 rounded-full text-white text-s bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition">
                    Edit
                  </button>
                  <button
                    class="px-3 py-1 rounded-full text-white text-s bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>



    <div class="w-full mx-auto bg-white rounded-2xl shadow-lg p-8">

      <form class="space-y-5" @submit.prevent="saveProduct">
        <!-- Product Image -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
          <input
            type="file"
            multiple
            @change="handleFileUpload"
            ref="fileInput"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p v-if="uploadStatus" class="text-xs text-gray-500 mt-1">{{ uploadStatus }}</p>
        </div>

        <!-- Product Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            v-model="product.product_name"
            type="text"
            placeholder="Enter product name"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <!-- Prices -->
        <div class="flex gap-4">
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Wholesale Price</label>
            <input
              v-model="product.wholesale_price"
              type="number"
              placeholder="0.00"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Retail Price</label>
            <input
              v-model="product.retail_price"
              type="number"
              placeholder="0.00"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            v-model="product.category"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select category</option>
            <option>Chicken</option>
            <option>Pork</option>
            <option>Seafood</option>
            <option>Beef</option>
            <option>Others</option>
          </select>
        </div>

        <!-- Stocks -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stocks Remaining</label>
          <input
            v-model="product.stocks_remaining"
            type="number"
            placeholder="Enter stock count"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <!-- Submit -->
        <div class="pt-4">
          <button
            type="submit"
            class="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
          >
            Save Product
          </button>
        </div>
      </form>

      <!-- Toast -->
      <transition name="fade">
        <div
          v-if="showToast"
          class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white"
          :class="success ? 'bg-green-500' : 'bg-red-500'"
        >
          {{ success || error }}
        </div>
      </transition>
    </div>

      </main>
    </div>
  </div>


</template>
