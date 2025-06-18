<template>
    <v-container dir="rtl" class="py-8">
        <v-row justify="center">
            <v-col cols="12" md="12" lg="12" style="max-width: 1500px;">
                <v-card class="elevation-3 rounded-lg">
                    <v-card-title class="headline font-weight-bold text-center py-6">جدول الأخبار</v-card-title>
                    <v-data-table
                        :loading="isLoading"
                        :headers="headers"
                        :items="articles.items"
                        class="elevation-1"
                        :items-per-page="paginationOptions.itemsPerPage"
                        :page="paginationOptions.page"
                        dir="rtl"
                        density="comfortable"
                        hide-default-footer
                        
                    >
                    <template v-slot:top>
                        <v-row class="d-flex align-center justify-space-between ma-2">
                            <v-col cols="auto" class="pa-0">
                                <v-text-field
                                    v-model="searchQuery"
                                    label="بحث"
                                    prepend-inner-icon="mdi-magnify"
                                    hide-details
                                    density="comfortable"
                                    variant="outlined"
                                    class="ma-0"
                                    style="max-width: 700px; min-width: 200px; width: 100%;"
                                    @input="getDynamicTableData"
                                    clearable
                                    dir="rtl"
                                />
                            </v-col>
                              <v-col cols="auto">
                              <v-checkbox
                                v-model="isSticky"
                                label="Sticky"
                                dense
                                hide-details
                                 @click="getDynamicTableData"
                              />
                            </v-col>
                            <v-col cols="auto">
                              <v-checkbox
                                v-model="isFeatured"
                                label="Featured"
                                dense
                                hide-details
                                 @click="getDynamicTableData"
                              />
                            </v-col>
                            <v-col cols="auto">
                            <v-checkbox
                                v-model="isMainContent"
                                label="Main"
                                dense
                                hide-details
                                @click="getDynamicTableData"
                            />
                            </v-col>
                        </v-row>
                    </template>
                        <template v-slot:item.images="{ item }">
                            <v-img
                                v-if="item.images && item.images.length"
                                :src="getImageUrl(item.images[0])"
                                width="90"
                                height="48"
                                class="rounded-lg elevation-2"
                                cover
                                style="cursor: pointer; background-color: #f5f5f5;"
                                @click="showImageDialog(getImageUrl(item.images[0]))"
                            />
                        </template>
                        <template v-slot:item.title="{ item }">
                            <span style="font-size: 1.1rem; font-weight: bold; white-space: nowrap;">
                                {{ item.title }}
                            </span>
                        </template>
                        <template v-slot:item.description="{ item }">
                            <span style="font-size: 1rem; font-weight: bold;">
                                {{ truncate(item.description, 65) }}
                                <template v-if="item.description.length > 65">
                                    <v-btn size="small" variant="text" @click="showDescription(item.description)">المزيد</v-btn>
                                </template>
                            </span>
                        </template>
                        <template v-slot:item.publishDate="{ item }">
                            <span style="white-space: nowrap;">{{ item.publishDate.slice(0,10) }}</span>
                        </template>
                        <template v-slot:bottom>
                            <v-row class="d-flex align-center justify-space-between ma-2">
                                <v-col cols="auto" class="pa-0">
                                    <VSelect
                                        label="عرض"
                                        :items="[5, 10, 30, 50, 100]"
                                        :model-value="paginationOptions.itemsPerPage"
                                        hide-details
                                        density="comfortable"
                                        variant="outlined"
                                        class="ma-0"
                                        style="max-width: 90px;"
                                        @update:model-value="setCurrentPage"
                                    />
                                </v-col>
                                <v-col cols="auto" class="pa-0">
                                    <v-fade-transition mode="out-in">
                                        <v-pagination
                                            dir="rtl"
                                            v-model="paginationOptions .page"
                                            :length="totalPages"
                                            :total-visible="5"
                                            @update:model-value="getDynamicTableData"
                                            :prev-icon="'mdi-chevron-right'"
                                            :next-icon="'mdi-chevron-left'"
                                            :key="paginationOptions.page"
                                            color="primary"
                                            rounded
                                        ></v-pagination>
                                    </v-fade-transition>
                                </v-col>
                            </v-row>
                        </template>
                    </v-data-table>
                    <!-- Description Dialog -->
                    <v-dialog v-model="dialog" max-width="600">
                        <v-card class="pa-6" style="border-radius: 16px;">
                            <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center">
                                الوصف الكامل
                                <v-btn icon @click="dialog = false" variant="text">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-card-title>
                            <v-card-text style="font-size: 1.15rem; line-height: 1.7; color: #333;">
                                {{ fullDescription }}
                            </v-card-text>
                        </v-card>
                    </v-dialog>
                    <!-- Image Dialog -->
                    <v-dialog v-model="imageDialog" max-width="800">
                        <v-card>
                            <v-img :src="selectedImage" aspect-ratio="2.75" class="rounded-lg" contain></v-img>
                            <v-card-actions>
                                <v-spacer />
                                <v-btn color="primary" text @click="imageDialog = false">إغلاق</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <!-- New Popup Component -->
                    <v-dialog v-model="newDialog" max-width="500">
                        <v-card>
                            <v-card-title>Title</v-card-title>
                            <v-card-text class="text-h6 font-weight-bold">
                                This is the popup description.
                            </v-card-text>
                            <v-card-actions>
                                <v-btn text @click="newDialog = false">Close</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

interface Article {
    title: string;
    description: string;
    publishDate: string;
    images: string[];
}

const isLoading = ref<boolean>(false);
const totalPages = ref<number>(0);
const paginationOptions = ref({
    page: 1,
    itemsPerPage: 20,
});

const headers = [
    { title: 'العنوان', value: 'title' },
    { title: 'الوصف', value: 'description' },
    { title: 'تاريخ النشر', value: 'publishDate' },
    { title: 'الصور', value: 'images' },
];

const articles = ref<{ items: Article[]; totalCount: number }>({ items: [], totalCount: 0 });

function getImageUrl(filename: string): string {
    if (!filename) return '';
    return `https://api.theecopotamia.com/host/cms/images/md/${filename}`;
}

// Description dialog logic
const dialog = ref(false);
const fullDescription = ref('');
function showDescription(desc: string) {
    fullDescription.value = desc;
    dialog.value = true;
}
function truncate(text: string, length: number) {
    if (!text) return '';
    return text.length > length ? text.slice(0, length) + '...' : text;
}

// Image dialog logic
const imageDialog = ref(false)
const selectedImage = ref('')
const isMainContent = ref<boolean>(false);
const isFeatured = ref<boolean>(false);
const isSticky = ref<boolean>(false);
const searchQuery = ref<string>('');

function showImageDialog(imgUrl: string) {
  selectedImage.value = imgUrl
  imageDialog.value = true
}

// New dialog logic
const newDialog = ref(false);

onMounted(getDynamicTableData);

function setCurrentPage(current: number) {
    paginationOptions.value.page = 1;
    paginationOptions.value.itemsPerPage = Number(current);
    getDynamicTableData();
}

async function getDynamicTableData(serachValue?: string ) {
    const skipCount = (paginationOptions.value.page - 1) * paginationOptions.value.itemsPerPage;

    isLoading.value = true;
    try {
        const response = await fetch(
            `https://api.theecopotamia.com/api/app/dynamic-content/publics?IsMainContent=${isMainContent.value}&IsFeature=${isFeatured.value}&IsSticky=${isSticky.value}&Language=ar&SkipCount=${skipCount}&MaxResultCount=${paginationOptions.value.itemsPerPage}`
            
        );
        articles.value = await response.json();
        totalPages.value = Math.ceil(articles.value.totalCount / paginationOptions.value.itemsPerPage);
    } catch (error) {
        if (error instanceof Error) {
            alert('error: ' + error.message);
        } else {
            alert('An unknown error occurred');
        }
    } finally {
        isLoading.value = false;
    }
}
</script>
