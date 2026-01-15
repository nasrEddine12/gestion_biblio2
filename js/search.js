const GlobalSearch = {
    isOpen: false,
    searchTimeout: null,
    resultsContainer: null,

    init() {
        const searchInput = document.getElementById('globalSearch');
        if (!searchInput) return;

        this.createResultsDropdown(searchInput);

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
            if (e.key === 'Escape' && this.isOpen) {
                this.hideResults();
                searchInput.blur();
            }
        });

        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();

            if (query.length < 2) {
                this.hideResults();
                return;
            }

            this.searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 200);
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length >= 2) {
                this.showResults();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#globalSearchContainer')) {
                this.hideResults();
            }
        });
    },

    createResultsDropdown(searchInput) {
        const parent = searchInput.parentElement;
        parent.id = 'globalSearchContainer';
        parent.classList.add('relative');

        const dropdown = document.createElement('div');
        dropdown.id = 'searchResults';
        dropdown.className = 'absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50 hidden';
        parent.appendChild(dropdown);

        this.resultsContainer = dropdown;
    },

    performSearch(query) {
        const results = {
            books: Books.search(query).slice(0, 5),
            authors: Authors.search(query).slice(0, 5),
            members: Members.search(query).slice(0, 5),
            categories: Categories.search(query).slice(0, 5)
        };

        const totalResults =
            results.books.length +
            results.authors.length +
            results.members.length +
            results.categories.length;

        if (totalResults === 0) {
            this.renderNoResults(query);
        } else {
            this.renderResults(results, query);
        }

        this.showResults();
    },

    renderResults(results, query) {
        let html = '';

        if (results.books.length > 0) {
            html += this.renderSection('Books', results.books.map(book => ({
                id: book.id,
                title: book.title,
                subtitle: `ISBN: ${book.isbn}`,
                icon: this.icons.book,
                action: () => this.navigateToItem('books', book.id)
            })));
        }

        if (results.authors.length > 0) {
            html += this.renderSection('Authors', results.authors.map(author => ({
                id: author.id,
                title: `${author.name} ${author.surname}`,
                subtitle: `${Books.getAll().filter(b => b.authorId === author.id).length} books`,
                icon: this.icons.author,
                action: () => this.navigateToItem('authors', author.id)
            })));
        }

        if (results.members.length > 0) {
            html += this.renderSection('Members', results.members.map(member => ({
                id: member.id,
                title: member.name,
                subtitle: member.email,
                icon: this.icons.member,
                action: () => this.navigateToItem('members', member.id)
            })));
        }

        if (results.categories.length > 0) {
            html += this.renderSection('Categories', results.categories.map(cat => ({
                id: cat.id,
                title: cat.name,
                subtitle: cat.description || 'No description',
                icon: this.icons.category,
                action: () => this.navigateToItem('categories', cat.id)
            })));
        }

        html += `
            <div class="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                <span>Press <kbd class="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">↵</kbd> to select</span>
                <span>Press <kbd class="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">Esc</kbd> to close</span>
            </div>
        `;

        this.resultsContainer.innerHTML = html;
        this.attachResultListeners();
    },

    renderSection(title, items) {
        return `
            <div class="p-2">
                <p class="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">${title}</p>
                ${items.map(item => `
                    <button class="search-result-item w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors" data-id="${item.id}" data-type="${title.toLowerCase()}">
                        <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${item.icon}
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-800 truncate">${item.title}</p>
                            <p class="text-xs text-gray-500 truncate">${item.subtitle}</p>
                        </div>
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                `).join('')}
            </div>
        `;
    },

    renderNoResults(query) {
        this.resultsContainer.innerHTML = `
            <div class="p-8 text-center">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-gray-600 font-medium">No results found</p>
                <p class="text-sm text-gray-400 mt-1">No matches for "${query}"</p>
            </div>
        `;
    },

    attachResultListeners() {
        this.resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const id = item.dataset.id;
                this.navigateToItem(type, id);
            });
        });
    },

    navigateToItem(type, id) {
        this.hideResults();
        document.getElementById('globalSearch').value = '';

        App.navigateTo(type);

        setTimeout(() => {
            switch (type) {
                case 'books':
                    Pages.viewBook(id);
                    break;
                case 'authors':
                    Pages.viewAuthor(id);
                    break;
                case 'members':
                    Pages.viewMember(id);
                    break;
                case 'categories':
                    Pages.viewCategory(id);
                    break;
            }
        }, 100);
    },

    showResults() {
        if (this.resultsContainer) {
            this.resultsContainer.classList.remove('hidden');
            this.isOpen = true;
        }
    },

    hideResults() {
        if (this.resultsContainer) {
            this.resultsContainer.classList.add('hidden');
            this.isOpen = false;
        }
    },

    icons: {
        book: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>',
        author: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>',
        member: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>',
        category: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    GlobalSearch.init();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalSearch;
}
