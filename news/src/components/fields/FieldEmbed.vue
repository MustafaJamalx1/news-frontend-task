<template>
  <div class="embed-field-container mb-3">
    <v-text-field
      :label="item.name?.ar"
      :placeholder="item.description?.ar || 'أدخل رمز تضمين الفيديو'"
      :required="item.isRequired"
      variant="outlined"
      color="primary"
      density="comfortable"
      prepend-inner-icon="mdi-code-tags"
      hide-details="auto"
      bg-color="grey-lighten-5"
      v-model="embedCode"
      @update:model-value="updateValue"
    />
    
    <v-alert
      v-if="embedCode"
      type="info"
      color="primary"
      class="mt-2 embed-preview"
      variant="tonal"
    >
      <div class="text-caption mb-1">معاينة الفيديو المضمن:</div>
      <div class="embed-container" v-html="embedCode"></div>
    </v-alert>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);
const embedCode = ref(props.formData[props.item.slug] || '');

// Watch for external changes
watch(() => props.formData[props.item.slug], (newVal) => {
  if (newVal !== embedCode.value) {
    embedCode.value = newVal || '';
  }
});

function updateValue(value) {
  emit('update:modelValue', value);
}
</script>

<style scoped>
.embed-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  max-width: 100%;
}
.embed-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.embed-preview {
  max-height: 300px;
  overflow: auto;
}
</style>