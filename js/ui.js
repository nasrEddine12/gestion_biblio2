const UI = {
    toast(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const icons = {
            success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
            error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
            warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
            info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        };

        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-white ${colors[type]} shadow-lg transform translate-x-full transition-transform duration-300`;
        toast.innerHTML = `${icons[type]}<span>${message}</span>`;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.remove('translate-x-full'), 10);

        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    confirm(options = {}) {
        const {
            title = 'Confirm Action',
            message = 'Are you sure you want to proceed?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            type = 'danger'
        } = options;

        return new Promise((resolve) => {
            const colors = {
                danger: 'bg-red-600 hover:bg-red-700',
                warning: 'bg-yellow-600 hover:bg-yellow-700',
                info: 'bg-blue-600 hover:bg-blue-700'
            };

            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl shadow-xl max-w-md w-full transform scale-95 opacity-0 transition-all duration-200" id="confirmModalContent">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">${title}</h3>
                        <p class="text-gray-600">${message}</p>
                    </div>
                    <div class="flex gap-3 px-6 pb-6">
                        <button id="confirmCancel" class="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                            ${cancelText}
                        </button>
                        <button id="confirmOk" class="flex-1 px-4 py-2 rounded-xl text-white ${colors[type]} transition-colors">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            setTimeout(() => {
                modal.querySelector('#confirmModalContent').classList.remove('scale-95', 'opacity-0');
            }, 10);

            const cleanup = (result) => {
                modal.querySelector('#confirmModalContent').classList.add('scale-95', 'opacity-0');
                setTimeout(() => {
                    modal.remove();
                    resolve(result);
                }, 200);
            };

            modal.querySelector('#confirmCancel').addEventListener('click', () => cleanup(false));
            modal.querySelector('#confirmOk').addEventListener('click', () => cleanup(true));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) cleanup(false);
            });
        });
    },

    modal(options = {}) {
        const {
            title = 'Modal',
            content = '',
            size = 'md',
            onClose = () => { }
        } = options;

        const sizes = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-2xl',
            xl: 'max-w-4xl'
        };

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 modal-backdrop overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl ${sizes[size]} w-full transform scale-95 opacity-0 transition-all duration-200 mb-8" id="modalContent">
                <div class="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
                    <button id="modalClose" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="p-6" id="modalBody">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            modal.querySelector('#modalContent').classList.remove('scale-95', 'opacity-0');
        }, 10);

        const close = () => {
            modal.querySelector('#modalContent').classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
                onClose();
            }, 200);
        };

        modal.querySelector('#modalClose').addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        return {
            close,
            element: modal,
            body: modal.querySelector('#modalBody'),
            setContent(html) {
                modal.querySelector('#modalBody').innerHTML = html;
            }
        };
    },

    dataTable(options = {}) {
        const {
            container,
            columns = [],
            data = [],
            pageSize = 10,
            searchable = true,
            onEdit = () => { },
            onDelete = () => { },
            onView = () => { },
            actions = ['view', 'edit', 'delete']
        } = options;

        let currentData = [...data];
        let filteredData = [...data];
        let currentPage = 1;
        let sortColumn = null;
        let sortDirection = 'asc';
        let searchQuery = '';

        const render = () => {
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const pageData = filteredData.slice(startIndex, endIndex);
            const totalPages = Math.ceil(filteredData.length / pageSize);

            let html = `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    ${searchable ? `
                    <div class="p-4 border-b border-gray-100">
                        <div class="relative">
                            <input type="text" placeholder="Search..." value="${searchQuery}"
                                class="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                id="tableSearch">
                            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    ${columns.map(col => `
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                            data-sort="${col.key}">
                                            <div class="flex items-center gap-2">
                                                ${col.label}
                                                ${sortColumn === col.key ? `
                                                    <svg class="w-4 h-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                                                    </svg>
                                                ` : ''}
                                            </div>
                                        </th>
                                    `).join('')}
                                    ${actions.length > 0 ? '<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>' : ''}
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${pageData.length === 0 ? `
                                    <tr>
                                        <td colspan="${columns.length + (actions.length > 0 ? 1 : 0)}" class="px-6 py-12 text-center text-gray-500">
                                            <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            <p class="font-medium">No data found</p>
                                            <p class="text-sm mt-1">Try adjusting your search or filters</p>
                                        </td>
                                    </tr>
                                ` : pageData.map(row => `
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        ${columns.map(col => `
                                            <td class="px-6 py-4 text-sm text-gray-700">
                                                ${col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                                            </td>
                                        `).join('')}
                                        ${actions.length > 0 ? `
                                            <td class="px-6 py-4 text-right">
                                                <div class="flex items-center justify-end gap-2">
                                                    ${actions.includes('view') ? `
                                                        <button class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-action="view" data-id="${row.id}" title="View">
                                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                            </svg>
                                                        </button>
                                                    ` : ''}
                                                    ${actions.includes('edit') ? `
                                                        <button class="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" data-action="edit" data-id="${row.id}" title="Edit">
                                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                            </svg>
                                                        </button>
                                                    ` : ''}
                                                    ${actions.includes('delete') ? `
                                                        <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-action="delete" data-id="${row.id}" title="Delete">
                                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                            </svg>
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            </td>
                                        ` : ''}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    ${totalPages > 1 ? `
                    <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p class="text-sm text-gray-500">
                            Showing ${startIndex + 1} to ${Math.min(endIndex, filteredData.length)} of ${filteredData.length} entries
                        </p>
                        <div class="flex items-center gap-2">
                            <button class="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                                ${currentPage === 1 ? 'disabled' : ''} data-page="prev">
                                Previous
                            </button>
                            ${Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                    page = i + 1;
                } else if (currentPage <= 3) {
                    page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                } else {
                    page = currentPage - 2 + i;
                }
                return `<button class="w-8 h-8 rounded-lg text-sm ${page === currentPage ? 'bg-primary-600 text-white' : 'hover:bg-gray-50'}" data-page="${page}">${page}</button>`;
            }).join('')}
                            <button class="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                ${currentPage === totalPages ? 'disabled' : ''} data-page="next">
                                Next
                            </button>
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;

            container.innerHTML = html;

            if (searchable) {
                container.querySelector('#tableSearch')?.addEventListener('input', (e) => {
                    searchQuery = e.target.value;
                    applyFilters();
                });
            }

            container.querySelectorAll('[data-sort]').forEach(th => {
                th.addEventListener('click', () => {
                    const key = th.dataset.sort;
                    if (sortColumn === key) {
                        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        sortColumn = key;
                        sortDirection = 'asc';
                    }
                    applySort();
                });
            });

            container.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    const id = btn.dataset.id;
                    if (action === 'view') onView(id);
                    if (action === 'edit') onEdit(id);
                    if (action === 'delete') onDelete(id);
                });
            });

            container.querySelectorAll('[data-page]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const page = btn.dataset.page;
                    if (page === 'prev') currentPage--;
                    else if (page === 'next') currentPage++;
                    else currentPage = parseInt(page);
                    render();
                });
            });
        };

        const applyFilters = () => {
            if (searchQuery) {
                filteredData = currentData.filter(row => {
                    return columns.some(col => {
                        const value = row[col.key];
                        return value && String(value).toLowerCase().includes(searchQuery.toLowerCase());
                    });
                });
            } else {
                filteredData = [...currentData];
            }
            currentPage = 1;
            applySort();
        };

        const applySort = () => {
            if (sortColumn) {
                filteredData.sort((a, b) => {
                    let valA = a[sortColumn] ?? '';
                    let valB = b[sortColumn] ?? '';

                    if (typeof valA === 'string') valA = valA.toLowerCase();
                    if (typeof valB === 'string') valB = valB.toLowerCase();

                    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                });
            }
            render();
        };

        const setData = (newData) => {
            currentData = [...newData];
            applyFilters();
        };

        const refresh = () => {
            render();
        };

        render();

        return { setData, refresh, render };
    },

    form(options = {}) {
        const { fields = [], onSubmit = () => { }, submitText = 'Submit', values = {} } = options;

        const formHtml = `
            <form class="space-y-4" id="dynamicForm">
                ${fields.map(field => {
            const value = values[field.name] ?? field.default ?? '';
            const required = field.required ? 'required' : '';

            switch (field.type) {
                case 'select':
                    return `
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">${field.label}${field.required ? ' *' : ''}</label>
                                    <select name="${field.name}" ${required}
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                        <option value="">Select ${field.label}</option>
                                        ${field.options.map(opt => `
                                            <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            `;
                case 'textarea':
                    return `
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">${field.label}${field.required ? ' *' : ''}</label>
                                    <textarea name="${field.name}" ${required} rows="3"
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="${field.placeholder || ''}">${value}</textarea>
                                </div>
                            `;
                case 'checkbox':
                    return `
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" name="${field.name}" id="${field.name}" ${value ? 'checked' : ''}
                                        class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
                                    <label for="${field.name}" class="text-sm font-medium text-gray-700">${field.label}</label>
                                </div>
                            `;
                case 'date':
                    return `
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">${field.label}${field.required ? ' *' : ''}</label>
                                    <input type="date" name="${field.name}" value="${value}" ${required}
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                </div>
                            `;
                default:
                    return `
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">${field.label}${field.required ? ' *' : ''}</label>
                                    <input type="${field.type || 'text'}" name="${field.name}" value="${value}" ${required}
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="${field.placeholder || ''}">
                                </div>
                            `;
            }
        }).join('')}
                <div class="flex gap-3 pt-4">
                    <button type="button" id="formCancel" class="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                        ${submitText}
                    </button>
                </div>
            </form>
        `;

        return formHtml;
    },

    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            data[cb.name] = cb.checked;
        });
        return data;
    },

    exportCSV(data, columns, filename = 'export.csv') {
        const headers = columns.map(c => c.label).join(',');
        const rows = data.map(row =>
            columns.map(c => {
                let val = row[c.key] ?? '';
                if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                    val = `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            }).join(',')
        ).join('\n');

        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    exportPDF(data, columns, title = 'Export') {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    tr:nth-child(even) { background-color: #fafafa; }
                    .footer { margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <table>
                    <thead>
                        <tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>${columns.map(c => `<td>${row[c.key] ?? '-'}</td>`).join('')}</tr>
                        `).join('')}
                    </tbody>
                </table>
                <p class="footer">Generated on ${new Date().toLocaleString()}</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
