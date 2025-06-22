<template>
  <v-row class="d-flex align-center justify-space-between ma-2 rounded-xl bg-blue-grey-lighten-5">
    <v-col cols="auto" class="pa-0">
      <v-select
        label="عرض"
        :items="[5, 10, 30, 50, 100]"
        :model-value="paginationOptions.itemsPerPage"
        hide-details
        density="comfortable"
        variant="outlined"
        class="ma-0 rounded-xl"
        style="max-width: 90px;"
        @update:model-value="emitSetItemsPerPage"
      />
    </v-col>
    <v-col cols="auto" class="pa-0">
      <v-fade-transition mode="out-in">
        <v-pagination
          dir="rtl"
          v-model="localPage"
          :length="totalPages"
          :total-visible="5"
          @update:model-value="emitPageChange"
          :prev-icon="'mdi-chevron-right'"
          :next-icon="'mdi-chevron-left'"
          :key="localPage"
          color="primary"
          size="small"
          active-color="primary"
          class="pa-0"
        ></v-pagination>
      </v-fade-transition>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  paginationOptions: { page: number; itemsPerPage: number },
  totalPages: number
}>();
const emit = defineEmits(['set-items-per-page', 'page-change']);

const localPage = ref(props.paginationOptions.page);

watch(() => props.paginationOptions.page, val => {
  localPage.value = val;
});

function emitSetItemsPerPage(val: number) {
  emit('set-items-per-page', val);
}
function emitPageChange(val: number) {
  emit('page-change', val);
}
</script>