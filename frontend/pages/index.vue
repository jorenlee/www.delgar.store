<script setup>
import moment from "moment";
import { useHead } from "#imports";
import { useRoute, useRouter } from "vue-router";
import { nextTick } from "vue";

const route = useRoute();
const router = useRouter();

useHead({
  title: "Delgar Frozen Products",
  link: [
    {
      rel: "icon",
      type: "image/png",
      href: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/delgar-to-remove-bg-removebg-preview.png", // adjust the path and type as needed
    },
  ],
});

const mainLogo = ref(
  "https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/Delgars%20FB%20Profile.png"
);

//let serverIP = "http://127.0.0.1:8000";

let serverIP = "https://api.techsavvies.space";

let formInput = ref(true);

onMounted(async () => {
  await nextTick();
  await fetchListItems();


  if (!document.getElementById('fb-root')) {
    const fbRoot = document.createElement('div');
    fbRoot.id = 'fb-root';
    document.body.appendChild(fbRoot);
  }
  // startAutoRefresh();
});

const listItems = ref([]);
const isLoading = ref(false);
const originalListItems = ref([]);
const uploadStatus = ref(null);
const fileToUpload = ref(null);

const menuOpen = ref(false);
// Add cart panel state
const isCartOpen = ref(false);
// Add category and option filters
const selectedCategory = ref("All");
const selectedOption = ref("Retail"); // 'All', 'Wholesale', 'Retail'

const categories = ["All", "Chicken", "Pork", "Seafood", "Others", "Beef"];

// Add search functionality
const searchQuery = ref("");
const isHeaderOpen = ref(false);

const isSubmitting = ref(false);

const orderInfo = ref({
  order_id: "OID" + moment().valueOf(),
  fullname: "",
  delivery_address: "",
  contact_email: "",
  contact_number: "",
  products: [
    {
      product_id: "",
      product_image: "",
      product_name: "",
      quantity: "",
      total_amount: "",
      purchase_type: "",
    },
  ],
  system_fee: "0",
  delivery_fee: "0",
  grand_total: "",
  payment_method: "",
  receipt_url: "https://www.delgar.store",
});

const resetOrderData = () => {
  // Reset order info
  orderInfo.value = {
    order_id: "OID" + moment().valueOf(),
    fullname: "",
    delivery_address: "",
    contact_email: "",
    contact_number: "",
    products: [
      {
        product_id: "",
        product_image: "",
        product_name: "",
        quantity: "",
        total_amount: "",
        purchase_type: "",
      },
    ],
    system_fee: "0",
    delivery_fee: "0",
    grand_total: "",
    payment_method: "",
    receipt_url: "",
  };

  // Reset cart quantities for all products
  listItems.value.forEach((product) => {
    product.wholesale_qty = 0;
    product.retail_qty = 0;
    product.selected = false;
  });

  // Reset upload status
  uploadStatus.value = null;
  fileToUpload.value = null;

  // Close cart if open
  isCartOpen.value = false;

  formInput.value = true;
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
};

const startNewOrder = () => {
  resetOrderData();
  // formInput.value = true;
  // document.documentElement.style.overflow = "";
  // document.body.style.overflow = "";
};

const fetchListItems = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch(serverIP + "/api/delgar/product/list").catch(
      (error) => {
        console.error("Fetch error:", error);
        return [];
      }
    );

    // Ensure listItems is always an array
    listItems.value = Array.isArray(response) ? response : [];

    // Reset search state
    // originalListItems.value = [];
    // searchQuery.value = "";
  } catch (error) {
    console.error("Error fetching list items:", error);
    listItems.value = []; // fallback
  } finally {
    isLoading.value = false;
  }
};

const fetchSilently = async () => {
  try {
    const response = await $fetch(serverIP + "/api/delgar/product/list").catch(
      (error) => {
        console.error("Silent fetch error:", error);
        return [];
      }
    );

    // Only update if we get valid data
    if (Array.isArray(response)) {
      // Preserve user interactions (quantities and selections)
      const updatedItems = response.map(newItem => {
        const existingItem = listItems.value.find(item => item.id === newItem.id);
        if (existingItem) {
          // Keep user-modified properties
          return {
            ...newItem,
            wholesale_qty: existingItem.wholesale_qty || 0,
            retail_qty: existingItem.retail_qty || 0,
            selected: existingItem.selected || false
          };
        }
        // New items get default values
        return {
          ...newItem,
          wholesale_qty: 0,
          retail_qty: 0,
          selected: false
        };
      });

      listItems.value = updatedItems;
    }
  } catch (error) {
    console.error("Error in silent fetch:", error);
    // Don't update listItems on error to maintain current state
  }
};

// Auto-refresh interval
let refreshInterval = null;

const startAutoRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(fetchSilently, 1000); // Every 1 second
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Start auto-refresh on mount and stop on unmount
onMounted(async () => {
  await nextTick();
  await fetchListItems();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    uploadStatus.value = {
      success: false,
      message: "Please upload a valid image (JPG, PNG, GIF) or PDF file"
    };
    return;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    uploadStatus.value = {
      success: false,
      message: "File size must be less than 5MB"
    };
    return;
  }

  fileToUpload.value = file;

  try {
    uploadStatus.value = { success: false, message: "Uploading..." };

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(serverIP + "/api/delgar/upload/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result && (result.file || result.filename || result.url)) {
      // Store the full URL or path returned by the server
      const uploadedFile = result.file || result.filename || result.url;
      orderInfo.value.receipt_url = uploadedFile;

      uploadStatus.value = {
        success: true,
        message: "Upload successful! Receipt attached.",
        fileName: file.name
      };
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    uploadStatus.value = {
      success: false,
      message: "Upload failed: " + (error.message || "Network error")
    };

    // Reset file input
    event.target.value = '';
    fileToUpload.value = null;
    orderInfo.value.receipt_url = "";
  }
};

const isFormValid = computed(() => {
  if (!orderInfo.value || !cartTotals.value) {
    return false;
  }

  return (
    orderInfo.value.fullname?.trim() &&
    orderInfo.value.contact_email?.trim() &&
    orderInfo.value.contact_number?.trim() &&
    cartTotals.value.itemCount > 0 &&
    (orderInfo.value.payment_method === "CASH" ||
      orderInfo.value.payment_method === "WALK-IN" ||
      (orderInfo.value.payment_method === "GCash" ||
        orderInfo.value.payment_method === "Bank Transfer") &&
      orderInfo.value.delivery_address?.trim() &&
      orderInfo.value.receipt_url &&
      uploadStatus.value?.success === true)
  );
});



const submitForm = async () => {
  if (isSubmitting.value) return; // Prevent duplicate submissions

  isSubmitting.value = true;
  try {
    await postAPI();
  } finally {
    isSubmitting.value = false;
  }
};

const postAPI = async () => {
  if (!isFormValid.value) return;
  else {
    await $fetch(serverIP + "/api/delgar/order/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: orderInfo.value,
    }).then((response) => {
      formInput.value = false;
      console.log(response);
      submitToGmail();
      // Reset order data after successful submission
      setTimeout(() => {
        resetOrderData();
      }, 10000);
    });
  }
};

const submitToGmail = async () => {
  await $fetch(serverIP + "/api/delgar/thank-you-order/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: orderInfo.value,
  }).then((response) => {
    console.log(response);
  });
};

const toggleHeader = () => {
  isHeaderOpen.value = !isHeaderOpen.value;
};

// Update filtered products with null checks
const filteredProducts = computed(() => {
  if (!listItems.value || !Array.isArray(listItems.value)) {
    return [];
  }

  let filtered = listItems.value;

  // Filter by search query
  if (searchQuery.value && searchQuery.value.trim()) {
    filtered = filtered.filter(
      (item) =>
        item?.product_name
          ?.toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        item?.category?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // Filter by category
  if (selectedCategory.value !== "All") {
    filtered = filtered.filter(
      (item) =>
        item?.category?.toLowerCase() === selectedCategory.value.toLowerCase()
    );
  }

  // Filter by option (wholesale/retail)
  if (selectedOption.value === "Wholesale") {
    filtered = filtered.filter((item) => item?.wholesale_price);
  } else if (selectedOption.value === "Retail") {
    filtered = filtered.filter((item) => item?.retail_price);
  }

  return filtered;
});

// Calculate totals with null checks
const cartTotals = computed(() => {
  if (!listItems.value || !Array.isArray(listItems.value)) {
    return {
      subtotal: 0,
      itemCount: 0,
      items: [],
      systemFee: 0,
      deliveryFee: 0,
      grandTotal: 0,
    };
  }

  let subtotal = 0;
  let itemCount = 0;
  const items = [];

  listItems.value.forEach((product) => {
    if (!product) return;

    // Check if product has any quantities (auto-select)
    const hasWholesale = product.wholesale_qty && product.wholesale_qty > 0;
    const hasRetail = product.retail_qty && product.retail_qty > 0;

    if (hasWholesale || hasRetail) {
      product.selected = true;

      // Wholesale items
      if (hasWholesale) {
        const wholesaleTotal =
          parseFloat(product.wholesale_price || 0) *
          parseInt(product.wholesale_qty || 0);
        subtotal += wholesaleTotal;
        itemCount += parseInt(product.wholesale_qty || 0);
        items.push({
          ...product,
          type: "wholesale",
          quantity: parseInt(product.wholesale_qty || 0),
          price: parseFloat(product.wholesale_price || 0),
          total: wholesaleTotal,
        });
      }

      // Retail items
      if (hasRetail) {
        const retailTotal =
          parseFloat(product.retail_price || 0) *
          parseInt(product.retail_qty || 0);
        subtotal += retailTotal;
        itemCount += parseInt(product.retail_qty || 0);
        items.push({
          ...product,
          type: "retail",
          quantity: parseInt(product.retail_qty || 0),
          price: parseFloat(product.retail_price || 0),
          total: retailTotal,
        });
      }
    } else {
      product.selected = false;
    }
  });

  const systemFee = parseFloat(orderInfo.value?.system_fee || 0);
  const deliveryFee = parseFloat(orderInfo.value?.delivery_fee || 0);
  const grandTotal = subtotal + systemFee + deliveryFee;

  return {
    subtotal,
    itemCount,
    items,
    systemFee,
    deliveryFee,
    grandTotal,
  };
});

// Update orderInfo when cart changes
watch(
  cartTotals,
  (newTotals) => {
    orderInfo.value.grand_total = newTotals.grandTotal.toString();

    // Update products array for API
    orderInfo.value.products = newTotals.items.map((item) => ({
      product_id: (item.id || item.product_id || "").toString(),
      product_image: item.product_image || "",
      product_name: item.product_name || "",
      quantity: item.quantity.toString(),
      total_amount: item.total.toString(),
      purchase_type: item.type || "",
    }));
  },
  { deep: true, immediate: true }
);

// Function to update quantity and selection status
const updateQuantity = (product, type, change) => {
  if (type === "wholesale") {
    const newQty = Math.max(0, (product.wholesale_qty || 0) + change);
    product.wholesale_qty = newQty;
  } else if (type === "retail") {
    const newQty = Math.max(0, (product.retail_qty || 0) + change);
    product.retail_qty = newQty;
  }

  // Mark product as selected if any quantity > 0
  product.selected = product.wholesale_qty > 0 || product.retail_qty > 0;
};

const openCart = () => {
  isCartOpen.value = true;
  // Prevent scrolling on the body when modal is open
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
};

const closeCart = () => {
  isCartOpen.value = false;
  // Restore scrolling on the body when modal is closed
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
};

// Update scroll to checkout function
const scrollToCheckout = () => {
  openCart();
};

//const defaultDeliveryFee = "30"; // use this if you want to restore later

watch(
  () => orderInfo.value.payment_method,
  (newMethod) => {
    if (newMethod === "CASH") {
      orderInfo.value.delivery_fee = "0";
      orderInfo.value.delivery_address = "";
      orderInfo.value.receipt_url = "https://www.delgar.store";
      orderInfo.value.fullname = "";
      orderInfo.value.contact_email = "";
      orderInfo.value.contact_number = "";
    } else if (newMethod === "WALK-IN") {
      orderInfo.value.delivery_fee = "0";
      orderInfo.value.delivery_address = "JP Rizal Avenue, In front of Penshoppe beside Sanbon Enterprises, Purok 4 Carmen Annex, Ozamiz City, Philippines";
      orderInfo.value.receipt_url = "https://www.delgar.store";
      orderInfo.value.fullname = "Delgar Store Admin";
      orderInfo.value.contact_email = "rodrigogarciajr233@gmail.com";
      orderInfo.value.contact_number = "+639978665777";
    } else {
      orderInfo.value.fullname = "";
      orderInfo.value.contact_email = "";
      orderInfo.value.contact_number = "";
      orderInfo.value.delivery_fee = "0";
      orderInfo.value.delivery_address = "";
      orderInfo.value.receipt_url = "";
    }
  }
);
</script>
<template>
  <div>
    <div class="min-h-screen bg-gray-50">
      <div class="overflow-y-auto bg-white w-full">
        <!-- Header Section - Mobile Optimized -->

        <div class="lg:flex w-full px-3 z-10 bg-white rounded-xl shadow-lg lg:h-[90px] fixed">
          <div class="lg:flex lg:w-11/12 w-full mx-auto">
            <!-- Top Row with Logo and Menu Toggle -->
            <div class="flex items-center justify-between lg:w-6/12 relative w-full py-4">
              <!-- Logo -->
              <div class="flex items-center lg:gap-x-5 lg:w-fit w-full">
                <div class="lg:w-14 w-12 mr-2">
                  <img :src="mainLogo" alt="Logo" class="rounded-full border-2 border-[#26aec6] shadow-md w-full" />
                </div>

                <div class="text-xs whitespace-nowrap">
                  🕒
                  <span class="font-semibold whitespace-nowrap">Easy Online Order 24/7</span><br />
                  <i class="ml-1 fa fa-phone"></i> <span>+63 997 866 5777</span><br />
                  <i class="ml-1 fa fa-globe"></i> <span>www.delgar.store</span><br />
                </div>
              </div>

              <div class="lg:ml-32 mr-10">
                <!-- Contact & Cart -->
                <div class="text-sm text-center space-y-2">
                  <!-- Cart Button -->
                  <div class="flex justify-center">
                    <button @click="openCart" v-if="cartTotals.itemCount > 0"
                      class="relative bg-blue-600 text-white px-1 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      <i class="fa fa-shopping-cart mx-1 pr-1"></i>
                      <!-- Your Cart -->
                      <span
                        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {{ cartTotals.itemCount }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Mobile Toggle Button -->
              <button @click="menuOpen = !menuOpen"
                class="lg:hidden text-gray-700 focus:outline-none absolute top-7 right-1">
                <svg v-if="!menuOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Expanded Content -->
            <div :class="menuOpen ? 'block' : 'hidden'" class="lg:flex items-center space-y-4 w-full">
              <!-- Filters -->
              <div class="w-fit mr-0 ml-auto">
                <!-- Categories -->
                <div class="lg:mt-3 mb-3">
                  <h3 class="text-gray-900 text-xs">Categories</h3>
                  <div class="flex flex-wrap gap-2 mt-1 mb-1">
                    <button v-for="category in categories" :key="category" @click="selectedCategory = category" :class="[
                      selectedCategory === category
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                      'px-3 py-1.5 border rounded-full text-xs font-medium transition-colors',
                    ]">
                      {{ category }}
                    </button>
                  </div>

                  <!-- Product Count -->
                  <div class="text-[10px] text-gray-600">
                    Showing {{ filteredProducts.length }} of
                    {{ listItems.length }} products
                  </div>
                </div>

                <div>
                  <!-- Purchase Options -->
                  <!-- <div class="lg:mt-5 mb-5">
                    <h3 class="text-gray-900 text-xs">Purchase Options</h3>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <button
                        @click="selectedOption = 'All'"
                        :class="[
                          selectedOption === 'All'
                            ? 'bg-gray-600 text-white border-gray-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                          'px-3 py-1.5 border rounded-full text-xs font-medium transition-colors',
                        ]"
                      >
                        All Options
                      </button>
                      <button
                        @click="selectedOption = 'Wholesale'"
                        :class="[
                          selectedOption === 'Wholesale'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                          'px-3 py-1.5 border rounded-full text-xs font-medium transition-colors',
                        ]"
                      >
                        🏪 Wholesale
                      </button>
                      <button
                        @click="selectedOption = 'Retail'"
                        :class="[
                          selectedOption === 'Retail'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                          'px-3 py-1.5 border rounded-full text-xs font-medium transition-colors',
                        ]"
                      >
                        🛍️ Retail
                      </button>
                    </div>
                  </div> -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary - Mobile Sticky (Updated) -->
        <div v-if="cartTotals.itemCount > 0"
          class="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 lg:hidden">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="text-center">
                <p class="text-xs text-gray-600">Items</p>
                <p class="text-sm font-bold text-blue-600">
                  {{ cartTotals.itemCount }}
                </p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-600">Total</p>
                <p class="text-sm font-bold text-green-600">
                  ₱{{ cartTotals.grandTotal.toFixed(2) }}
                </p>
              </div>
            </div>
            <button @click="openCart" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              View Cart
            </button>
          </div>
        </div>

        <!-- Main Content Container -->
        <div class="px-3 sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-8 py-4 lg:py-1 lg:mt-[100px] mt-[70px]">
          <!-- Product Grid - Mobile Responsive -->
          <div class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 lg:gap-4 gap-1 mb-10">
            <div v-for="(j, i) in filteredProducts" :key="i"
              class="group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
              :class="{ 'ring-2 ring-blue-500 shadow-lg': j.selected }">
              <!-- Product Image Container -->
              <div class="relative aspect-square overflow-hidden bg-gray-100">
                <img :src="j.product_image" :alt="j.product_name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 border-b" />

                <!-- Status Badge -->
                <div class="absolute top-2 left-2">
                  <span :class="[
                    j.status === 'NA'
                      ? 'bg-red-500 text-white'
                      : 'bg-green-500 text-white',
                    'px-2 py-1 text-xs font-medium rounded-full',
                  ]">
                    {{ j.status === "NA" ? "Out of Stock" : "In Stock" }}
                  </span>
                </div>
              </div>

              <!-- Product Info -->
              <div class="p-2 lg:p-4">
                <div class="mb-3">
                  <p class="text-xs text-[#2f2f2f] mt-1 capitalize font-bold">
                    <i class="fa fa-list-alt"></i> {{ j.category }}
                  </p>
                  <h3 class="text-sm font-semibold text-[#000] line-clamp-2 capitalize leading-0 flex">
                    {{ j.product_name }}
                  </h3>

                </div>

                <div class="flex mb-3 gap-x-2">

                  <button @click="selectedOption = 'Retail'" :class="[
                    selectedOption === 'Retail'
                      ? 'lg:text-xs text-[10px] mt-1 border bg-[#1d782c] text-white py-2 font-bold uppercase lg:px-3 px-1.5 rounded-lg cursor-pointer'
                      : 'lg:text-xs text-[10px] mt-1 border border-[#1d782c] text-[#1d782c] py-2 font-bold uppercase lg:px-3 px-1.5 rounded-lg cursor-pointer',
                  ]">
                    Retail
                  </button>
                  <button class="" @click="selectedOption = 'Wholesale'" :class="[
                    selectedOption === 'Wholesale'
                      ? 'lg:text-xs text-[10px] mt-1 border bg-[#bc2121] text-white py-2 font-bold uppercase lg:px-3 px-1.5 rounded-lg cursor-pointer'
                      : 'lg:text-xs text-[10px] mt-1 border border-[#bc2121] text-[#bc2121] py-2 font-bold uppercase lg:px-3 px-1.5 rounded-lg cursor-pointer',
                  ]">
                    Wholesale
                  </button>

                </div>

                <!-- Pricing Options -->
                <div class="lg:space-y-3 space-y-1" v-if="j.status !== 'NA'">
                  <!-- Retail Option -->
                  <div v-if="
                    j.retail_price &&
                    (selectedOption === 'All' || selectedOption === 'Retail')
                  " class="">
                    <div class="flex items-center justify-between">
                      <div>
                        <span
                          class="text-xs font-medium text-gray-600 uppercase tracking-wide leading-none flex">Retail</span>
                        <p class="text-base lg:text-lg font-bold text-gray-900">
                          ₱{{ j.retail_price }}
                        </p>
                      </div>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="flex items-center justify-between lg:mt-0 mt-3">
                      <span class="text-xs lg:text-sm text-gray-600 lg:flex hidden">Quantity</span>
                      <span class="text-xs lg:text-sm text-gray-600 lg:hidden flex">QTY</span>
                      <div class="flex items-center lg:space-x-2">
                        <button @click="updateQuantity(j, 'retail', -1)"
                          class="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#275418] text-white transition-colors shadow-lg"
                          :disabled="!j.retail_qty">
                          <svg class="w-3 h-3 lg:w-4 lg:h-4 text-black hover:text-white" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                          </svg>
                        </button>

                        <span class="w-8 lg:w-12 text-center font-medium text-gray-900 text-sm lg:text-base">
                          {{ j.retail_qty || 0 }}
                        </span>

                        <button @click="updateQuantity(j, 'retail', 1)"
                          class="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#275418] text-white transition-colors shadow-lg">
                          <svg class="w-3 h-3 lg:w-4 lg:h-4 text-black hover:text-white" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <!-- Wholesale Option -->
                  <div v-if="
                    j.wholesale_price &&
                    (selectedOption === 'All' ||
                      selectedOption === 'Wholesale')
                  " class="">
                    <div class="flex items-center justify-between">
                      <div>
                        <span
                          class="text-xs font-medium text-gray-600 uppercase tracking-wide leading-none flex">Wholesale
                          Per Box</span>
                        <p class="text-base lg:text-lg font-bold text-gray-900">
                          ₱{{ j.wholesale_price }}
                        </p>
                      </div>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="flex items-center justify-between lg:mt-0 mt-3">
                      <span class="text-xs lg:text-sm text-gray-600 lg:flex hidden">Quantity</span>
                      <span class="text-xs lg:text-sm text-gray-600 lg:hidden flex">QTY</span>
                      <div class="flex items-center lg:space-x-2">
                        <button @click="updateQuantity(j, 'wholesale', -1)"
                          class="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#a72828] hover:text-white transition-colors shadow-lg"
                          :disabled="!j.wholesale_qty">
                          <svg class="w-3 h-3 lg:w-4 lg:h-4 text-black hover:text-white" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                          </svg>
                        </button>

                        <span class="w-8 lg:w-12 text-center font-medium text-gray-900 text-sm lg:text-base">
                          {{ j.wholesale_qty || 0 }}
                        </span>

                        <button @click="updateQuantity(j, 'wholesale', 1)"
                          class="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#a72828] hover:text-white transition-colors shadow-lg">
                          <svg class="w-3 h-3 lg:w-4 lg:h-4 text-black hover:text-white" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>


                </div>

                <!-- Add to Cart Indicator -->
                <div @click="openCart" v-if="
                  j.selected &&
                  ((j.wholesale_qty && j.wholesale_qty > 0) ||
                    (j.retail_qty && j.retail_qty > 0))
                "
                  class="cursor-pointer mt-3 bg-blue-600 text-white py-2 lg:px-3 rounded-lg font-medium text-center flex items-center justify-center lg:space-x-2 space-x-1 lg:text-sm text-xs">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Added to Cart</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AdsenseAd />
        <ClientOnly>
          <FacebookChat />
        </ClientOnly>

        <footer class="bg-[#183853] text-white text-xs">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">

              <!-- Footer Logo -->
              <div class="w-20 h-20 shrink-0">
                <img :src="mainLogo" alt="Delgar Logo"
                  class="rounded-full border-2 border-[#26aec6] shadow-md w-full h-full object-cover" />
              </div>

              <!-- Left Info -->
              <div class="flex-1">
                <p class="font-semibold text-sm">
                  © <a href="https://www.delgar.store" class="hover:underline">www.delgar.store</a>
                </p>
                <p class="font-sans flex items-center justify-center md:justify-start mt-2">
                  <i class="fa fa-map-marker mr-2 lg:flex hidden"></i>
                  JP Rizal Avenue, In front of Penshoppe, beside Sanbon Enterprises, Purok 4 Carmen Annex, Ozamiz City
                </p>
                <p class="font-sans flex items-center justify-center md:justify-start mt-2">
                  <i class="fa fa-clock mr-2"></i> 8:00 AM - 6:00 PM
                </p>
              </div>

              <!-- Social Link -->
              <div class="mt-2 md:mt-0">
                <a href="https://www.facebook.com/DelgarFrozenProducts" target="_blank" rel="noopener"
                  class="flex items-center justify-center gap-2 hover:text-[#26aec6] transition">
                  <i class="fab fa-facebook text-xl"></i>
                  <span class="hidden sm:inline">Follow us on Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </footer>





        <!-- Cart Side Panel -->
        <div v-if="isCartOpen" class="fixed inset-0 z-50 overflow-hidden" @click="closeCart">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-all duration-300"></div>

          <!-- Panel -->
          <div
            class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform flex flex-col"
            @click.stop>
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div class="flex items-center space-x-2">
                <i class="fa fa-shopping-cart mr-2"></i>
                <h2 class="text-lg font-semibold text-gray-900">Your Cart</h2>
              </div>
              <button @click="closeCart" class="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto" v-if="formInput">
              <!-- Cart Items -->
              <div class="flex-1 p-4">
                <div v-if="cartTotals.itemCount === 0" class="text-center py-8">
                  <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01">
                    </path>
                  </svg>
                  <p class="text-gray-500">Your cart is empty</p>
                </div>

                <div v-else class="space-y-4">
                  <div v-for="item in cartTotals.items" :key="`${item.id}-${item.type}`"
                    class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img :src="item.product_image" :alt="item.product_name"
                      class="w-12 h-12 object-cover rounded border" />
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-gray-900 truncate capitalize">
                        {{ item.product_name }}
                      </h4>
                      <p class="text-xs text-gray-500 capitalize">
                        {{ item.type }}
                      </p>
                      <p class="text-sm font-semibold text-blue-600">
                        ₱{{ item.price }}
                      </p>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-600">
                        <span class="mx-0.5">x</span>
                        {{ item.quantity }}</span>
                      <button @click="
                        updateQuantity(
                          listItems.find((p) => p.id === item.id),
                          item.type,
                          -item.quantity
                        )
                        " class="p-1 hover:bg-red-100 rounded text-red-500">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                          </path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cart Summary & Checkout -->
              <div v-if="cartTotals.itemCount > 0" class="border-t border-gray-200 p-4 bg-gray-50">
                <!-- Order Summary -->
                <div class="space-y-2 text-sm mb-4">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-medium">₱{{ cartTotals.subtotal.toFixed(2) }}</span>
                  </div>
                  <!--<div class="flex justify-between">
    <span class="text-gray-600">System Fee</span>
    <span class="font-medium"
      >₱{{ cartTotals.systemFee.toFixed(2) }}</span
    >
  </div>-->
                  <!-- <div
    class="flex justify-between"
    v-if="
      orderInfo.payment_method === 'GCash' ||
      orderInfo.payment_method === 'Bank Transfer' ||
      orderInfo.payment_method === 'CASH'
    "
  >
    <span class="text-gray-600">Delivery Fee</span>
    <span class="font-medium"
      >₱{{ cartTotals.deliveryFee.toFixed(2) }}</span
    >
  </div> -->
                  <hr class="border-gray-300">
                  <div class="flex justify-between text-lg font-bold">
                    <span class="text-gray-800">Total</span>
                    <span class="text-green-600">₱{{ cartTotals.grandTotal.toFixed(2) }}</span>
                  </div>
                </div>

                <!-- Customer Information Form -->
                <form class="space-y-3" @submit.prevent="postAPI">
                  <div v-if="
                    orderInfo.payment_method === 'GCash' ||
                    orderInfo.payment_method === 'Bank Transfer' ||
                    orderInfo.payment_method === 'CASH'
                  ">
                    <label class="text-xs block mb-1 font-medium">Full Name <span class="text-red-700">*</span></label>
                    <input
                      class="w-full border border-gray-300 rounded py-1 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
                      type="text" placeholder="Enter your full name" v-model="orderInfo.fullname" required />
                  </div>

                  <div v-if="
                    orderInfo.payment_method === 'GCash' ||
                    orderInfo.payment_method === 'Bank Transfer' ||
                    orderInfo.payment_method === 'CASH'
                  ">
                    <label class="text-xs block mb-1 font-medium">Contact Email <span
                        class="text-red-700">*</span></label>
                    <input
                      class="w-full border border-gray-300 rounded py-1 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="email" placeholder="your@email.com" v-model="orderInfo.contact_email" required />
                  </div>

                  <div v-if="
                    orderInfo.payment_method === 'GCash' ||
                    orderInfo.payment_method === 'Bank Transfer' ||
                    orderInfo.payment_method === 'CASH'
                  ">
                    <label class="text-xs block mb-1 font-medium">Contact Number <span
                        class="text-red-700">*</span></label>
                    <input
                      class="w-full border border-gray-300 rounded py-1 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="tel" placeholder="e.g +639XXXXXXXXX" v-model="orderInfo.contact_number" maxlength="13"
                      required />
                  </div>

                  <!-- Payment Method -->
                  <div>
                    <label class="text-xs block mb-2 font-medium">Payment Method <span
                        class="text-red-700">*</span></label>
                    <div class="grid grid-cols-2 gap-3 text-xs">
                      <!-- GCash Option -->
                      <label for="gcash" class="cursor-pointer block">
                        <div :class="[
                          'bg-[#007DFE] rounded-lg overflow-hidden transition-all duration-200 border-2',
                          orderInfo.payment_method === 'GCash'
                            ? 'border-yellow-400 ring-2 ring-yellow-200 shadow-lg'
                            : 'border-transparent hover:border-blue-300 hover:shadow-md'
                        ]">
                          <div class="lg:p-3 p-2">
                            <div class="flex items-center mb-3">
                              <input id="gcash" type="radio" v-model="orderInfo.payment_method" value="GCash"
                                class="lg:mr-3 mr-1" />
                              <span class="text-white font-semibold whitespace-nowrap lg:text-sm text-xs">
                                GCASH Transfer
                              </span>
                              <!-- Selected Indicator -->
                              <div v-if="orderInfo.payment_method === 'GCash'" class="ml-auto">
                                <i class="fa fa-check-circle text-yellow-400 text-lg"></i>
                              </div>
                            </div>
                            <img
                              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/GCASH.png"
                              class="w-full h-auto mx-auto" style="max-width: 250px" />
                          </div>
                        </div>
                      </label>

                      <!-- Bank Transfer Option -->
                      <label for="bankTransfer" class="cursor-pointer block">
                        <div :class="[
                          'bg-[#B11116] rounded-lg overflow-hidden transition-all duration-200 border-2',
                          orderInfo.payment_method === 'Bank Transfer'
                            ? 'border-yellow-400 ring-2 ring-yellow-200 shadow-lg'
                            : 'border-transparent hover:border-red-300 hover:shadow-md'
                        ]">
                          <div class="lg:p-3 p-2">
                            <div class="flex items-center mb-3">
                              <input id="bankTransfer" type="radio" v-model="orderInfo.payment_method"
                                value="Bank Transfer" class="lg:mr-3 mr-1" />
                              <span class="text-white font-semibold whitespace-nowrap lg:text-sm text-xs">
                                BPI Bank Transfer
                              </span>
                              <!-- Selected Indicator -->
                              <div v-if="orderInfo.payment_method === 'Bank Transfer'" class="ml-auto">
                                <i class="fa fa-check-circle text-yellow-400 text-lg"></i>
                              </div>
                            </div>
                            <img
                              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/BPI.png"
                              class="w-full h-auto mx-auto" style="max-width: 250px" />
                          </div>
                        </div>
                      </label>

                      <!-- Cash for Pick Up  Option -->
                      <label for="cashPaymentMethod" class="cursor-pointer">
                        <div :class="[
                          'bg-[#0d5419] rounded-lg overflow-hidden shadow-lg transition-all duration-200 border-2',
                          orderInfo.payment_method === 'CASH'
                            ? 'border-yellow-400 ring-2 ring-yellow-200 shadow-xl'
                            : 'border-transparent hover:border-green-300 hover:shadow-md'
                        ]">
                          <div class="lg:p-3 p-2">
                            <div class="flex items-center mb-3">
                              <input id="cashPaymentMethod" type="radio" v-model="orderInfo.payment_method" value="CASH"
                                class="lg:mr-3 mr-1" />
                              <span class="text-[#fff] font-semibold whitespace-nowrap lg:text-sm text-xs">
                                CASH
                              </span>
                              <!-- Selected Indicator -->
                              <div v-if="orderInfo.payment_method === 'CASH'" class="ml-auto">
                                <i class="fa fa-check-circle text-yellow-400 text-lg"></i>
                              </div>
                            </div>
                            <div class="p-3 bg-white">
                              <img
                                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/delgar/cashPayment.png"
                                class="w-full h-auto mx-auto" style="max-width: 250px" />
                            </div>
                          </div>
                        </div>
                      </label>


                      <!-- Cash Walk-in Option -->
                      <!-- <label 
      for="walkInPaymentMethod" 
      class="cursor-pointer"
    >
      <div 
        :class="[
          'bg-[#d77825] rounded-lg overflow-hidden shadow-lg transition-all duration-200 border-2',
          orderInfo.payment_method === 'WALK-IN' 
            ? 'border-yellow-400 ring-2 ring-yellow-200 shadow-xl' 
            : 'border-transparent hover:border-green-300 hover:shadow-md'
        ]"
      >
        <div class="lg:p-3 p-2">
          <div class="flex items-center mb-3">
            <input
              id="walkInPaymentMethod"
              type="radio"
              v-model="orderInfo.payment_method"
              value="WALK-IN"
              class="lg:mr-3 mr-1"
            />
            <span class="text-[#fff] font-semibold whitespace-nowrap lg:text-sm text-xs">
              Walk-In Payment
            </span>
        
            <div 
              v-if="orderInfo.payment_method === 'WALK-IN'"
              class="ml-auto"
            >
              <i class="fa fa-check-circle text-yellow-400 text-lg"></i>
            </div>
          </div>
          <div class="p-3 bg-white">
            <img
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/delgar/WalkIn.png"
              class="w-11/12 h-auto mx-auto"
              style="max-width: 250px"
            />
          </div>
        </div>
      </div>
    </label> -->
                    </div>
                  </div>
                  <!-- Receipt Upload - Only show for GCash and Bank Transfer -->
                  <div v-if="
                    orderInfo.payment_method === 'GCash' ||
                    orderInfo.payment_method === 'Bank Transfer'
                  ">
                    <label class="text-xs block mb-1 font-medium">Upload Receipt <span
                        class="text-red-700">*</span></label>
                    <input
                      class="w-full py-2 text-xs border border-gray-300 rounded px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="file" @change="handleFileUpload" accept="image/*,.pdf" />
                    <div v-if="uploadStatus" class="text-xs mt-1" :class="uploadStatus.success ? 'text-green-600' : 'text-red-600'
                      ">
                      {{ uploadStatus.message }}
                    </div>
                  </div>

                  <!-- Delivery Address - Only show for CASH payment -->
                  <div v-if="orderInfo.payment_method === 'WALK-IN'">
                    <label class="text-xs block mb-1 font-medium">Pickup Address</label>
                    <p class="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                      <span class="font-bold">Store Address:</span> JP Rizal
                      Avenue, In front of Penshoppe beside Sanbon Enterprises,
                      Purok 4 Carmen Annex, Ozamiz City, Philippines<br /><br />
                      <span class="font-bold">Store Hours:</span> 8:00 AM - 6:00
                      PM
                    </p>
                  </div>

                  <!-- Delivery Address for other payment methods -->
                  <!-- <div
                    v-if="
                      orderInfo.payment_method === 'CASH' ||
                      orderInfo.payment_method === 'GCash' ||
                      orderInfo.payment_method === 'Bank Transfer'
                    "
                  >
                    <label class="text-xs block mb-1 font-medium"
                      >Delivery Address
                      <span class="text-red-700">*</span></label
                    >
                    <input
                      class="w-full border border-gray-300 rounded py-1 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="text"
                      placeholder="Delivery Address"
                      v-model="orderInfo.delivery_address"
                      required
                    />
                  </div> -->

                  <!-- Delivery Note (visible for GCash or Bank Transfer) -->
                  <div v-if="
                    orderInfo.payment_method === 'GCash' ||
                    orderInfo.payment_method === 'Bank Transfer' ||
                    orderInfo.payment_method === 'CASH'
                  "
                    class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3 text-sm text-red-900 shadow-sm">
                    <!-- <i
                      class="fa-solid fa-truck text-blue-600 text-lg mt-0.5"
                    ></i> -->
                    <i class="fa-solid fa-store text-red-600 text-xl"></i>
                    <p class="font-bold pt-1">
                      <!-- For
                      <span class="font-semibold">same-day delivery</span>
                      within
                      <span class="font-semibold">Ozamiz City Proper</span>. -->
                      Note: Pick-up only is available for now at the store.
                    </p>
                  </div>

                  <!-- Submit Button -->
                  <button @click="submitForm" type="submit" :disabled="!isFormValid || isSubmitting"
                    class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <i v-if="!isSubmitting" class="fa-solid fa-paper-plane text-white text-base"></i>
                    <i v-else class="fa-solid fa-spinner fa-spin text-white text-base"></i>
                    {{ isSubmitting ? 'Placing Order...' : 'Place Order' }}
                  </button>
                </form>
              </div>
            </div>

            <!-- Success Message - Professional Design -->

            <div v-if="!formInput"
              class="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
              <div class="bg-white rounded-2xl shadow-2xl px-3 py-5 text-center max-w-lg w-full border border-gray-100">
                <!-- Success Icon with Animation -->
                <div class="my-8 relative">
                  <div
                    class="w-20 h-20 lg:w-24 lg:h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <i class="fa fa-check-circle text-4xl lg:text-5xl text-green-500"></i>
                  </div>
                  <div
                    class="absolute inset-0 w-20 h-20 lg:w-24 lg:h-24 mx-auto border-4 border-green-200 rounded-full animate-ping opacity-20">
                  </div>
                </div>

                <!-- Order Success Content -->
                <div class="mb-8">
                  <h1 class="lg:text-lg font-bold text-gray-900 mb-4">
                    Order Confirmed!
                  </h1>
                  <div class="space-y-2">
                    <p class="text-gray-700 font-medium">
                      Thank you for choosing Delgar Frozen Products
                    </p>
                    <p class="text-xs text-gray-600 leading-relaxed">
                      Your order has been successfully submitted and is being
                      processed. You will receive a confirmation email with your
                      order details shortly.
                    </p>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <p class="text-sm text-blue-800">
                        <i class="fa fa-info-circle mr-2"></i>
                        <strong>Order ID:</strong> {{ orderInfo.order_id }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-3">
                  <button @click="startNewOrder"
                    class="w-full bg-blue-600 text-white rounded-lg py-2 px-6 font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    <i class="fa fa-shopping-cart mr-2"></i>
                    Place Another Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
