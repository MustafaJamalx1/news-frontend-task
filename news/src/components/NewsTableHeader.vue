<template>
  <tr>
    <th class="text-center font-weight-bold" style="font-size: 1.1rem; background: #e3f2fd;">العنوان</th>
    <th class="text-center font-weight-bold" style="font-size: 1.1rem; background: #e3f2fd;">الوصف</th>
    <th class="text-center font-weight-bold" style="font-size: 1.1rem; background: #e3f2fd;">الوسوم</th>
    <th
      class="text-center font-weight-bold d-flex align-center justify-center"
      style="font-size: 1.1rem; background: #e3f2fd; cursor:pointer;"
      @click="$emit('toggle-publish-date-sort')"
    >
      <span>تاريخ النشر</span>
      <v-icon v-if="sortBy === 'asc'" size="18" color="primary" class="ml-1">mdi-arrow-up</v-icon>
      <v-icon v-else-if="sortBy === 'desc'" size="18" color="primary" class="ml-1">mdi-arrow-down</v-icon>
    </th>
  </tr>
</template>

<script setup lang="ts">
const props = defineProps<{
  sortBy: 'asc' | 'desc' | ''
}>();
const emit = defineEmits(['toggle-publish-date-sort']);
</script>