aba\Desktop\news frontend task\news\src\components\fields\FieldTable.vue
<template>
  <v-card class="pa-3 bg-grey-lighten-5 mb-3">
    <div class="d-flex align-center mb-2">
      <v-icon icon="mdi-table" class="me-2" color="primary"></v-icon>
      <div class="text-body-1">{{ item.name?.ar || 'جدول' }}</div>
    </div>
    
    <div class="table-container">
      <v-data-table
        :headers="headers"
        :items="rows"
        class="bg-white"
        density="comfortable"
      >
        <template v-slot:item="{ item, index, columns }">
          <tr>
            <td v-for="column in columns" :key="column.key">
              <v-text-field
                v-model="item.raw[column.key]"
                variant="underlined"
                density="compact"
                hide-details
                class="ma-2"
                @update:model-value="updateTable"
              ></v-text-field>
            </td>
            <td class="text-right">
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="red"
                @click="removeRow(index)"
              ></v-btn>
            </td>
          </tr>
        </template>
        
        <template v-slot:bottom>
          <div class="d-flex justify-end pa-2">
            <v-btn
              size="small"
              color="primary"
              variant="text"
              prepend-icon="mdi-plus"
              @click="addRow"
            >
              إضافة صف
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>
  </v-card>
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

// Generate headers from item configuration
const headers = computed(() => {
  if (!props.item.header?.ar) return [];
  
  const headerNames = props.item.header.ar.split(',');
  const result = headerNames.map((header, index) => ({
    title: header.trim(),
    key: `col${index}`,
    sortable: true,
    align: 'start'
  }));
  
  // Add actions column
  result.push({
    title: 'الإجراءات',
    key: 'actions',
    sortable: false,
    align: 'end'
  });
  
  return result;
});

// Table data
const tableData = computed({
  get: () => {
    // If form data already has table, use it
    if (props.formData[props.item.slug] && 
        props.formData[props.item.slug].rows) {
      return props.formData[props.item.slug];
    }
    
    // Otherwise initialize empty table
    return {
      headers: headers.value.filter(h => h.key !== 'actions').map(h => h.key),
      rows: []
    };
  },
  set: (value) => {
    emit('update:modelValue', value);
  }
});

// Table rows
const rows = computed(() => tableData.value.rows);

// Initialize if needed
watch(() => props.item, () => {
  if (!props.formData[props.item.slug]) {
    emit('update:modelValue', {
      headers: headers.value.filter(h => h.key !== 'actions').map(h => h.key),
      rows: []
    });
  }
}, { immediate: true });

// Methods
function addRow() {
  const headerKeys = headers.value
    .filter(h => h.key !== 'actions')
    .map(h => h.key);
    
  const newRow = {};
  headerKeys.forEach(key => {
    newRow[key] = '';
  });
  
  const newTableData = { ...tableData.value };
  newTableData.rows = [...newTableData.rows, newRow];
  emit('update:modelValue', newTableData);
}

function removeRow(index) {
  const newTableData = { ...tableData.value };
  newTableData.rows = [...newTableData.rows];
  newTableData.rows.splice(index, 1);
  emit('update:modelValue', newTableData);
}

function updateTable() {
  const newTableData = { ...tableData.value };
  newTableData.rows = [...newTableData.rows];
  emit('update:modelValue', newTableData);
}
</script>

<style scoped>
.table-container {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.12);
}
</style>