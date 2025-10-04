<template>
  <div class="flex items-center justify-center min-h-screen bg-red-50">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative">
      <!-- Toast -->
      <transition name="fade">
        <div
          v-if="toastMessage"
          :class="[
            'absolute top-2 right-2 px-4 py-2 rounded-lg shadow-lg text-sm text-white',
            toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
          ]"
        >
          {{ toastMessage }}
        </div>
      </transition>

      <!-- Logo / Title -->
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-red-600">Delgar's Frozen Products</h1>
        <p class="text-gray-500">Sign in to manage your store</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input
            type="text"
            v-model="username"
            required
            placeholder="Enter your username"
            class="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-400"
          />
        </div>

        <div>
          <input
            type="password"
            v-model="password"
            required
            placeholder="Enter your password"
            class="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-400"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-gradient-to-r from-red-500 to-red-700
                 hover:from-red-600 hover:via-rose-700 hover:to-red-700
                 text-white py-2 rounded-lg transition">
          Login
        </button>
      </form>

      <!-- Forgot password -->
      <div class="text-center mt-4">
        <a href="#" class="text-sm text-red-600 hover:underline">Forgot password?</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"

const username = ref("")
const password = ref("")
const toastMessage = ref("")
const toastType = ref("success")

const handleLogin = async () => {
  if (username.value === "grace" && password.value === "admin123") {
    showToast("✅ Login successful!", "success")
    setTimeout(() => {
      navigateTo("/dashboard/inventory") // ✅ Nuxt 3/4 navigation
    }, 1000) // give user a moment to see the toast
  } else {
    showToast("❌ Invalid credentials", "error")
  }
}

const showToast = (message, type = "success") => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ""
  }, 3000)
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
