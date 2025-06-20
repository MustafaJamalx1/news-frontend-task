<template>
    <v-container dir="rtl" class="py-10" fluid style="background: #f8fafc; min-height: 100vh;">
        <v-row justify="center">
            <v-col cols="12" md="11" lg="10">
                <v-card class="elevation-5 rounded-xl" style="background: #fff;">
                    <v-card-title class="headline font-weight-bold text-center py-8" style="background: #f1f5f9; border-radius: 1rem 1rem 0 0;">
                        جدول الأخبار
                    </v-card-title>
                    <v-divider />
                    <v-data-table
                        :loading="isLoading"
                        :headers="headers"
                        :items="articles.items"
                        class="elevation-1 custom-striped-table"
                        :items-per-page="paginationOptions.itemsPerPage"
                        :page="paginationOptions.page"
                        dir="rtl"
                        density="comfortable"
                        hide-default-footer
                        style="background: #f9fafb;"
                    >
                        <template v-slot:top>
                            <v-row class="d-flex align-center justify-start ma-2" style="background: #f1f5f9; border-radius: 12px;">
                                <v-col cols="auto" class="pa-0" style="min-width: 200px; max-width: 350px;">
                                    <v-text-field
                                        v-model="searchQuery"
                                        label="بحث"
                                        prepend-inner-icon="mdi-magnify"
                                        hide-details
                                        density="comfortable"
                                        variant="outlined"
                                        class="ma-0"
                                        style="width: 100%;"
                                        @input="getDynamicTableData(searchQuery)"
                                        clearable
                                        dir="rtl"
                                    />
                                </v-col>
                                <v-col cols="auto" class="pa-0" style="min-width: 120px;">
                                    <v-select
                                        v-model="selectedFilter"
                                        :items="filterOptions"
                                        item-title="title"
                                        item-value="value"
                                        label="تصفية"
                                        hide-details
                                        density="comfortable"
                                        variant="outlined"
                                        style="width: 120px;"
                                    />
                                </v-col>
                                <v-col cols="auto" class="pa-0" style="min-width: 120px;">
                                    <v-select
                                        :items="[
                                          { title: 'الاقدم الى الاحدث', value: 'asc' },
                                          { title: 'احدث الى اقدم', value: 'desc' }
                                        ]"
                                        v-model="sortBy"
                                        label="ترتيب حسب تاريخ النشر"
                                        style="max-width: 220px; margin-left: 16px;"
                                        density="compact"
                                        hide-details
                                        clearable
                                    />
                                </v-col>
                            </v-row>
                        </template>
                    
                        <template v-slot:item.title="{ item }">
                            <span
                                style="cursor:pointer; color:#1976d2; text-decoration:underline;"
                                @click="() => openDialog(item.slug)"
                            >
                                {{ item.title }}
                            </span>
                        </template>
                        <template v-slot:item.description="{ item }">
                            <span style="font-size: 1rem; font-weight: normal;">
                                {{ truncate(item.description, 65) }}
                                <template v-if="item.description.length > 65">
                                    <v-btn size="small" variant="text" @click="showDescription(item.description)">المزيد</v-btn>
                                </template>
                            </span>
                        </template>
                        <template v-slot:item.publishDate="{ item }">
                            <span style="white-space: nowrap;">{{ item.publishDate.slice(0,10) }}</span>
                        </template>
                        <template v-slot:item.tags="{ item }">
                            <v-chip
                                v-for="(tag, index) in item.tags"
                                :key="index"
                                class="ma-1"
                                size="small"
                                color="primary"
                                text-color="white"
                            >
                                {{ tag.name }}
                            </v-chip>
                        </template>
                        <template v-slot:bottom>
                            <v-row class="d-flex align-center justify-space-between ma-2" style="background: #f1f5f9; border-radius: 12px;">
                                <v-col cols="auto" class="pa-0">
                                    <v-select
                                        label="عرض"
                                        :items="[5, 10, 30, 50, 100]"
                                        :model-value="paginationOptions.itemsPerPage"
                                        hide-details
                                        density="comfortable"
                                        variant="outlined"
                                        class="ma-0"
                                        style="max-width: 90px;"
                                        @update:model-value="setItemsPerPage"
                                    />
                                </v-col>
                                <v-col cols="auto" class="pa-0">
                                    <v-fade-transition mode="out-in">
                                        <v-pagination
                                            dir="rtl"
                                            v-model="paginationOptions.page"
                                            :length="totalPages"
                                            :total-visible="5"
                                            @update:model-value="onPageChange"
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
                    <v-dialog v-model="dialogDescription" max-width="600">
                        <v-card class="pa-6" style="border-radius: 16px;">
                            <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center">
                                الوصف الكامل
                                <v-btn icon @click="dialogDescription = false" variant="text">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-card-title>
                            <v-card-text style="font-size: 1.15rem; line-height: 1.7; color: #333;">
                                {{ fullDescription }}
                            </v-card-text>
                        </v-card>
                    </v-dialog>
                    <!-- full Dialog -->
                    <v-dialog
                        v-model="dialogNews"
                        :max-width="'90vw'"
                        transition="dialog-bottom-transition"
                        scrollable
                        dir="rtl"
                        persistent
                        style="align-items: flex-end;"
                    >
                        <v-card
                            v-if="selectedNews"
                            style="max-height: 90vh; overflow-y: auto; border-radius: 24px 24px 0 0;"
                        >
                            <div style="width: 100%; background: #f1f5f9;">
                                <img
                                    :src="selectedNews.images && selectedNews.images[0] ? `https://api.theecopotamia.com/host/cms/images/lg/${selectedNews.images[0]}` : ''"
                                    alt="news image"
                                    style="width: 100%; height: 250px; object-fit: contain; background: #f1f5f9;"
                                />
                            </div>
                            <v-card-title class="text-h5 font-weight-bold py-4">
                                {{ selectedNews.title }}
                            </v-card-title>
                            <v-card-subtitle class="pb-2">
                                {{ selectedNews.publishDate?.slice(0, 10) }}
                            </v-card-subtitle>
                            <v-divider></v-divider>
                            <v-card-text style="font-size: 1.15rem; line-height: 1.7; color: #333;">
                                <v-row v-if="selectedNews.description">
                                    <v-col cols="12">
                                        <strong>الوصف:</strong>
                                        <v-textarea
                                            v-model="selectedNews.description"
                                            readonly
                                            auto-grow
                                            rows="2"
                                            style="background: #f8fafc; border-radius: 8px;"
                                        ></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-card-text
                                :loading="isLoading">
                                    <!-- {{ selectedNews.content.contents.content.ar }} -->
                                      لا يوجد محتوى مفصل لهذا الخبر.
                                </v-card-text>
                                </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" variant="text" @click="dialogNews = false">إغلاق</v-btn>
                            </v-card-actions>
                        </v-card>
                        <v-card v-else style="max-height: 90vh; border-radius: 24px 24px 0 0;">
                            <v-card-text class="d-flex justify-center align-center" style="height: 200px;">
                                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                            </v-card-text>
                        </v-card>
                    </v-dialog>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>


<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
interface Article {
    slug: string;
    title: string;
    description: string;
    publishDate: string;
    images: string[];
    tags: [tag];
}
interface tag{
    name:string,slug:string
}

const isLoading = ref(false);
const totalPages = ref(0);
const paginationOptions = ref({
    page: 1,
    itemsPerPage: 20,
});

const headers = [
    { title:'slug', value : 'slug'},
    { title: 'العنوان', value: 'title' },
    { title: 'الوصف', value: 'description' },
    { title: 'وسوم', value : 'tags'},
    { 
        title: 'تاريخ النشر', 
        value: 'publishDate', 
        sortable: true, 
        align: 'center',
        // You can add a custom sort function here to see the inside work
        sort: (a, b) => {
            // Log values to see how sorting works
            console.log('Sorting:', a.publishDate, b.publishDate);
            // Example: sort by date descending
            return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        }
    },
];

const articles = ref<{ items: Article[]; totalCount: number }>({ items: [], totalCount: 0 });


// Description dialog logic
const dialogDescription = ref(false);
const fullDescription = ref('');
function showDescription(desc: string) {
    fullDescription.value = desc;
    dialogDescription.value = true;
}
function truncate(text: string, length: number) {
    return text && text.length > length ? text.slice(0, length) + '...' : text || '';
}


const sortBy = ref<'asc' | 'desc' | ''>('')

const isMainContent = ref(false);
const isFeatured = ref(false);
const isSticky = ref(false);
const searchQuery = ref('');
const filterOptions = ref([
    { title: 'الكل', value: '' },
    { title: 'المحتوى الرئيسي', value: 'isMainContent' },
    { title: 'المميز', value: 'isFeatured' },
    { title: 'المثبت', value: 'isSticky' },
]);
const selectedFilter = ref('');

watch(selectedFilter, (val) => {
    isMainContent.value = val === 'isMainContent';
    isFeatured.value = val === 'isFeatured';
    isSticky.value = val === 'isSticky';
    paginationOptions.value.page = 1;
    getDynamicTableData();
});
watch(sortBy, (val) => {
    paginationOptions.value.page = 1;
    getDynamicTableData();
});


onMounted((getDynamicTableData));

function onPageChange(page: number) {
    paginationOptions.value.page = page;
    getDynamicTableData();
}

function setItemsPerPage(count: number) {
    paginationOptions.value.itemsPerPage = Number(count);
    paginationOptions.value.page = 1;
    getDynamicTableData();
}

async function getDynamicTableData(searchValue?: string) {
    const skipCount = (paginationOptions.value.page - 1) * paginationOptions.value.itemsPerPage;

    isLoading.value = true;
    try {
        const params = [
            searchValue ? `Title=${encodeURIComponent(searchValue)}` : '',
            isMainContent.value ? `IsMainContent=true` : '',
            isFeatured.value ? `IsFeature=true` : '',
            isSticky.value ? `IsSticky=true` : '',
            sortBy.value ? `Sorting=publishDate%20${sortBy.value}` : '',
            'Language=ar',
            `SkipCount=${skipCount}`,
            `MaxResultCount=${paginationOptions.value.itemsPerPage}`,
            
        ].filter(Boolean).join('&');
        const response = await fetch(`https://api.theecopotamia.com/api/app/dynamic-content/publics?${params}`);
        console.log(`sort :`, sortBy.value),
        articles.value = await response.json();
        totalPages.value = Math.ceil(articles.value.totalCount / paginationOptions.value.itemsPerPage);
     
    } catch (error) {
        alert('حدث خطأ أثناء جلب البيانات');
    } finally {
        isLoading.value = false;
    }
}

// Define the type for a news item (adjust fields as needed)
interface NewsDetails {
  title: string
  description: string
  content: {contents:{content:{ar:string}}}// content is an array of objects
  images: string
  publishDate: string
  slug: string
  // add other fields if needed
}

// Dialog state and selected news
const dialogNews = ref(false)
const selectedNews = ref<NewsDetails | null>(null)
const loadingDetails = ref(false)

// Replace this with your actual getBySlug function or import it
async function getBySlug(slug: string): Promise<NewsDetails> {
  const res = await fetch(`https://api.theecopotamia.com/api/app/dynamic-content/publics?Slug=${slug}&IsWithContent=true&Language=ar`)
  if (!res.ok) throw new Error('Failed to fetch')

const data = await res.json()
  return await data.items[0]
}

async function openDialog(slug: string) {
  dialogNews.value = true
  selectedNews.value = null
  loadingDetails.value = true
  try {
    selectedNews.value = await getBySlug(slug)
    console.log(`content :`, selectedNews.value.content)
  } catch (e) {
    selectedNews.value = {
      title: 'Error',
      description: 'Failed to fetch news details.',
      content: [],
      images: '',
      publishDate: '',
      slug,
    }
  } finally {
    loadingDetails.value = false
  }
}

// Helper function to get the full image URL
function fetchImageUrl(picture: string): string {
console.log(`Fetching image URL for: ${picture}`);
    if (!picture) return '';
    else{

        return `https://api.theecopotamia.com/host/cms/images/sm/${picture}`;
    }
}


</script>

<style scoped>
/* For Vuetify 3, target the table rows inside the component */
.custom-striped-table :deep(tbody tr:nth-child(odd)) {
  background-color: #f5f5f5 !important;
}
</style>

