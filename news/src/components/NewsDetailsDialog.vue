<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emitUpdate"
    max-width="800"
    transition="dialog-bottom-transition"
    :persistent="false"
    dir="rtl"
    @click:outside="close"
  >
    <v-card
      v-if="news"
      class="rounded d-flex flex-column"
      style="overflow: hidden; max-height: 90vh; padding: 0;"
    >
      <v-img
        :src="getNewsImage(news)"
        alt="news image" 
        height="320"
        cover
        class="rounded"
        gradient="to bottom, rgba(241,245,249,0.35), rgba(241,245,249,0.2)"
        style="flex-shrink: 0;"
      >
        <template #placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-row>
        </template>
      </v-img>
      <div style="overflow-y: auto; max-height: calc(90vh - 320px); background: #f9fafb;">
        <v-card-title dir="rtl" class="text-h5 font-weight-bold py-4 text-primary">
          <v-icon color="primary" class="ml-2">mdi-newspaper-variant-outline</v-icon>
          {{ news.title }}
        </v-card-title>
        <v-card-subtitle class="pb-2 d-flex align-center" dir="rtl">
          <span>{{ news.publishDate?.slice(0, 10) }}</span>
          <v-icon color="primary" size="18" class="ml-1">mdi-calendar</v-icon>
        </v-card-subtitle>
        <v-divider></v-divider>
        <v-card-text>
          <div dir="rtl" class="text-body-1" style="line-height: 1.7; color: #333;">
            <div
              v-html="news.content"
              style="white-space: pre-wrap; margin-top: 8px;"
            ></div>
          </div>
        </v-card-text>
      </div>
      <v-divider></v-divider>
      <v-card-actions class="justify-end bg-blue-grey-lighten-5">
        <v-btn
          color="primary"
          variant="elevated"
          @click="close"
          min-width="120"
          class="ml-2"
        >
          <v-icon start>mdi-close</v-icon>
          إغلاق
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else class="rounded-xl">
      <v-card-text class="d-flex justify-center align-center" style="height: 200px;">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean,
  news: {
    title: string,
    description: string,
    content: string,
    images: string[],
    publishDate: string,
    slug: string,
    tags: Array<{ name: string; slug: string }>
  } | null
}>();
const emit = defineEmits(['update:modelValue']);

function emitUpdate(val: boolean) {
  emit('update:modelValue', val);
}
function close() {
  emit('update:modelValue', false);
}
function getNewsImage(news: any) {
  return news.images && news.images[0]
    ? `https://api.theecopotamia.com/host/cms/images/xl/${news.images[0]}`
    : '';
}
</script>