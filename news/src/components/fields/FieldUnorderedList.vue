<template>
  <div class="unordered-list-container">
    <v-text-field
      :label="item.name?.ar"
      placeholder="أضف عنصر جديد"
      variant="outlined"
      color="primary"
      density="comfortable"
      hide-details="auto"
      class="mb-2"
      bg-color="grey-lighten-5"
      append-inner-icon="mdi-plus"
      v-model="newItem"
      @click:append-inner="addItem"
      @keyup.enter="addItem"
    />
    
    <v-list v-if="listItems.length" class="bg-grey-lighten-5 rounded-lg mb-3">
      <v-list-item
        v-for="(listItem, index) in listItems"
        :key="index"
        :title="listItem"
        class="list-item"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-circle-small"></v-icon>
        </template>
        <template v-slot:append>
          <v-btn
            icon="mdi-delete-outline"
            variant="text"
            size="small"
            color="red"
            @click="removeItem(index)"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>
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

// Local state
const newItem = ref('');
const listItems = computed({
  get: () => props.formData[props.item.slug] || [],
  set: (value) => emit('update:modelValue', value)
});

// Initialize list if empty
watch(() => props.formData[props.item.slug], (newVal) => {
  if (!newVal) {
    emit('update:modelValue', []);
  }
}, { immediate: true });

// Methods
function addItem() {
  if (!newItem.value.trim()) return;
  
  const items = [...listItems.value, newItem.value.trim()];
  emit('update:modelValue', items);
  newItem.value = '';
}

function removeItem(index) {
  const items = [...listItems.value];
  items.splice(index, 1);
  emit('update:modelValue', items);
}
</script>

<style scoped>
.list-item {
  transition: background-color 0.2s ease;
}
.list-item:hover {
  background-color: #f5f5f5;
}
</style>