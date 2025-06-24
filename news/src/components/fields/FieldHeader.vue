<template>
  <div class="d-flex align-center mb-1">
    <v-chip
      size="small"
      :color="getFieldColor(item.type || item.component)"
      variant="outlined"
      class="me-2"
      prepend-icon="mdi-label-outline"
    >
      {{ getFieldTypeLabel(item.type || item.component) }}
    </v-chip>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  },
  getFieldColor: {
    type: Function,
    required: true
  },
  getFieldTypeLabel: {
    type: Function,
    required: true
  }
});
</script>