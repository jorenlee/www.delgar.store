<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-6">
    <div class="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Inventory Dashboard</h1>

      <form class="space-y-5" @submit.prevent="saveProduct">
        <!-- Product Image -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Product Image</label
          >
          <input
            type="file"
            @change="onFileChange"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <!-- Product Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Product Name</label
          >
          <input
            v-model="product.name"
            type="text"
            placeholder="Enter product name"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <!-- Wholesale Price -->
        <div class="flex gap-4">
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Wholesale Price</label
            >
            <input
              v-model.number="product.wholesalePrice"
              type="number"
              placeholder="0.00"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <!-- Retail Price -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Retail Price</label
            >
            <input
              v-model.number="product.retailPrice"
              type="number"
              placeholder="0.00"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Category</label
          >
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

        <!-- Stocks Remaining -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Stocks Remaining</label
          >
          <input
            v-model.number="product.stocks"
            type="number"
            placeholder="Enter stock count"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Save Product
          </button>
        </div>
      </form>

      <!-- Preview -->
      <!-- <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h2 class="font-semibold text-gray-700">Preview Data:</h2>
        <pre class="text-sm text-gray-600">{{ product }}</pre>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import moment from "moment";

const product = ref({
  id: "PID" + moment().valueOf(),
  image: null,
  name: "",
  wholesalePrice: 0,
  retailPrice: 0,
  category: "",
  stocks: 0,
});

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    product.value.image = file;
  }
};

const saveProduct = () => {
  console.log("Product saved:", product.value);
  alert("Product saved successfully!");
};
</script>
