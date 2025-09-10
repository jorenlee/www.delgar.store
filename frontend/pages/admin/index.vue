<script setup>
import { ref } from "vue"
import { onMounted } from "vue"
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js"

Chart.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
)

onMounted(() => {
  // Sales Trend (Line Chart)
  const salesCtx = document.getElementById("salesTrendChart")
  if (salesCtx) {
    new Chart(salesCtx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Sales",
            data: [1200, 1900, 1500, 2200, 1800, 2500, 3000],
            borderColor: "rgb(220, 38, 38)",
            backgroundColor: "rgba(220, 38, 38, 0.3)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
    })
  }

  // Order Status (Doughnut Chart)
  const orderStatusCtx = document.getElementById("orderStatusChart")
  if (orderStatusCtx) {
    new Chart(orderStatusCtx, {
      type: "doughnut",
      data: {
        labels: ["Completed", "Pending", "Cancelled"],
        datasets: [
          {
            data: [65, 25, 10],
            backgroundColor: ["#16a34a", "#eab308", "#dc2626"],
          },
        ],
      },
    })
  }

  // Top Products (Bar Chart)
  const topProductsCtx = document.getElementById("topProductsChart")
  if (topProductsCtx) {
    new Chart(topProductsCtx, {
      type: "bar",
      data: {
        labels: ["Chicken Breast", "Pork Belly", "Tilapia", "Beef Tapa"],
        datasets: [
          {
            label: "Units Sold",
            data: [320, 280, 190, 150],
            backgroundColor: "#dc2626",
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    })
  }
})

const activePage = ref("Dashboard")

const navItems = [
  { name: "Dashboard", icon: "🏠" },
  { name: "Orders", icon: "🛒" },
  { name: "Products", icon: "📦" },
  { name: "Customers", icon: "👥" },
  { name: "Reports", icon: "📊" },
  { name: "Settings", icon: "⚙️" }
]

const orders = [
  { id: 1001, customer: "Juan Dela Cruz", status: "Completed", total: 1240, date: "2025-09-10 10:30 AM" },
  { id: 1002, customer: "Maria Santos", status: "Pending", total: 860, date: "2025-09-10 11:15 AM" },
  { id: 1003, customer: "Pedro Reyes", status: "Cancelled", total: 540, date: "2025-09-09 04:20 PM" }
]

const lowStock = [
  { name: "Frozen Chicken", stock: 8 },
  { name: "Beef Tapa", stock: 5 },
  { name: "Pork Siomai", stock: 2 }
]

const products = [
  { id: 2001, name: "Frozen Chicken", category: "Poultry", stock: 120, retail: 180, wholesale: 160, image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/delgar-to-remove-bg-removebg-preview.png" },
  { id: 2002, name: "Beef Tapa", category: "Beef", stock: 60, retail: 250, wholesale: 220, image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/delgar-to-remove-bg-removebg-preview.png" },
  { id: 2003, name: "Pork Siomai", category: "Pork", stock: 200, retail: 150, wholesale: 130, image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/delgar-to-remove-bg-removebg-preview.png" },
  { id: 2004, name: "Fish Fillet", category: "Seafood", stock: 80, retail: 220, wholesale: 200, image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/delgar-to-remove-bg-removebg-preview.png" }
]

const customers = [
  { id: 3001, name: "Juan Dela Cruz", email: "juan@example.com", phone: "0917-123-4567", avatar: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/delgar-to-remove-bg-removebg-preview.png" },
  { id: 3002, name: "Maria Santos", email: "maria@example.com", phone: "0920-987-6543", avatar: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/delgar-to-remove-bg-removebg-preview.png" },
  { id: 3003, name: "Pedro Reyes", email: "pedro@example.com", phone: "0999-888-7777", avatar: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/delgar-to-remove-bg-removebg-preview.png" },
  { id: 3004, name: "Ana Lopez", email: "ana@example.com", phone: "0935-222-1111", avatar: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/test/delgar-frozen-products/delgar-to-remove-bg-removebg-preview.png" }
]

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
        <!-- Dashboard -->
        <section v-if="activePage === 'Dashboard'">
          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">Total Sales</h3>
              <p class="text-2xl font-bold text-red-600">₱152,340</p>
            </div>
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">Sales Today</h3>
              <p class="text-2xl font-bold text-red-600">₱12,540</p>
            </div>
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">Active Orders</h3>
              <p class="text-2xl font-bold text-red-600">87</p>
            </div>
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">Completed Orders Today</h3>
              <p class="text-2xl font-bold text-red-600">24</p>
            </div>
          </div>

          <!-- More KPIs -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">Pending Orders</h3>
              <p class="text-2xl font-bold text-yellow-600">12</p>
            </div>
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">Cancelled Orders Today</h3>
              <p class="text-2xl font-bold text-gray-600">3</p>
            </div>
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">New Customers Today</h3>
              <p class="text-2xl font-bold text-red-600">5</p>
            </div>
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">Low Stock Items</h3>
              <p class="text-2xl font-bold text-red-600">12</p>
            </div>
          </div>

          <!-- Highlight Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Top Product -->
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="font-semibold text-red-600 mb-4">Top-Selling Product Today</h3>
              <p class="text-xl font-bold">🥟 Pork Siomai</p>
              <p class="text-gray-500">58 packs sold</p>
            </div>

            <!-- Orders in Progress -->
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="font-semibold text-red-600 mb-4">Orders in Progress</h3>
              <p class="text-2xl font-bold text-yellow-600">7</p>
              <p class="text-gray-500">Orders currently waiting for pickup</p>
            </div>
          </div>
        </section>


        <!-- Orders -->
        <section v-if="activePage === 'Orders'">
          <div class="flex justify-between mb-4">
            <h3 class="font-semibold text-red-600">Orders</h3>
            <button class="bg-red-600 text-white px-4 py-2 rounded-lg">+ New Order</button>
          </div>
          <table class="w-full text-sm bg-white rounded-lg border table-fixed">
            <thead>
              <tr class="text-left border-b bg-gray-50">
                <th class="p-2 w-1/6">Order ID</th>
                <th class="p-2 w-1/6">Customer</th>
                <th class="p-2 w-1/6">Status</th>
                <th class="p-2 w-1/6">Total</th>
                <th class="p-2 w-1/6">Date & Time</th>
                <th class="p-2 w-1/6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id" class="border-b hover:bg-gray-50 transition">
                <td class="p-2">#{{ order.id }}</td>
                <td class="p-2">{{ order.customer }}</td>
                <td class="p-2">
                  <span :class="{
                    'text-red-600': order.status === 'Cancelled',
                    'text-yellow-600': order.status === 'Pending',
                    'text-green-600': order.status === 'Completed'
                  }" class="font-medium">
                    {{ order.status }}
                  </span>
                </td>
                <td class="p-2">₱{{ order.total }}</td>
                <td class="p-2 text-gray-600">{{ order.date }}</td>
                <td class="p-2 flex justify-end space-x-4">
                  <button
                    class="px-3 py-1 rounded-full text-black text-s border border-black hover:bg-black hover:text-white transition">
                    View
                  </button>
                  <button
                    class="px-3 py-1 rounded-full text-white text-s bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition">
                    Edit
                  </button>
                  <button
                    class="px-3 py-1 rounded-full text-white text-s bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition">
                    Complete
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

        <!-- Customers -->
        <section v-if="activePage === 'Customers'">
          <div class="flex justify-between mb-4">
            <h3 class="font-semibold text-red-600">Customers</h3>
            <button class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
              + Add Customer
            </button>
          </div>

          <table class="w-full text-sm bg-white rounded-lg border table-fixed">
            <thead>
              <tr class="text-left border-b bg-gray-50">
                <th class="p-2 w-1/12">ID</th>
                <th class="p-2 w-2/12">Avatar</th>
                <th class="p-2 w-2/12">Name</th>
                <th class="p-2 w-3/12">Email</th>
                <th class="p-2 w-2/12">Phone</th>
                <th class="p-2 w-2/12 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="customer in customers" :key="customer.id" class="border-b hover:bg-gray-50 transition">
                <td class="p-2">#{{ customer.id }}</td>
                <td class="p-2">
                  <img :src="customer.avatar" alt="Customer Avatar"
                    class="w-12 h-12 object-cover rounded-full border" />
                </td>
                <td class="p-2">{{ customer.name }}</td>
                <td class="p-2">{{ customer.email }}</td>
                <td class="p-2">{{ customer.phone }}</td>
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

        <!-- Reports -->
        <section v-if="activePage === 'Reports'">
          <h3 class="font-semibold text-red-600 mb-4">Reports</h3>

          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">Sales Today</h3>
              <p class="text-2xl font-bold text-red-600">₱12,450</p>
            </div>
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">Orders Today</h3>
              <p class="text-2xl font-bold text-red-600">34</p>
            </div>
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">Top Product</h3>
              <p class="text-2xl font-bold text-red-600">Chicken Breast</p>
            </div>
            <div class="bg-white p-4 rounded-lg border">
              <h3 class="text-gray-500">Returning Customers</h3>
              <p class="text-2xl font-bold text-red-600">62%</p>
            </div>
          </div>

          <!-- Charts -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Sales Trend -->
            <div class="bg-white p-4 rounded-lg border">
              <h4 class="font-semibold text-gray-700 mb-2">Sales Trend (Last 7 Days)</h4>
              <canvas ref="salesTrendChart"></canvas>
            </div>

            <!-- Order Status -->
            <div class="bg-white p-4 rounded-lg border">
              <h4 class="font-semibold text-gray-700 mb-2">Order Status Distribution</h4>
              <canvas ref="orderStatusChart"></canvas>
            </div>

            <!-- Top Products -->
            <div class="bg-white p-4 rounded-lg border col-span-1 md:col-span-2">
              <h4 class="font-semibold text-gray-700 mb-2">Top Selling Products</h4>
              <canvas ref="topProductsChart"></canvas>
            </div>
          </div>
        </section>


        <!-- Settings -->
        <section v-if="activePage === 'Settings'" class="flex items-center justify-center min-h-[70vh]">
          <div class="bg-white w-full max-w-lg p-8 rounded-lg shadow border">
            <h3 class="font-semibold text-red-600 mb-6 text-xl text-center">Account Settings</h3>

            <form class="space-y-4">
              <!-- Full Name -->
              <div>
                <label class="block text-gray-700 text-sm mb-1">Full Name</label>
                <input type="text" placeholder="Enter your full name"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-gray-700 text-sm mb-1">Email Address</label>
                <input type="email" placeholder="admin@example.com"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" />
              </div>

              <!-- Username -->
              <div>
                <label class="block text-gray-700 text-sm mb-1">Username</label>
                <input type="text" placeholder="admin123"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" />
              </div>

              <!-- Password -->
              <div>
                <label class="block text-gray-700 text-sm mb-1">Password</label>
                <input type="password" placeholder="••••••••"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" />
              </div>

              <!-- Confirm Password -->
              <div>
                <label class="block text-gray-700 text-sm mb-1">Confirm Password</label>
                <input type="password" placeholder="••••••••"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" />
              </div>

              <!-- Save Button -->
              <div class="pt-4 text-center">
                <button type="submit"
                  class="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>
