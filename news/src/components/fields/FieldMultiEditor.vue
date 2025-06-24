<template>
  <div class="mb-3">
    <v-expansion-panels variant="popout">
      <v-expansion-panel
        v-for="(content, index) in contents"
        :key="index"
        :title="content.title?.ar || 'عنوان جديد'"
      >
        <v-expansion-panel-text>
          <div class="mb-3">
            <v-text-field
              label="العنوان"
              variant="outlined"
              color="primary"
              density="comfortable"
              hide-details="auto"
              bg-color="grey-lighten-5"
              v-model="content.title.ar"
              @update:model-value="updateContent"
            />
          </div>
          <v-textarea
            :placeholder="'أدخل المحتوى...'"
            variant="outlined"
            color="primary"
            rows="6"
            auto-grow
            hide-details="auto"
            bg-color="grey-lighten-5"
            v-model="content.content.ar"
            @update:model-value="updateContent"
          />
          
          <div class="d-flex justify-end mt-2">
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="red"
              @click.stop="removeSection(index)"
              v-if="contents.length > 1"
            ></v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    
    <v-btn
      class="mt-2"
      prepend-icon="mdi-plus"
      variant="text"
      size="small"
      color="primary"
      @click="addSection"
    >
      إضافة قسم جديد
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

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

// Initialize contents from form data or from item
const contents = computed({
  get: () => {
    if (Array.isArray(props.formData[props.item.slug])) {
      return props.formData[props.item.slug];
    }
    return props.item.contents || [{
      id: 1,
      component: "MultiEditorCard",
      title: { ar: "عنوان جديد", kr: "", en: "" },
      content: { ar: "", kr: "", en: "" }
    }];
  },
  set: (value) => {
    emit('update:modelValue', value);
  }
});

// Initialize if needed
watch(() => props.item, () => {
  if (!props.formData[props.item.slug]) {
    emit('update:modelValue', [...contents.value]);
  }
}, { immediate: true });

// Methods
function addSection() {
  const newContents = [...contents.value];
  newContents.push({
    id: Date.now(), // Use timestamp as unique ID
    component: "MultiEditorCard",
    title: { ar: "عنوان جديد", kr: "", en: "" },
    content: { ar: "", kr: "", en: "" }
  });
  emit('update:modelValue', newContents);
}

function removeSection(index) {
  const newContents = [...contents.value];
  newContents.splice(index, 1);
  emit('update:modelValue', newContents);
}

function updateContent() {
  emit('update:modelValue', [...contents.value]);
}
</script>