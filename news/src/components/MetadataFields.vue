<template>
  <div class="metadata-fields">
    <!-- News Type -->
    <v-select
      v-model="form.selectedFilter"
      :items="options.filterOptions"
      item-title="title"
      item-value="value"
      label="نوع الخبر"
      variant="outlined"
      color="primary"
      density="compact"
      prepend-inner-icon="mdi-filter-variant"
      dir="rtl"
      class="pb-1"
    />
    
    <!-- Tags/Categories -->
    <v-select
      v-if="options.tags.length"
      v-model="form.selectedTags"
      :items="options.tags"
      item-title="title"
      item-value="value"
      label="التصنيف"
      variant="outlined"
      color="primary"
      density="compact"
      prepend-inner-icon="mdi-tag-multiple"
      dir="rtl"
      class="pb-1"
      :loading="loading.isTagsLoading"
      multiple
      chips
      closable-chips
      return-object
      @click:menu="$emit('load-tags')"
    />
    
    <!-- Content Status -->
    <v-select
      v-model="form.selectedStatus"
      :items="options.statusOptions"
      item-title="title"
      item-value="value"
      label="حالة الخبر"
      required
      variant="outlined"
      color="primary"
      density="compact"
      prepend-inner-icon="mdi-check-circle-outline"
      dir="rtl"
      class="pb-1"
      :loading="loading.isStatusLoading"
    />
    
    <!-- Decisions -->
    <v-select
      v-if="options.decisions.length"
      v-model="form.selectedDecision"
      :items="options.decisions"
      item-title="title"
      item-value="value"
      label="القرار"
      variant="outlined"
      color="primary"
      density="compact"
      prepend-inner-icon="mdi-tag-multiple"
      dir="rtl"
      class="pb-1"
      multiple
      chips
      closable-chips
      return-object
      :loading="loading.isDecisionsLoading"
    />
  </div>
</template>

<script setup lang="ts">
import type { TagItem } from '../types/news';

// ==========================================
// INTERFACES
// ==========================================

interface MetadataForm {
  title: string;
  description: string;
  content: string;
  selectedFilter: string;
  selectedTags: TagItem[];
  selectedStatus: string;
  selectedDecision: TagItem[];
}

interface DropdownOptions {
  filterOptions: TagItem[];
  tags: TagItem[];
  statusOptions: TagItem[];
  decisions: TagItem[];
}

interface LoadingStates {
  isTagsLoading: boolean;
  isStatusLoading: boolean;
  isDecisionsLoading: boolean;
}

// ==========================================
// PROPS & EMITS
// ==========================================

defineProps<{
  form: MetadataForm;
  options: DropdownOptions;
  loading: LoadingStates;
}>();

defineEmits<{
  'load-tags': [];
}>();
</script>

<style scoped>
.metadata-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.v-select {
  margin-bottom: 0.5rem;
}

/* RTL specific styles */
.v-field__input {
  direction: rtl;
}

.v-chip {
  direction: rtl;
}
</style>