<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/VDataTable'
import DeleteDialog from './components/DeleteDialog.vue'
import type { CrudPermissionsConfig, TableHeader } from './types'
import {
  formatDate,
  getAvatarData,
  getObjectPropertyValue,
  getStatusColor,
  getStatusValue,
} from './utils'
import type { ApiURLS } from '@/models/interfaces/base-urls'
import axiosIns from '@/plugins/axios'
import { useAlert } from '@/utils/useAlertsPoper'
import { avatarText } from '@core/utils/formatters'
import { can } from '@layouts/plugins/casl'

interface Props {
  tableUrls: ApiURLS
  contentRefresher: number
  tablerTitleHeader: string
  dynamicTableHeaders: TableHeader[]
  actionsPermissions: CrudPermissionsConfig
  params?: object
}

const props = defineProps<Props>()
const emits = defineEmits(['updatedOrCreatedData'])
const tableRowData = ref<any[]>([])
const isLoading = ref<boolean>(false)
const permissions = ref<CrudPermissionsConfig>(props.actionsPermissions)
const deleteTableItemModel = ref<boolean>(false)
const deletedItemId = ref<string>('')

const paginationOptions = ref({
  page: 1,
  itemsPerPage: 5,
})

const totalPages = ref(0)

function getDynamicTableData() {
  const skipCount = (paginationOptions.value.page - 1) * paginationOptions.value.itemsPerPage

  isLoading.value = true
  axiosIns.get(${props.tableUrls.get}?SkipCount=${(skipCount)}&MaxResultCount=${paginationOptions.value.itemsPerPage}, { params: props.params })
    .then((res: { data: { items: any[] ; totalCount: number } }) => {
      tableRowData.value = res.data?.items
      totalPages.value = Math.ceil(res.data.totalCount / paginationOptions.value.itemsPerPage)
    })
    .catch((error: { message: string }) => useAlert('error', error.message))
    .finally(() => isLoading.value = false)
}
function setCurrentPage(current: number) {
  paginationOptions.value.page = 1
  paginationOptions.value.itemsPerPage = Number(current)
  getDynamicTableData()
}

function createOrUpdateItem(item: any | null) {
  emits('updatedOrCreatedData', item)
}
function toggleDeleteDialog(itemId: any) {
  deleteTableItemModel.value = true
  deletedItemId.value = itemId
}
watch(() => props.contentRefresher, () => {
  paginationOptions.value.page = 1
  getDynamicTableData()
})
onMounted(() => getDynamicTableData())
</script>

<template>
  <div>
    <VCard
      class="pa-10"
      flat
      :loading="isLoading"
    >
      <VRow>
        <VCol
          cols="12"
          class="d-flex align-center justify-space-between flex-sm-row flex-column"
        >
          <h2>
            {{ props.tablerTitleHeader }}
          </h2>

          <VBtn
            v-if="can(permissions.create, permissions.subject)"
            class="mt-sm-0 mt-2"
            flat
            @click="createOrUpdateItem(null)"
          >
            <VIcon icon="tabler-plus" />
            <span class="mx-2">اضافة</span>
          </VBtn>
        </VCol>
        <VCol
          v-if="$slots.filters"
          cols="12"
        >
          <slot name="filters" />
        </VCol>
        <VCol
          v-if="!isLoading"
          cols="12"
        >
          <VDataTable
            :headers="props.dynamicTableHeaders"
            :items="tableRowData"
            :items-per-page="paginationOptions.itemsPerPage"
            :page="paginationOptions.page"
          >
            <template
              v-for="(header, i) in props.dynamicTableHeaders"
              #[item.${header.key}]="{ item }"
              :key="i"
            >
              <VChip
                v-if="header.type === 'status'"
                :color="getStatusColor(item, header)"
              >
                {{ getStatusValue(item, header) }}
              </VChip>
              <p
                v-else-if="header.type === 'date'"
                class="ma-0"
              >
                {{ formatDate(item, header) }}
              </p>
              <div
                v-else-if="header.type === 'text' && header.key === 'arName'"
                class="d-flex align-center flex-row-reverse justify-end"
              >
                <p class="ma-0">
                  {{ getObjectPropertyValue(item?.raw, header.cellModifier) }}
                </p>
                <VBtn
                  variant="text"
                  density="comfortable"
                  class="rounded-lg ma-0 pa-0"
                >
                  <VIcon
                    icon="tabler-info-circle"
                    color="grey-400"
                  />
                  <VTooltip
                    activator="parent"
                    location="top"
                  >
                    {{ ID: ${item?.raw?.id} # }}
                  </VTooltip>
                </VBtn>
              </div>
              <p
                v-else-if="header.type === 'boolean'"
                class="ma-0"
              >
                {{ getObjectPropertyValue(item?.raw, header.cellModifier) ? 'نعم' : 'كلا' }}
              </p>
              <p
                v-else-if="header.type === 'text'"
                class="ma-0"
              >
                {{ getObjectPropertyValue(item?.raw, header.cellModifier) }}
              </p>
              <div
                v-else-if="header.type === 'avatar'"
                class="d-flex align-center gap-2"
              >
                <VAvatar
                  v-if="getAvatarData(item, header, 'image')"
                  size="35"
                  color="primary"
                  class="v-avatar-light-bg primary--text"
                  variant="tonal"
                >
                  <VImg
                    :src="getAvatarData(item, header, 'image')"
                  />
                </VAvatar>
                <VAvatar
                  v-else
                  size="35"
                  class="bg-light-yellow text-gray-400"
                >
                  <h4>{{ avatarText(getAvatarData(item, header, 'name')) }}</h4>
                </VAvatar>

                <span>{{ getAvatarData(item, header, 'name') }}</span>
              </div>

              <template v-else-if="header.type === 'enum'">
                <slot
                  :name="item.${header.key}"
                  :item="item"
                >
                  <span>{{ item[header.key] }}</span>
                </slot>
              </template>
              <template v-else-if="header.type === 'custom'">
                <slot
                  :name="item.${header.key}"
                  :item="item"
                >
                  <span>{{ item[header.key] }}</span>
                </slot>
              </template>
              <template v-else-if="header.type === 'action'">
                <VBtn
                  v-if="can(permissions.update, permissions.subject)"
                  icon="tabler-pencil"
                  color="primary"
                  density="comfortable"
                  variant="text"
                  class="rounded-lg"
                  @click="createOrUpdateItem(item?.raw)"
                />
                <VBtn
                  v-if="can(permissions.delete, permissions.subject)"
                  icon="tabler-trash"
                  color="error"
                  density="comfortable"
                  variant="text"
                  class="rounded-lg"
                  @click="toggleDeleteDialog(item?.raw?.id)"
                />
              </template>
            </template>

            <template #bottom>
              <VRow class="pt-2 mt-6">
                <VCol
                  lg="2"
                  cols="3"
                >
                  <VSelect
                    label="عرض"
                    :items="[5, 10, 30, 50, 100]"
                    :model-value="paginationOptions.itemsPerPage"
                    hide-details
                    @update:model-value="setCurrentPage"
                  />
                </VCol>

                <VCol
                  lg="10"
                  cols="9"
                  class="d-flex justify-end"
                >
                  <VPagination
                    v-model="paginationOptions.page"
                    total-visible="5"
                    :length="totalPages"
                    @update:model-value="getDynamicTableData"
                  />
                </VCol>
              </VRow>
            </template>
          </VDataTable>
        </VCol>
      </VRow>
    </VCard>
    <DeleteDialog
      :delete-url="props.tableUrls.delete"
      :deleted-item-id="deletedItemId"
      :model-value="deleteTableItemModel"
      @update:model-value="(v: boolean) => deleteTableItemModel = v"
      @delete-is-done="getDynamicTableData"
    />
  </div>
</template>