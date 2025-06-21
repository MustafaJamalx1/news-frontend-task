<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emitUpdate"
    max-width="600"
  >
    <v-card class="pa-6 rounded-lg">
      <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center text-primary">
        <v-icon color="primary" class="ml-2">mdi-text-box-outline</v-icon>
        الوصف الكامل
        <v-btn icon @click="close" variant="text">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="text-body-1" style="line-height: 1.7; color: #333;">
        {{ description }}
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean,
  description: string
}>();
const emit = defineEmits(['update:modelValue']);

function emitUpdate(val: boolean) {
  emit('update:modelValue', val);
}
function close() {
  emit('update:modelValue', false);
}
</script>