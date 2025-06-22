<script setup lang="ts">
import { Navbar } from '#components';
</script>

<template>
    <div class="w-full h-full">
        <header>
            <Navbar />
        </header>
        <main class="w-full h-[calc(100%-4rem)]">
            <NuxtPage />
        </main>
    </div>
</template>