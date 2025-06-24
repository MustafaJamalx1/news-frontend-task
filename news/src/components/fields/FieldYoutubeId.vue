news frontend task\news\src\components\fields\FieldYoutubeId.vue
<template>
  <div class="youtube-field-container mb-3">
    <v-text-field
      :label="item.name?.ar"
      :placeholder="item.description?.ar || 'أدخل معرف فيديو يوتيوب'"
      :required="item.isRequired"
      variant="outlined"
      color="primary"
      density="comfortable"
      prepend-inner-icon="mdi-youtube"
      hide-details="auto"
      bg-color="grey-lighten-5"
      v-model="youtubeId"
      @update:model-value="updateValue"
    />
    
    <div v-if="youtubeId" class="mt-2 youtube-preview">
      <div class="text-caption mb-1 text-primary">معاينة الفيديو:</div>
      <v-card class="pa-2">
        <div class="youtube-container">
          <iframe 
            width="100%" 
            height="250" 
            :src="`https://www.youtube.com/embed/${youtubeId}`" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
      </v-card>
    </div>
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
const youtubeId = ref(props.formData[props.item.slug] || '');

// Watch for external changes
watch(() => props.formData[props.item.slug], (newVal) => {
  if (newVal !== youtubeId.value) {
    youtubeId.value = newVal || '';
  }
});

function updateValue(value) {
  emit('update:modelValue', value);
}
</script>

<style scoped>
.youtube-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  max-width: 100%;
}
.youtube-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>