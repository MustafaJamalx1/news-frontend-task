<template>
  <v-sheet
    class="pa-4 mb-2"
    color="blue-grey-lighten-5"
    elevation="1"
    border
  >
    <v-row class="d-flex align-center" no-gutters>
      
      <v-col cols="12" md="2" class="d-flex align-center">
        <v-text-field
          v-model="localSearch"
          label="بحث"
          prepend-inner-icon="mdi-magnify"
          hide-details
          density="comfortable"
          variant="outlined"
          color="primary"
          class="flex-grow-1"
          clearable
          dir="rtl"
          @input="emitSearch"
        />
      </v-col>
      <v-col cols="12" md="1" class="d-flex align-center">
        <v-select
          v-model="localFilter"
          :items="filterOptions"
          item-title="title"
          item-value="value"
          label="تصفية"
          hide-details
          density="comfortable"
          variant="outlined"
          color="primary"
          class="flex-grow-1"
          @update:model-value="emitFilter"
        />
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="12" md="2" class="d-flex justify-end">
        <v-btn
          color="primary"
          class="ml-2"
          @click="onCreateNews"
        >
          إنشاء خبر
        </v-btn>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  searchQuery: string,
  selectedFilter: string,
  filterOptions: Array<{ title: string, value: string }>
}>();

const emit = defineEmits(['update:searchQuery', 'update:selectedFilter', 'search']);

const localSearch = ref(props.searchQuery);
const localFilter = ref(props.selectedFilter);

const router = useRouter();

watch(() => props.searchQuery, val => localSearch.value = val);
watch(() => props.selectedFilter, val => localFilter.value = val);
function onCreateNews() {
  router.push('/temp-dynamic-form');
}

function emitSearch() {
  emit('update:searchQuery', localSearch.value);
  emit('search', localSearch.value);
}
function emitFilter() {
  emit('update:selectedFilter', localFilter.value);
}
</script>