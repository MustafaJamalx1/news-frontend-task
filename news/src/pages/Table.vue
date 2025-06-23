<template>
    <v-container dir="rtl" class="py-10 fill-height" fluid>
        <v-row justify="center">
            <v-col cols="12" md="11" lg="10">
                <v-card class="elevation-8 rounded-xl border" color="white" border>
                    <v-card-title
                        class="headline font-weight-bold text-center py-8 rounded-t-xl bg-gradient-to-r from-blue-grey-lighten-5 to-blue-grey-lighten-4 text-primary"
                        style="font-size: 2.2rem; letter-spacing: 1px;"
                    >
                        <v-icon color="primary" size="36" class="ml-3">mdi-newspaper-variant-outline</v-icon>
                        جدول الأخبار
                        <!-- Create News Button -->
                        <v-spacer />
                      
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
                        color="blue-grey-lighten-5"
                    >
                        <template #top>
                            <NewsTableTopBar
                                :search-query="searchQuery"
                                :selected-filter="selectedFilter"
                                :filter-options="filterOptions"
                                @update:searchQuery="val => searchQuery = val"
                                @update:selectedFilter="val => selectedFilter = val"
                                @search="onSearch"
                            />
                        </template>
                        <template #headers>
                            <NewsTableHeader
                                :sort-by="sortBy"
                                @toggle-publish-date-sort="togglePublishDateSort"
                            />
                        </template>
                        <template #item.title="{ item }">
                            <span
                                class="news-title-link d-inline-flex align-center font-weight-bold text-primary"
                                tabindex="0"
                                @click="openDialog(item.slug)"
                                @keydown.enter="openDialog(item.slug)"
                                title="عرض تفاصيل الخبر"
                                style="cursor: pointer; white-space: nowrap; transition: color 0.2s;"
                            >
                                <v-icon size="18" color="primary" class="ml-1 news-title-icon" style="vertical-align: middle;">mdi-open-in-new</v-icon>
                                {{ item.title }}
                            </span>
                        </template>
                        <template #item.description="{ item }">
                            <span class="text-body-1 font-weight-light">
                                {{ truncate(item.description, 50) }}
                                <template v-if="item.description.length > 65">
                                    <v-btn size="small" variant="text" color="primary" @click="showDescription(item.description)">
                                        المزيد
                                        <v-icon end size="16">mdi-chevron-left</v-icon>
                                    </v-btn>
                                </template>
                            </span>
                        </template>
                        <template #item.publishDate="{ item }">
                            <v-chip color="primary" text-color="white" size="small" class="font-weight-bold">
                                <v-icon size="16" class="ml-1" color="white">mdi-calendar</v-icon>
                                {{ formatDate(item.publishDate) }}
                            </v-chip>
                        </template>
                        <template #item.tags="{ item }">
                            <v-chip
                                v-for="(tag, index) in item.tags"
                                :key="index"
                                class="ma-1"
                                size="small"
                                color="primary"
                                text-color="white"
                                variant="elevated"
                                style="font-size: 0.8em;"
                            >
                                <v-icon size="14" class="ml-1" color="white">mdi-tag</v-icon>
                                {{ tag.name }}
                            </v-chip>
                        </template>
                        <template #bottom>
                          <NewsTableFooter
                            :pagination-options="paginationOptions"
                            :total-pages="totalPages"
                            @set-items-per-page="setItemsPerPage"
                            @page-change="onPageChange"
                          />
                        </template>
                    </v-data-table>

                    <!-- Description Dialog -->
                    <DescriptionDialog
                      v-model="dialogDescription"
                      :description="fullDescription"
                    />
                    <!-- News Details Dialog -->
                    <NewsDetailsDialog
                        v-model="dialogNews"
                        :news="selectedNews"
                    />
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NewsTableTopBar from '../components/NewsTableTopBar.vue';
import NewsTableHeader from '../components/NewsTableHeader.vue';
import NewsDetailsDialog from '../components/NewsDetailsDialog.vue';
import DescriptionDialog from '../components/DescriptionDialog.vue';

interface Tag {
    name: string;
    slug: string;
}
interface Article {
    slug: string;
    title: string;
    description: string;
    publishDate: string;
    images: string[];
    tags: Tag[];
}
interface NewsDetails extends Article {
    content: string;
}

const isLoading = ref(false);
const totalPages = ref(0);
const paginationOptions = ref({ page: 1, itemsPerPage: 20 });

const headers = [
    { title: 'العنوان', value: 'title' },
    { title: 'الوصف', value: 'description' },
    { title: 'وسوم', value: 'tags' },
    { title: 'تاريخ النشر', value: 'publishDate', sortable: true, align: 'center' as const },
];

const articles = ref<{ items: Article[]; totalCount: number }>({ items: [], totalCount: 0 });

const dialogDescription = ref(false);
const fullDescription = ref('');
const showDescription = (desc: string) => {
    fullDescription.value = desc;
    dialogDescription.value = true;
};
const truncate = (text: string, length: number) =>
    text && text.length > length ? text.slice(0, length) + '...' : text || '';

const sortBy = ref<'asc' | 'desc' | ''>('');
const searchQuery = ref('');
const filterOptions = [
    { title: 'الكل', value: '' },
    { title: 'المحتوى الرئيسي', value: 'isMainContent' },
    { title: 'المميز', value: 'isFeatured' },
    { title: 'المثبت', value: 'isSticky' },
];
const selectedFilter = ref('');

const isMainContent = ref(false);
const isFeatured = ref(false);
const isSticky = ref(false);

watch(selectedFilter, (val) => {
    isMainContent.value = val === 'isMainContent';
    isFeatured.value = val === 'isFeatured';
    isSticky.value = val === 'isSticky';
    paginationOptions.value.page = 1;
    getDynamicTableData();
});
watch(sortBy, () => {
    paginationOptions.value.page = 1;
    getDynamicTableData();
});

const route = useRoute();
const router = useRouter();

function syncStateFromUrl() {
    searchQuery.value = (route.query.q as string) || '';
    selectedFilter.value = (route.query.filter as string) || '';
    sortBy.value = (route.query.sort as 'asc' | 'desc' | '') || '';
    paginationOptions.value.page = Number(route.query.page) || 1;
    paginationOptions.value.itemsPerPage = Number(route.query.perPage) || 20;
}
function updateUrlFromState() {
    router.replace({
        query: {
            q: searchQuery.value || undefined,
            filter: selectedFilter.value || undefined,
            sort: sortBy.value || undefined,
            page: paginationOptions.value.page !== 1 ? paginationOptions.value.page : undefined,
            perPage: paginationOptions.value.itemsPerPage !== 20 ? paginationOptions.value.itemsPerPage : undefined,
        },
    });
}
watch([searchQuery, selectedFilter, sortBy, () => paginationOptions.value.page, () => paginationOptions.value.itemsPerPage], updateUrlFromState);
watch(() => route.query, syncStateFromUrl);

onMounted(() => {
    syncStateFromUrl();
    getDynamicTableData();
});

function onPageChange(page: number) {
    paginationOptions.value.page = page;
    getDynamicTableData();
}
function setItemsPerPage(count: number) {
    paginationOptions.value.itemsPerPage = Number(count);
    paginationOptions.value.page = 1;
    getDynamicTableData();
}
function onSearch() {
    paginationOptions.value.page = 1;
    getDynamicTableData(searchQuery.value);
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
        const response = await fetch(
            `http://164.92.187.207:5005/api/app/dynamic-content/publics?${params}`
        );
        articles.value = await response.json();
        totalPages.value = Math.ceil(
            articles.value.totalCount / paginationOptions.value.itemsPerPage
        );
    } catch {
        alert('حدث خطأ أثناء جلب البيانات');
    } finally {
        isLoading.value = false;
    }
}

const dialogNews = ref(false);
const selectedNews = ref<NewsDetails | null>(null);

async function getBySlug(slug: string): Promise<NewsDetails> {
    const res = await fetch(
        `http://164.92.187.207:5005/api/app/dynamic-content/publics?Slug=${slug}&Language=ar`
    );
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    const item = data.items[0];
    let content = '';
    console.log(slug)
    try {
        const temp = JSON.parse(item.content as unknown as string);
        content = temp[0].contents[0].content.ar;
    } catch {
        content = '';
    }
    return { ...item, content };
}

async function openDialog(slug: string) {
    dialogNews.value = true;
    selectedNews.value = null;
    try {
        selectedNews.value = await getBySlug(slug);
    } catch {
        selectedNews.value = {
            title: 'Error',
            description: 'Failed to fetch news details.',
            content: '',
            images: [],
            publishDate: '',
            slug,
            tags: [],
        };
    }
}


function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IQ', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        
    });
}

function togglePublishDateSort() {
    sortBy.value = sortBy.value === 'asc' ? 'desc' : 'asc';
    paginationOptions.value.page = 1;
    getDynamicTableData();
}

// Add this function to handle the create button

</script>

<style scoped>
.custom-striped-table :deep(tbody tr:nth-child(odd)) {
    background-color: #f5f8fa !important;
    transition: background 0.2s;
}
.news-title-link .news-title-icon {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
}
.news-title-link:hover .news-title-icon,
.news-title-link:focus .news-title-icon {
    opacity: 1;
    pointer-events: auto;
}
.news-title-link:hover,
.news-title-link:focus {
    color: #0d47a1 !important;
    text-decoration: underline;
}
.v-data-table-header th {
    background: #e3f2fd !important;
    color: #1976d2 !important;
    font-weight: bold;
    font-size: 1.1rem;
    letter-spacing: 0.5px;
}
.v-data-table .v-data-table__progress {
    background: rgba(25, 118, 210, 0.05) !important;
}
</style>
