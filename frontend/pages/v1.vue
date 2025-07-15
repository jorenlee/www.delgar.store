<script setup>
import moment from "moment";
import { useHead } from "#imports";

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

let serverIP = "http://127.0.0.1:8000";

// let serverIP = "https://api.techsavvies.space";
let formInput = ref(true);

onMounted(async () => {
  await fetchListItems();
  // startAutoRefresh();
});

const listItems = ref([]);

const isLoading = ref(false);
const originalListItems = ref([]);
const searchQuery = ref("");

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
    originalListItems.value = [];
    searchQuery.value = "";
  } catch (error) {
    console.error("Error fetching list items:", error);
    listItems.value = []; // fallback
  } finally {
    isLoading.value = false;
  }
};

const productInfo = ref({
  order_id: "OID" + moment().valueOf(),
  fullname: "",
  address: "-",
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
  system_fee: "20",
  delivery_fee: "50",
  grand_total: "",
  payment_method: "",
  receipt_url: "",
});

const uploadStatus = ref(null);
const fileToUpload = ref(null);

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  fileToUpload.value = file;

  try {
    uploadStatus.value = { success: false, message: "Uploading..." };

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(serverIP + "/api/register/upload/", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      info.value.receipt_url = result.file;
      uploadStatus.value = { success: true, message: "Upload successful!" };
    } else {
      uploadStatus.value = {
        success: false,
        message: "Upload failed: " + (result.detail || "Unknown error"),
      };
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    uploadStatus.value = {
      success: false,
      message: "Upload failed: " + error.message,
    };
  }
};

// Initialize registration fee on component mount
onMounted(() => {
  // calculateRegistrationFee();
});

const phoneNumberError = ref(false);
const validatePhoneNumber = () => {
  const phoneRegex = /^\+639\d{9}$/;
  phoneNumberError.value = !phoneRegex.test(info.value.contact_number);
  if (info.value.contact_number.startsWith("09")) {
    info.value.contact_number = "+63" + info.value.contact_number.substring(1);
  }
};

const isFormValid = computed(() => {
  // return (
  // info.value.fullname &&
  // info.value.birth_date &&
  // info.value.contact_email &&
  // info.value.contact_number &&
  // !phoneNumberError.value &&
  // info.value.tech_level &&
  // info.value.preferred_topics.length > 0 &&
  // info.value.registration_fee &&
  // info.value.payment_method &&
  // info.value.data_privacy_consent &&
  // info.value.receipt_url &&
  // uploadStatus.value?.success === true
  //    );
});

const submitForm = async () => {
  postAPI();
};

const postAPI = async () => {
  if (!isFormValid.value) return;
  else {
    await $fetch(serverIP + "/api/order/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: info.value,
    }).then((response) => {
      formInput.value = false;
      console.log(response);
      submitToGmail();
    });
  }
};

const submitToGmail = async () => {
  await $fetch(serverIP + "/api/order/email/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: info.value,
  }).then((response) => {
    console.log(response);
  });
};

// Add category and option filters
const selectedCategory = ref('All');
const selectedOption = ref('All'); // 'All', 'Wholesale', 'Retail'

const categories = ['All', 'Chicken', 'Pork', 'Seafoods', 'Other', 'Beef'];

// Filter products based on category and option
const filteredProducts = computed(() => {
  let filtered = listItems.value;
  
  // Filter by category
  if (selectedCategory.value !== 'All') {
    filtered = filtered.filter(item => 
      item.category?.toLowerCase() === selectedCategory.value.toLowerCase()
    );
  }
  
  // Filter by option (wholesale/retail)
  if (selectedOption.value === 'Wholesale') {
    filtered = filtered.filter(item => item.wholesale_price);
  } else if (selectedOption.value === 'Retail') {
    filtered = filtered.filter(item => item.retail_price);
  }
  
  return filtered;
});

// Calculate totals
const cartTotals = computed(() => {
  let subtotal = 0;
  let itemCount = 0;
  const items = [];

  listItems.value.forEach(product => {
    // Check if product has any quantities (auto-select)
    const hasWholesale = product.wholesale_qty && product.wholesale_qty > 0;
    const hasRetail = product.retail_qty && product.retail_qty > 0;
    
    if (hasWholesale || hasRetail) {
      product.selected = true;
      
      // Wholesale items
      if (hasWholesale) {
        const wholesaleTotal = parseFloat(product.wholesale_price) * parseInt(product.wholesale_qty);
        subtotal += wholesaleTotal;
        itemCount += parseInt(product.wholesale_qty);
        items.push({
          ...product,
          type: 'wholesale',
          quantity: parseInt(product.wholesale_qty),
          price: parseFloat(product.wholesale_price),
          total: wholesaleTotal
        });
      }
      
      // Retail items
      if (hasRetail) {
        const retailTotal = parseFloat(product.retail_price) * parseInt(product.retail_qty);
        subtotal += retailTotal;
        itemCount += parseInt(product.retail_qty);
        items.push({
          ...product,
          type: 'retail',
          quantity: parseInt(product.retail_qty),
          price: parseFloat(product.retail_price),
          total: retailTotal
        });
      }
    } else {
      product.selected = false;
    }
  });

  const systemFee = parseFloat(productInfo.value.system_fee) || 0;
  const deliveryFee = parseFloat(productInfo.value.delivery_fee) || 0;
  const grandTotal = subtotal + systemFee + deliveryFee;

  return {
    subtotal,
    itemCount,
    items,
    systemFee,
    deliveryFee,
    grandTotal
  };
});

// Update productInfo when cart changes
watch(cartTotals, (newTotals) => {
  productInfo.value.grand_total = newTotals.grandTotal.toString();
  
  // Update products array for API
  productInfo.value.products = newTotals.items.map(item => ({
    product_id: item.id || item.product_id,
    product_image: item.product_image,
    product_name: item.product_name,
    quantity: item.quantity.toString(),
    total_amount: item.total.toString(),
    purchase_type: item.type
  }));
}, { deep: true });

// Function to update quantity and selection status
const updateQuantity = (product, type, change) => {
  if (type === 'wholesale') {
    const newQty = Math.max(0, (product.wholesale_qty || 0) + change);
    product.wholesale_qty = newQty;
  } else if (type === 'retail') {
    const newQty = Math.max(0, (product.retail_qty || 0) + change);
    product.retail_qty = newQty;
  }
  
  // Mark product as selected if any quantity > 0
  product.selected = (product.wholesale_qty > 0) || (product.retail_qty > 0);
};

// Add cart panel state
const isCartOpen = ref(false);

const openCart = () => {
  isCartOpen.value = true;
};

const closeCart = () => {
  isCartOpen.value = false;
};

// Update scroll to checkout function
const scrollToCheckout = () => {
  openCart();
};
</script>
<template>
  <div>
    <div class="min-h-screen bg-gray-50">
      <div class="overflow-y-auto bg-white w-full">
        <!-- Header Section - Mobile Optimized -->
        <div class="w-full px-3 sm:px-6 lg:w-11/12 lg:mx-auto my-4 lg:my-10 bg-white rounded-xl shadow-lg py-4 lg:py-5 flex flex-col lg:flex-row items-center gap-3">
          <!-- Contact Info -->
          <div class="w-full lg:w-6/12 text-center lg:text-right order-2 lg:order-1">
            <p class="text-xs sm:text-sm font-semibold text-gray-800">
              🕒 Easy Online Order 24/7
            </p>
            <p class="text-xs text-gray-600 mt-1 px-2 lg:px-0">
              JP Rizal Avenue, In front of Penshoppe beside Sanbon Enterprises,<br class="hidden sm:block" />
              Purok 4 Carmen Annex, Ozamiz City, Philippines
            </p>
          </div>

          <!-- Logo -->
          <div class="w-16 sm:w-20 lg:w-24 shrink-0 order-1 lg:order-2">
            <img
              :src="mainLogo"
              alt="Logo"
              class="rounded-full border-2 border-[#26aec6] shadow-md w-full"
            />
          </div>

          <!-- Contact Details & Cart Button -->
          <div class="w-full lg:w-6/12 text-center lg:text-left order-3 flex flex-col lg:flex-row items-center justify-between">
            <div>
              <p class="text-xs sm:text-sm font-semibold text-gray-800">
                📞 Contact Us
              </p>
              <p class="text-xs text-gray-600 mt-1">
                Phone: +63 997 866 5777<br />
                Website: www.delgar.store
              </p>
            </div>
            
            <!-- Cart Button -->
            <button 
              @click="openCart"
              v-if="cartTotals.itemCount > 0"
              class="relative bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-3 lg:mt-0"
            >
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"></path>
              </svg>
              Your Cart
              <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {{ cartTotals.itemCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Order Summary - Mobile Sticky (Updated) -->
        <div v-if="cartTotals.itemCount > 0" class="sticky top-0 z-10 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 lg:hidden">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="text-center">
                <p class="text-xs text-gray-600">Items</p>
                <p class="text-sm font-bold text-blue-600">{{ cartTotals.itemCount }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-600">Total</p>
                <p class="text-sm font-bold text-green-600">₱{{ cartTotals.grandTotal.toFixed(2) }}</p>
              </div>
            </div>
            <button 
              @click="openCart"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              View Cart
            </button>
          </div>
        </div>

        <!-- Main Content Container -->
        <div class="px-3 sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-8 py-4 lg:py-8">
          <!-- Header Section -->
          <div class="text-center mb-8 lg:mb-12">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
            <p class="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Premium frozen products for wholesale and retail. Fresh quality guaranteed.
            </p>
          </div>

          <!-- Filter Section - Mobile Optimized -->
          <div class="mb-6 lg:mb-8 space-y-4 lg:space-y-6">
            <!-- Category Filters -->
            <div>
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Categories</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="category in categories"
                  :key="category"
                  @click="selectedCategory = category"
                  :class="[
                    selectedCategory === category
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                    'px-3 py-2 border rounded-full text-xs sm:text-sm font-medium transition-colors'
                  ]"
                >
                  {{ category }}
                </button>
              </div>
            </div>

            <!-- Option Filters -->
            <div>
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Purchase Options</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  @click="selectedOption = 'All'"
                  :class="[
                    selectedOption === 'All'
                      ? 'bg-gray-600 text-white border-gray-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                    'px-3 py-2 border rounded-full text-xs sm:text-sm font-medium transition-colors'
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
                    'px-3 py-2 border rounded-full text-xs sm:text-sm font-medium transition-colors'
                  ]"
                >
                  <span class="hidden sm:inline">🏪 </span>Wholesale
                </button>
                <button
                  @click="selectedOption = 'Retail'"
                  :class="[
                    selectedOption === 'Retail'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                    'px-3 py-2 border rounded-full text-xs sm:text-sm font-medium transition-colors'
                  ]"
                >
                  <span class="hidden sm:inline">🛍️ </span>Retail
                </button>
              </div>
            </div>

            <!-- Results Count -->
            <div class="text-xs sm:text-sm text-gray-600">
              Showing {{ filteredProducts.length }} of {{ listItems.length }} products
            </div>
          </div>

          <!-- Product Grid - Mobile Responsive -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            <div
              v-for="(j, i) in filteredProducts"
              :key="i"
              class="group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
              :class="{ 'ring-2 ring-blue-500 shadow-lg': j.selected }"
            >
              <!-- Product Image Container -->
              <div class="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  :src="j.product_image"
                  :alt="j.product_name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                <!-- Status Badge -->
                <div class="absolute top-2 left-2">
                  <span
                    :class="[
                      j.status === 'NA' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-green-500 text-white',
                      'px-2 py-1 text-xs font-medium rounded-full'
                    ]"
                  >
                    {{ j.status === "NA" ? "Out of Stock" : "In Stock" }}
                  </span>
                </div>
              </div>

              <!-- Product Info -->
              <div class="p-3 lg:p-4">
                <div class="mb-3">
                  <h3 class="text-sm lg:text-base font-semibold text-gray-900 line-clamp-2">
                    {{ j.product_name }}
                  </h3>
                  <p class="text-xs text-gray-500 mt-1 capitalize">{{ j.category }}</p>
                </div>

                <!-- Pricing Options -->
                <div class="space-y-3">
                  <!-- Wholesale Option -->
                  <div 
                    v-if="j.wholesale_price && (selectedOption === 'All' || selectedOption === 'Wholesale')" 
                    class="border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <div>
                        <span class="text-xs font-medium text-gray-600 uppercase tracking-wide">Wholesale</span>
                        <p class="text-base lg:text-lg font-bold text-gray-900">₱{{ j.wholesale_price }}</p>
                      </div>
                    </div>
                    
                    <!-- Quantity Controls -->
                    <div class="flex items-center justify-between">
                      <span class="text-xs lg:text-sm text-gray-600">Quantity</span>
                      <div class="flex items-center space-x-2">
                        <button 
                          @click="updateQuantity(j, 'wholesale', -1)"
                          class="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          :disabled="!j.wholesale_qty"
                        >
                          <svg class="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                          </svg>
                        </button>
                        
                        <span class="w-8 lg:w-12 text-center font-medium text-gray-900 text-sm lg:text-base">
                          {{ j.wholesale_qty || 0 }}
                        </span>
                        
                        <button 
                          @click="updateQuantity(j, 'wholesale', 1)"
                          class="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <svg class="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Retail Option -->
                  <div 
                    v-if="j.retail_price && (selectedOption === 'All' || selectedOption === 'Retail')" 
                    class="border border-gray-200 rounded-lg p-3 bg-blue-50"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <div>
                        <span class="text-xs font-medium text-blue-600 uppercase tracking-wide">Retail</span>
                        <p class="text-base lg:text-lg font-bold text-gray-900">₱{{ j.retail_price }}</p>
                      </div>
                    </div>
                    
                    <!-- Quantity Controls -->
                    <div class="flex items-center justify-between">
                      <span class="text-xs lg:text-sm text-gray-600">Quantity</span>
                      <div class="flex items-center space-x-2">
                        <button 
                          @click="updateQuantity(j, 'retail', -1)"
                          class="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          :disabled="!j.retail_qty"
                        >
                          <svg class="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                          </svg>
                        </button>
                        
                        <span class="w-8 lg:w-12 text-center font-medium text-gray-900 text-sm lg:text-base">
                          {{ j.retail_qty || 0 }}
                        </span>
                        
                        <button 
                          @click="updateQuantity(j, 'retail', 1)"
                          class="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <svg class="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Add to Cart Indicator -->
                <div 
                  v-if="j.selected && ((j.wholesale_qty && j.wholesale_qty > 0) || (j.retail_qty && j.retail_qty > 0))"
                  class="mt-3 bg-blue-600 text-white py-2 px-3 rounded-lg font-medium text-center flex items-center justify-center space-x-2 text-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Added to Cart</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Side Panel -->
        <div 
          v-if="isCartOpen" 
          class="fixed inset-0 z-50 overflow-hidden"
          @click="closeCart"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          
          <!-- Panel -->
          <div 
            class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"></path>
                </svg>
                <h2 class="text-lg font-semibold text-gray-900">Your Cart</h2>
              </div>
              <button 
                @click="closeCart"
                class="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Cart Items -->
            <div class="flex-1 overflow-y-auto p-4">
              <div v-if="cartTotals.itemCount === 0" class="text-center py-8">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"></path>
                </svg>
                <p class="text-gray-500">Your cart is empty</p>
              </div>

              <div v-else class="space-y-4">
                <div 
                  v-for="item in cartTotals.items" 
                  :key="`${item.id}-${item.type}`"
                  class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <img 
                    :src="item.product_image" 
                    :alt="item.product_name"
                    class="w-12 h-12 object-cover rounded"
                  />
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 truncate">{{ item.product_name }}</h4>
                    <p class="text-xs text-gray-500 capitalize">{{ item.type }}</p>
                    <p class="text-sm font-semibold text-blue-600">₱{{ item.price }}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-600">{{ item.quantity }}</span>
                    <button 
                      @click="updateQuantity(listItems.find(p => p.id === item.id), item.type, -item.quantity)"
                      class="p-1 hover:bg-red-100 rounded text-red-500"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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
                <div class="flex justify-between">
                  <span class="text-gray-600">System Fee</span>
                  <span class="font-medium">₱{{ cartTotals.systemFee.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Delivery Fee</span>
                  <span class="font-medium">₱{{ cartTotals.deliveryFee.toFixed(2) }}</span>
                </div>
                <hr class="border-gray-300">
                <div class="flex justify-between text-lg font-bold">
                  <span class="text-gray-800">Total</span>
                  <span class="text-green-600">₱{{ cartTotals.grandTotal.toFixed(2) }}</span>
                </div>
              </div>

              <!-- Customer Information Form -->
              <form class="space-y-3" @submit.prevent="postAPI">
                <div>
                  <label class="text-xs block mb-1 font-medium">Full Name *</label>
                  <input
                    class="w-full border border-gray-300 rounded py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="text"
                    placeholder="Enter your full name"
                    v-model="productInfo.fullname"
                    required
                  />
                </div>

                <div>
                  <label class="text-xs block mb-1 font-medium">Contact Email *</label>
                  <input
                    class="w-full border border-gray-300 rounded py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="email"
                    placeholder="your@email.com"
                    v-model="productInfo.contact_email"
                    required
                  />
                </div>

                <div>
                  <label class="text-xs block mb-1 font-medium">Contact Number *</label>
                  <input
                    class="w-full border border-gray-300 rounded py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="tel"
                    placeholder="e.g +639XXXXXXXXX"
                    v-model="productInfo.contact_number"
                    @input="validatePhoneNumber"
                    :class="{ 'border-red-500': phoneNumberError }"
                    maxlength="13"
                    required
                  />
                </div>

                <!-- Payment Method -->
                <div>
                  <label class="text-xs block mb-2 font-medium">Payment Method *</label>
                  <div class="space-y-2">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        v-model="productInfo.payment_method"
                        value="GCash"
                        class="text-blue-600"
                      />
                      <span class="text-sm">GCash Transfer</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        v-model="productInfo.payment_method"
                        value="Bank Transfer"
                        class="text-blue-600"
                      />
                      <span class="text-sm">BPI Bank Transfer</span>
                    </label>
                  </div>
                </div>

                <!-- Receipt Upload -->
                <div>
                  <label class="text-xs block mb-1 font-medium">Upload Receipt *</label>
                  <input
                    class="w-full py-2 text-xs border border-gray-300 rounded px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="file"
                    @change="handleFileUpload"
                    accept="image/*,.pdf"
                    required
                  />
                  <div
                    v-if="uploadStatus"
                    class="text-xs mt-1"
                    :class="uploadStatus.success ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ uploadStatus.message }}
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Place Order
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Success Message - Mobile Optimized -->
        <div v-if="!formInput" class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div class="bg-white rounded-xl shadow-lg p-6 lg:p-10 text-center max-w-md w-full">
            <div class="mb-6">
              <i class="fa fa-check-circle text-5xl lg:text-6xl text-green-500"></i>
            </div>
            <h1 class="text-xl lg:text-3xl font-bold text-gray-900 mb-4">
              Order Submitted!
            </h1>
            <p class="text-gray-600 mb-2">Thank you for your order.</p>
            <p class="text-sm text-gray-500 italic mb-6">
              Please check your email for confirmation.
            </p>
            <a
              href="/"
              class="inline-block bg-blue-600 text-white rounded-lg py-3 px-6 font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
