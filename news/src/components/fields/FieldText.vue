<template>
  <v-text-field
    :label="item.name?.ar"
    :placeholder="item.description?.ar || ''"
    :required="item.isRequired"
    :model-value="formData[item.slug]"
    @update:model-value="$emit('update:modelValue', $event)"
    variant="outlined"
    color="primary"
    density="comfortable"
    hide-details="auto"
    class="mb-3"
    bg-color="grey-lighten-5"
  />
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