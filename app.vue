<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

const user = useSupabaseUser()

onMounted(() => {
  console.log("user: ", user.value)
})

</script>

<template>
  <div class="w-full h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster rich-colors />
  </div>
</template>
