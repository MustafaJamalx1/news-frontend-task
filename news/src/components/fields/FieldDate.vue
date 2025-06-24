<template>
  <div class="date-field-container">
    <div class="mb-2 text-body-2 primary--text">{{ item.name?.ar }}</div>
    <v-date-picker
      :model-value="formData[item.slug]"
      @update:model-value="$emit('update:modelValue', $event)"
      color="primary"
      class="mb-3 rounded-lg elevation-1"
      :title="item.name?.ar"
      locale="ar"
    />
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  },
  formData: {
    type: Object,
    required: true
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.date-field-container {
  margin-bottom: 16px;
}
</style>