<template>
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between my-10">
        <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" @click.prevent="loadPage(offset - limit, limit)" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span class="sr-only">Previous</span>
                    <img src="/arrow-left.png" alt="Arrow 64" width="16" height="16"/>
                </a>
                <a
                    v-for="page in pages"
                    href="#"
                    @click.prevent="loadPage(page.index * limit, limit)"
                    aria-current="page"
                    :class="{
                        'z-10 relative inline-flex items-center px-4 py-2 border text-sm font-medium': true,
                        'bg-indigo-50 border-indigo-500 text-indigo-600': page.index !== null,
                        'bg-indigo-100': page.current
                    }"
                >
                    {{ page.label || page.index }}
                </a>
                <a href="#" @click.prevent="loadPage(offset + limit, limit)" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span class="sr-only">Next</span>
                    <img src="/arrow-right.png" alt="Next" width="16" height="16"/>
                </a>
            </nav>
        </div>
    </div>
</template>

<script lang="ts">
    export default {
        name: 'Pagination',
        props: {
            offset: {
                required: true,
                type: Number
            },
            limit: {
                required: true,
                type: Number
            },
            total: {
                required: true,
                type: Number
            }
        },
        data () {
            return {
                pages: [],
                currentPage: 0
            };
        },
        mounted () {
            this.preparePagination();
        },
        methods: {
            loadPage(offset: Number, limit: Number) {
                if (offset < 0 || offset > this.total + this.limit) {
                    return;
                }
                this.$emit('loadPage', offset, limit);
            },
            preparePagination () {
                this.pages = [];
                const pageCount = Math.ceil(this.total / this.limit);
                this.currentPage = this.offset / this.limit;
                console.log(this.currentPage);
                if (this.currentPage + 1 !== 1) {
                    this.pages.push({
                        index: 0,
                        label: 1,
                        current: this.currentPage + 1 === 1
                    });
                    this.pages.push({
                        index: null,
                        label: '...'
                    });
                }
                this.pages.push({
                    index: this.currentPage,
                    label: this.currentPage + 1,
                    current: true
                });
                if (this.currentPage !== pageCount) {
                    this.pages.push({
                        index: null,
                        label: '...'
                    });
                    this.pages.push({
                        index: pageCount,
                        label: pageCount + 1,
                        current: this.currentPage === pageCount
                    });
                }
            }
        }
    }
</script>