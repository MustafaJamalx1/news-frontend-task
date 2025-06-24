\ALMuraba\Desktop\news frontend task\news\src\components\fields\FieldEditor.vue
<template>
  <div class="mb-3">
    <v-card class="editor-container pa-2 bg-grey-lighten-5">
      <div class="d-flex align-center mb-2">
        <v-icon icon="mdi-format-text" class="me-2" color="primary"></v-icon>
        <div class="text-body-1">{{ item.name?.ar }}</div>
      </div>
      <v-textarea
        :placeholder="item.description?.ar || 'أدخل المحتوى...'"
        :required="item.isRequired"
        variant="outlined"
        color="primary"
        rows="10"
        auto-grow
        density="comfortable"
        hide-details="auto"
        bg-color="white"
        class="editor-textarea"
        v-model="editorContent"
        @update:model-value="updateValue"
      />
      <div class="d-flex text-caption text-grey mt-1">
        <v-icon icon="mdi-information-outline" size="small" class="me-1"></v-icon>
        محرر النص الغني سيظهر هنا في النسخة النهائية
      </div>
    </v-card>
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
const editorContent = ref(props.formData[props.item.slug] || '');

// Watch for external changes
watch(() => props.formData[props.item.slug], (newVal) => {
  if (newVal !== editorContent.value) {
    editorContent.value = newVal || '';
  }
});

function updateValue(value) {
  emit('update:modelValue', value);
}
</script>

<style scoped>
.editor-container {
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px;
}
.editor-textarea {
  font-family: 'Roboto Mono', monospace;
}
</style>