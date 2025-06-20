<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <div class="w-full h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster rich-colors />
  </div>
</template>
