<script setup lang="ts">
import { CircleCheckBig, Clock, User, GitPullRequestArrow } from 'lucide-vue-next'

const completed = ref(0)
const inProgress = ref(0)
const inReview = ref(0)
const assigned = ref(0)
</script>

<template>
    <div class="w-full flex flex-row gap-6 justify-evenly px-4">
        <Card class="w-full">
            <CardHeader class="flex flex-row gap-4 items-center my-auto">
                <Clock class="w-10 h-10 text-yellow-500"/>
                <div>
                    <CardTitle class="text-3xl">{{ inProgress }}</CardTitle>
                    <CardDescription>
                        Tasks In Progress
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
        <Card class="w-full">
            <CardHeader class="flex flex-row gap-4 items-center my-auto">
                <GitPullRequestArrow class="w-10 h-10 text-purple-900"/>
                <div>
                    <CardTitle class="text-3xl">{{ inReview }}</CardTitle>
                    <CardDescription>
                        Tasks In Review
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
        <Card class="w-full">
            <CardHeader class="flex flex-row gap-4 items-center my-auto">
                <CircleCheckBig class="w-10 h-10 text-green-700"/>
                <div>
                    <CardTitle class="text-3xl">{{ completed }}</CardTitle>
                    <CardDescription>
                        Completed Tasks
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
        <Card class="w-full">
            <CardHeader class="flex flex-row gap-4 items-center my-auto">
                <User class="w-10 h-10 text-blue-600"/>
                <div>
                    <CardTitle class="text-3xl">{{ assigned }}</CardTitle>
                    <CardDescription>
                        Tasks Assigned to You
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
    </div>
</template>