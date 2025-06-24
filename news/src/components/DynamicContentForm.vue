<template>
  <div>
    <!-- Loading State -->
    <v-skeleton-loader v-if="state.loading" type="card" class="mb-4" />
    
    <!-- Error State -->
    <v-alert v-else-if="state.error" type="error" class="mb-4">
      {{ state.errorMessage }}
      <v-btn variant="text" color="error" @click="$emit('retry')" class="mt-2">
        إعادة المحاولة
      </v-btn>
    </v-alert>
    
    <!-- Dynamic Form Content -->
    <v-card v-else class="pa-4 mb-4" elevation="3" rounded="lg">
      <v-card-title class="text-h5 font-weight-bold pb-2">
        <v-icon icon="mdi-form-select" class="me-2" color="primary" />
        نموذج المحتوى
      </v-card-title>
      <v-divider class="mb-4" />
      
      <v-row>
        <template v-for="(item, index) in state.schema" :key="item.id">
          <v-col :cols="Number(item.colsNumber) || 12">
            <!-- Field Header -->
            <div class="d-flex align-center mb-1">
              <v-chip
                size="small"
                :color="getFieldColor(item.type || item.component || '')"
                variant="outlined"
                class="me-2"
                prepend-icon="mdi-label-outline"
              >
                {{ getFieldTypeLabel(item.type || item.component || '') }}
              </v-chip>
              <div class="text-caption text-medium-emphasis">{{ item.name?.ar }}</div>
            </div>
            
            <!-- Dynamic Field Component -->
            <DynamicField
              :item="item"
              :formData="state.data"
              @update:modelValue="$emit('update-field', item.slug, $event)"
            />
            
            <div v-if="item.description?.ar" class="text-caption text-grey ps-3 mb-3">
              {{ item.description.ar }}
            </div>
            <v-divider class="mb-6" v-if="index < state.schema.length - 1" />
          </v-col>
        </template>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue';
import type { SchemaItem } from './types/news';
import { VTextField, VTextarea } from 'vuetify/components';

// ==========================================
// INTERFACES
// ==========================================

interface DynamicFormState {
  schema: SchemaItem[];
  loading: boolean;
  error: boolean;
  errorMessage: string;
  data: Record<string, any>;
}

// ==========================================
// PROPS & EMITS
// ==========================================

const props = defineProps<{
  state: DynamicFormState;
}>();

const emit = defineEmits<{
  retry: [];
  'update-field': [slug: string, value: any];
}>();

// ==========================================
// DYNAMIC FIELD COMPONENT
// ==========================================

const DynamicField = defineComponent({
  name: 'DynamicField',
  props: {
    item: {
      type: Object as () => SchemaItem,
      required: true
    },
    formData: {
      type: Object as () => Record<string, any>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const updateValue = (value: any) => {
      emit('update:modelValue', value);
    };

    return () => {
      const fieldType = props.item.component === 'Field' ? props.item.type : props.item.component;
      const currentValue = props.formData[props.item.slug] || '';
      
      // Common field properties
      const commonProps = {
        label: props.item.name?.ar || 'Field',
        modelValue: currentValue,
        'onUpdate:modelValue': updateValue,
        variant: 'outlined',
        color: 'primary',
        density: 'comfortable',
        hideDetails: 'auto',
        class: 'mb-3',
        bgColor: 'grey-lighten-5',
        dir: 'rtl'
      };

      // Render different field types
      switch (fieldType) {
        case 'textarea':
          return h(VTextarea, {
            ...commonProps,
            rows: 3,
            autoGrow: true
          });

        case 'email':
          return h(VTextField, {
            ...commonProps,
            type: 'email',
            prependInnerIcon: 'mdi-email'
          });

        case 'date':
          return h(VTextField, {
            ...commonProps,
            type: 'date',
            prependInnerIcon: 'mdi-calendar'
          });

        case 'unordered-list':
          return h('div', { class: 'border rounded pa-3 mb-3' }, [
            h('div', { class: 'text-caption mb-2 text-grey' }, 'قائمة العناصر'),
            h(VTextField, {
              ...commonProps,
              placeholder: 'أدخل العناصر مفصولة بفواصل',
              hint: 'مثال: عنصر 1, عنصر 2, عنصر 3'
            })
          ]);

        case 'video':
        case 'embed':
        case 'youtube-id':
          return h('div', { class: 'border rounded pa-3 mb-3' }, [
            h('div', { class: 'text-caption mb-2 text-grey' }, getFieldTypeLabel(fieldType)),
            h(VTextField, {
              ...commonProps,
              placeholder: fieldType === 'youtube-id' ? 'معرف الفيديو' : 'رابط الفيديو',
              prependInnerIcon: 'mdi-video'
            })
          ]);

        case 'Editor':
        case 'MultiEditor':
          return h('div', { class: 'border rounded pa-3 mb-3' }, [
            h('div', { class: 'text-caption mb-2 text-grey' }, getFieldTypeLabel(fieldType)),
            h(VTextarea, {
              ...commonProps,
              rows: 5,
              autoGrow: true,
              placeholder: 'محتوى المحرر'
            })
          ]);

        case 'Slider':
          return h('div', { class: 'border rounded pa-3 mb-3' }, [
            h('div', { class: 'text-caption mb-2 text-grey' }, 'معرض الصور'),
            h('div', { class: 'text-body-2 text-grey-darken-1' }, 'سيتم إضافة مكون رفع الصور هنا')
          ]);

        case 'Files':
          return h('div', { class: 'border rounded pa-3 mb-3' }, [
            h('div', { class: 'text-caption mb-2 text-grey' }, 'رفع الملفات'),
            h('div', { class: 'text-body-2 text-grey-darken-1' }, 'سيتم إضافة مكون رفع الملفات هنا')
          ]);

        case 'Table':
          return h('div', { class: 'border rounded pa-3 mb-3' }, [
            h('div', { class: 'text-caption mb-2 text-grey' }, 'جدول البيانات'),
            h('div', { class: 'text-body-2 text-grey-darken-1' }, 'سيتم إضافة مكون الجدول هنا')
          ]);

        default:
          return h(VTextField, commonProps);
      }
    };
  }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getFieldTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'text': 'نص',
    'string': 'نص',
    'textarea': 'نص متعدد الأسطر',
    'email': 'بريد إلكتروني',
    'number': 'رقم',
    'date': 'تاريخ',
    'select': 'قائمة منسدلة',
    'unordered-list': 'قائمة',
    'video': 'رفع فيديو',
    'embed': 'تضمين فيديو',
    'youtube-id': 'معرف يوتيوب',
    'Editor': 'محرر نص',
    'MultiEditor': 'محرر متعدد',
    'Slider': 'معرض صور',
    'Files': 'ملفات',
    'Table': 'جدول'
  };
  return labels[type] || 'حقل';
}

function getFieldColor(type: string): string {
  const colors: Record<string, string> = {
    'text': 'blue',
    'string': 'blue',
    'textarea': 'indigo',
    'email': 'green',
    'number': 'orange',
    'date': 'purple',
    'select': 'teal',
    'unordered-list': 'deep-purple',
    'video': 'red',
    'embed': 'pink',
    'youtube-id': 'red-darken-2',
    'Editor': 'blue-grey',
    'MultiEditor': 'indigo-darken-2',
    'Slider': 'deep-orange',
    'Files': 'amber',
    'Table': 'light-blue'
  };
  return colors[type] || 'grey';
}
</script>

<style scoped>
.v-text-field, .v-textarea, .v-chip { 
  transition: all 0.2s ease-in-out; 
}

.v-card { 
  border-radius: 12px; 
  overflow: hidden; 
}

.v-divider { 
  opacity: 0.6; 
}

/* Dynamic form field styles */
.field-container {
  margin-bottom: 1rem;
}

.field-header {
  margin-bottom: 0.5rem;
}

.field-description {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  opacity: 0.7;
}

/* Border styles for complex fields */
.border {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.rounded {
  border-radius: 4px;
}
</style>