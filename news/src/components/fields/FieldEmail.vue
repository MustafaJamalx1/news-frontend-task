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
    type="email"
    prepend-inner-icon="mdi-email-outline"
    hide-details="auto"
    class="mb-3"
    bg-color="grey-lighten-5"
    :rules="emailRules"
  />
</template>

<script setup>
import { ref } from 'vue';

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

// Email validation rules
const emailRules = [
  v => !v || /.+@.+\..+/.test(v) || 'البريد الإلكتروني غير صحيح'
];
</script>