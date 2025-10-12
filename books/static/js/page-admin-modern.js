// Modern Page Admin JavaScript Enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeDarkMode();
    initializeLayout();
    initializeTextEditor();
    initializeImageViewer();
    initializeKeyboardShortcuts();
    initializeFloatingButtons();
    initializeUndoRedo();
    initializeFormButtons();
    initializeMarkdownButtons();

    // Dark Mode Functionality
    function initializeDarkMode() {
        const toggle = document.getElementById('theme-toggle');
        const icon = document.getElementById('theme-icon');
        const body = document.body;
        const root = document.documentElement;

        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('page-editor-theme');

        // Only enable dark mode if explicitly saved as 'dark'
        if (savedTheme === 'dark') {
            enableDarkMode();
        } else {
            // Ensure light mode is properly set
            disableDarkMode();
        }

        // Toggle theme on button click
        toggle?.addEventListener('click', () => {
            if (root.getAttribute('data-theme') === 'dark' || body.classList.contains('dark-mode')) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        });

        function enableDarkMode() {
            root.setAttribute('data-theme', 'dark');
            body.classList.add('dark-mode');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
            localStorage.setItem('page-editor-theme', 'dark');

            // Apply dark mode to Django admin elements
            applyDarkModeToDjangoAdmin();
        }

        function disableDarkMode() {
            root.setAttribute('data-theme', 'light');
            body.classList.remove('dark-mode');
            if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
            localStorage.setItem('page-editor-theme', 'light');

            // Remove dark mode from Django admin elements
            removeDarkModeFromDjangoAdmin();
        }

        function applyDarkModeToDjangoAdmin() {
            // Apply dark styles to Django admin elements
            const style = document.createElement('style');
            style.id = 'django-admin-dark-mode';
            style.textContent = `
                body.dark-mode #header {
                }

                body.dark-mode #branding h1 {
                    color: var(--text-color) !important;
                }

                body.dark-mode #content {
                    background: var(--light-bg) !important;
                }

                body.dark-mode .module {
                    background: var(--card-bg) !important;
                    border: 1px solid var(--border-color) !important;
                }

                body.dark-mode .module h2 {
                    background: var(--toolbar-bg) !important;
                    color: var(--text-color) !important;
                }

                body.dark-mode input[type="text"],
                body.dark-mode input[type="number"],
                body.dark-mode select,
                body.dark-mode textarea {
                    background: var(--textarea-bg) !important;
                    color: var(--textarea-color) !important;
                    border: 1px solid var(--border-color) !important;
                }

                body.dark-mode label {
                    color: var(--text-color) !important;
                }

                body.dark-mode .help {
                    color: var(--text-muted) !important;
                }

                body.dark-mode .errorlist {
                    color: var(--danger-color) !important;
                }
            `;
            document.head.appendChild(style);
        }

        function removeDarkModeFromDjangoAdmin() {
            const style = document.getElementById('django-admin-dark-mode');
            if (style) {
                style.remove();
            }
        }

        // Remove automatic system theme detection to prevent unwanted dark mode
        // Users must explicitly toggle dark mode using the button
    }

    // Reorganize Django form elements into modern layout
    function initializeLayout() {
        // Sync visible fields with hidden form fields
        syncFormFields();
    }

    // Sync form fields between visible and hidden forms
    function syncFormFields() {
        // Sync text field
        const visibleText = document.querySelector('#text-editor-container textarea, #text-editor-container [name="text"]');
        const hiddenText = document.querySelector('#original-form [name="text"]');

        if (visibleText && hiddenText && visibleText !== hiddenText) {
            // Sync initial values
            if (hiddenText.value && !visibleText.value) {
                visibleText.value = hiddenText.value;
            }

            // Keep them in sync
            visibleText.addEventListener('input', function() {
                hiddenText.value = this.value;
            });
        }

        // Sync status field
        const visibleStatus = document.querySelector('.metadata-panel [name="status"]');
        const hiddenStatus = document.querySelector('#original-form [name="status"]');

        if (visibleStatus && hiddenStatus && visibleStatus !== hiddenStatus) {
            // Sync initial values
            if (hiddenStatus.value) {
                visibleStatus.value = hiddenStatus.value;
            }

            // Keep them in sync
            visibleStatus.addEventListener('change', function() {
                hiddenStatus.value = this.value;
            });
        }

        // Sync number_in_book field
        const visibleNumberInBook = document.querySelector('.metadata-panel [name="number_in_book"]');
        const hiddenNumberInBook = document.querySelector('#original-form [name="number_in_book"]');

        if (visibleNumberInBook && hiddenNumberInBook && visibleNumberInBook !== hiddenNumberInBook) {
            // Sync initial values
            if (hiddenNumberInBook.value) {
                visibleNumberInBook.value = hiddenNumberInBook.value;
            }

            // Keep them in sync
            visibleNumberInBook.addEventListener('input', function() {
                hiddenNumberInBook.value = this.value;
            });
        }
    }

    // Text Editor Enhancements
    function initializeTextEditor() {
        const textarea = document.querySelector('.modern-textarea');
        const textSizeInput = document.getElementById('text-size-input');

        // Text size adjustment
        if (textSizeInput && textarea) {
            // Load saved text size
            const savedSize = localStorage.getItem('page-editor-text-size') || '14';
            textSizeInput.value = savedSize;
            textarea.style.fontSize = savedSize + 'px';

            textSizeInput.addEventListener('input', function() {
                const size = this.value;
                textarea.style.fontSize = size + 'px';
                localStorage.setItem('page-editor-text-size', size);
            });
        }


        // Enhanced text selection
        if (textarea) {
            textarea.addEventListener('select', function() {
                const selection = this.value.substring(this.selectionStart, this.selectionEnd);
                if (selection) {
                    updateSelectionInfo(selection);
                }
            });
        }
    }

    // Image Viewer Enhancements
    function initializeImageViewer() {
        const image = document.getElementById('page-image');
        if (!image) return;

        let scale = 1;
        let isDragging = false;
        let startX, startY, scrollLeft, scrollTop;

        // Zoom controls
        document.getElementById('zoomInBtn')?.addEventListener('click', () => {
            scale = Math.min(scale + 0.1, 3);
            image.style.transform = `scale(${scale})`;
        });

        document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
            scale = Math.max(scale - 0.1, 0.5);
            image.style.transform = `scale(${scale})`;
        });

        document.getElementById('fitBtn')?.addEventListener('click', () => {
            scale = 1;
            image.style.transform = `scale(${scale})`;
            const container = image.parentElement;
            container.scrollTop = 0;
            container.scrollLeft = 0;
        });

        // Drag to pan
        const container = image.parentElement;
        container.style.overflow = 'auto';

        image.addEventListener('mousedown', (e) => {
            isDragging = true;
            image.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            startY = e.pageY - container.offsetTop;
            scrollLeft = container.scrollLeft;
            scrollTop = container.scrollTop;
        });

        image.addEventListener('mouseleave', () => {
            isDragging = false;
            image.style.cursor = 'grab';
        });

        image.addEventListener('mouseup', () => {
            isDragging = false;
            image.style.cursor = 'grab';
        });

        image.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const y = e.pageY - container.offsetTop;
            const walkX = (x - startX) * 2;
            const walkY = (y - startY) * 2;
            container.scrollLeft = scrollLeft - walkX;
            container.scrollTop = scrollTop - walkY;
        });

        // Double-click to zoom
        image.addEventListener('dblclick', (e) => {
            if (scale === 1) {
                scale = 2;
            } else {
                scale = 1;
            }
            image.style.transform = `scale(${scale})`;
        });
    }

    // Keyboard Shortcuts
    function initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S - Save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                const saveButton = document.querySelector('button[name="_continue"]');
                if (saveButton) saveButton.click();
            }

            // Alt+Right - Next page
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                const nextButton = document.querySelector('button[name="next_page"]');
                if (nextButton) nextButton.click();
            }

            // Alt+Left - Previous page
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevButton = document.querySelector('button[name="back_page"]');
                if (prevButton) prevButton.click();
            }

            // Ctrl+Plus - Zoom in
            if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                document.getElementById('zoomInBtn')?.click();
            }

            // Ctrl+Minus - Zoom out
            if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                document.getElementById('zoomOutBtn')?.click();
            }

            // ESC - Close panels
            if (e.key === 'Escape') {
                document.getElementById('shortcuts-panel')?.classList.remove('active');
            }
        });
    }

    // Floating Action Buttons
    function initializeFloatingButtons() {
        // Shortcuts FAB
        const shortcutsFab = document.getElementById('shortcuts-fab');
        const shortcutsPanel = document.getElementById('shortcuts-panel');

        shortcutsFab?.addEventListener('click', () => {
            shortcutsPanel?.classList.toggle('active');
        });

        // Note: Save functionality is now handled directly by the form submit button with name="_continue"
    }

    // Undo/Redo Functionality
    function initializeUndoRedo() {
        const textarea = document.querySelector('.modern-textarea');
        if (!textarea) return;

        let history = [];
        let historyIndex = -1;
        let isUpdatingFromHistory = false;

        // Initialize with current value
        if (textarea.value) {
            history.push(textarea.value);
            historyIndex = 0;
        }

        // Save state on significant changes
        let saveTimeout;
        textarea.addEventListener('input', function() {
            // Skip if we're updating from history (undo/redo)
            if (isUpdatingFromHistory) {
                isUpdatingFromHistory = false;
                return;
            }

            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                // Remove any states after current index
                if (historyIndex < history.length - 1) {
                    history = history.slice(0, historyIndex + 1);
                }

                // Only add if different from current state
                const currentValue = textarea.value;
                if (history.length === 0 || history[history.length - 1] !== currentValue) {
                    history.push(currentValue);
                    historyIndex = history.length - 1;

                    // Limit history size
                    if (history.length > 100) {
                        history.shift();
                        historyIndex--;
                    }
                }

                updateUndoRedoButtons();
            }, 300);
        });

        // Undo
        document.getElementById('undoBtn')?.addEventListener('click', () => {
            if (historyIndex > 0) {
                // Save current state if it's not in history
                if (historyIndex === history.length - 1 && textarea.value !== history[historyIndex]) {
                    history[historyIndex] = textarea.value;
                }

                historyIndex--;
                isUpdatingFromHistory = true;
                textarea.value = history[historyIndex];

                // Trigger change event for any listeners
                const event = new Event('input', { bubbles: true });
                textarea.dispatchEvent(event);

                updateUndoRedoButtons();
            }
        });

        // Redo
        document.getElementById('redoBtn')?.addEventListener('click', () => {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                isUpdatingFromHistory = true;
                textarea.value = history[historyIndex];

                // Trigger change event for any listeners
                const event = new Event('input', { bubbles: true });
                textarea.dispatchEvent(event);

                updateUndoRedoButtons();
            }
        });

        // Keyboard shortcuts for undo/redo
        textarea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('undoBtn')?.click();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                document.getElementById('redoBtn')?.click();
            }
        });

        function updateUndoRedoButtons() {
            const undoBtn = document.getElementById('undoBtn');
            const redoBtn = document.getElementById('redoBtn');

            if (undoBtn) {
                const canUndo = historyIndex > 0;
                undoBtn.disabled = !canUndo;
                undoBtn.style.opacity = canUndo ? '1' : '0.4';
                undoBtn.style.cursor = canUndo ? 'pointer' : 'not-allowed';
            }
            if (redoBtn) {
                const canRedo = historyIndex < history.length - 1;
                redoBtn.disabled = !canRedo;
                redoBtn.style.opacity = canRedo ? '1' : '0.4';
                redoBtn.style.cursor = canRedo ? 'pointer' : 'not-allowed';
            }
        }

        // Initial button state
        updateUndoRedoButtons();
    }

    // Initialize Form Buttons
    function initializeFormButtons() {
        // Make FAB buttons trigger the hidden form buttons
        document.querySelectorAll('.fab-container button[type="submit"]').forEach(fabButton => {
            fabButton.addEventListener('click', function(e) {
                e.preventDefault();

                // Find the corresponding hidden button
                const hiddenButton = document.querySelector(`button[name="${this.name}"]:not(.fab)`);
                if (hiddenButton) {
                    console.log('Triggering hidden button:', this.name);
                    hiddenButton.click();
                } else {
                    console.warn('Hidden button not found for:', this.name);
                }
            });
        });
    }

    // Helper Functions
    function getPageId() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 3] || 'unknown';
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function updateSelectionInfo(selection) {
        const words = selection.trim().split(/\s+/).length;
        const chars = selection.length;
        console.log(`Selected: ${words} words, ${chars} characters`);
    }

    // Markdown Formatting Buttons
    function initializeMarkdownButtons() {
        const textarea = document.querySelector('.modern-textarea');
        if (!textarea) return;

        // Bold button
        document.getElementById('boldBtn')?.addEventListener('click', () => {
            wrapSelectedText(textarea, '**', '**');
        });

        // Italic button
        document.getElementById('italicBtn')?.addEventListener('click', () => {
            wrapSelectedText(textarea, '*', '*');
        });

        // Paragraph dropdown toggle
        const dropdownBtn = document.getElementById('paragraphDropdown');
        const dropdownMenu = document.getElementById('paragraphMenu');

        dropdownBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
            // Close other dropdowns
            const footnotesMenu = document.getElementById('footnotesMenu');
            if (footnotesMenu) footnotesMenu.style.display = 'none';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (dropdownMenu && !dropdownMenu.contains(e.target) && e.target !== dropdownBtn) {
                dropdownMenu.style.display = 'none';
            }
        });

        // Paragraph dropdown items
        document.querySelectorAll('#paragraphMenu .dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.currentTarget.getAttribute('data-action');
                applyParagraphStyle(textarea, action);
                dropdownMenu.style.display = 'none';
            });
        });

        // Footnotes dropdown toggle
        const footnotesBtn = document.getElementById('footnotesDropdown');
        const footnotesMenu = document.getElementById('footnotesMenu');

        footnotesBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = footnotesMenu.style.display === 'block';
            footnotesMenu.style.display = isVisible ? 'none' : 'block';
            // Close other dropdowns
            if (dropdownMenu) dropdownMenu.style.display = 'none';
        });

        // Close footnotes dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (footnotesMenu && !footnotesMenu.contains(e.target) && e.target !== footnotesBtn) {
                footnotesMenu.style.display = 'none';
            }
        });

        // Footnotes dropdown items
        document.querySelectorAll('#footnotesMenu .dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.currentTarget.getAttribute('data-action');
                applyFootnoteStyle(textarea, action);
                footnotesMenu.style.display = 'none';
            });
        });

        // Keyboard shortcuts for markdown
        textarea.addEventListener('keydown', (e) => {
            // Ctrl+B - Bold
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                document.getElementById('boldBtn')?.click();
            }

            // Ctrl+I - Italic
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                document.getElementById('italicBtn')?.click();
            }
        });

        function wrapSelectedText(textarea, prefix, suffix) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            const beforeText = textarea.value.substring(0, start);
            const afterText = textarea.value.substring(end);

            if (selectedText) {
                // Check if text is already wrapped
                const beforePrefix = beforeText.slice(-prefix.length);
                const afterSuffix = afterText.slice(0, suffix.length);

                if (beforePrefix === prefix && afterSuffix === suffix) {
                    // Remove wrapping
                    textarea.value = beforeText.slice(0, -prefix.length) + selectedText + afterText.slice(suffix.length);
                    textarea.selectionStart = start - prefix.length;
                    textarea.selectionEnd = end - prefix.length;
                } else {
                    // Add wrapping
                    textarea.value = beforeText + prefix + selectedText + suffix + afterText;
                    textarea.selectionStart = start + prefix.length;
                    textarea.selectionEnd = end + prefix.length;
                }
            } else {
                // No selection, insert markers with cursor between them
                textarea.value = beforeText + prefix + suffix + afterText;
                textarea.selectionStart = start + prefix.length;
                textarea.selectionEnd = start + prefix.length;
            }

            // Trigger input event for undo/redo tracking
            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);

            // Refocus textarea
            textarea.focus();
        }

        function applyParagraphStyle(textarea, style) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;

            // Find the start of the current line
            let lineStart = start;
            while (lineStart > 0 && text[lineStart - 1] !== '\n') {
                lineStart--;
            }

            // Find the end of the current line
            let lineEnd = end;
            while (lineEnd < text.length && text[lineEnd] !== '\n') {
                lineEnd++;
            }

            const beforeLine = text.substring(0, lineStart);
            const currentLine = text.substring(lineStart, lineEnd);
            const afterLine = text.substring(lineEnd);

            let newLine = currentLine;

            // Remove existing heading markers
            newLine = newLine.replace(/^#+\s*/, '');

            // Apply new style
            switch (style) {
                case 'h1':
                    newLine = '# ' + newLine;
                    break;
                case 'h2':
                    newLine = '## ' + newLine;
                    break;
                case 'h3':
                    newLine = '### ' + newLine;
                    break;
                case 'paragraph':
                    // Already removed headers above
                    break;
            }

            textarea.value = beforeLine + newLine + afterLine;

            // Adjust cursor position
            const newCursorPos = lineStart + newLine.length;
            textarea.selectionStart = newCursorPos;
            textarea.selectionEnd = newCursorPos;

            // Trigger input event for undo/redo tracking
            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);

            // Refocus textarea
            textarea.focus();
        }

        function applyFootnoteStyle(textarea, style) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            const beforeText = textarea.value.substring(0, start);
            const afterText = textarea.value.substring(end);

            // Handle simple reference case (no selection needed)
            if (style === 'reference') {
                // Insert [^X] at cursor position
                const reference = '[^X]';
                textarea.value = beforeText + reference + afterText;

                // Select the X so user can type a number
                const xPosition = start + 2; // Position after [^
                textarea.selectionStart = xPosition;
                textarea.selectionEnd = xPosition + 1;

                // Trigger input event for undo/redo tracking
                const event = new Event('input', { bubbles: true });
                textarea.dispatchEvent(event);

                // Refocus textarea
                textarea.focus();

                // Add event listener to replace X when user types
                const replaceHandler = function(e) {
                    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                        e.preventDefault();

                        const currentText = textarea.value;
                        const newChar = e.key;

                        // Replace the X
                        const beforeX = currentText.substring(0, xPosition);
                        const afterX = currentText.substring(xPosition + 1);
                        textarea.value = beforeX + newChar + afterX;

                        // Position cursor after the reference
                        const newCursorPos = xPosition + 1 + 1; // +1 for char, +1 for ]
                        textarea.selectionStart = newCursorPos;
                        textarea.selectionEnd = newCursorPos;

                        // Trigger input event
                        const inputEvent = new Event('input', { bubbles: true });
                        textarea.dispatchEvent(inputEvent);

                        // Remove this event listener after first use
                        textarea.removeEventListener('keydown', replaceHandler);
                    }
                };

                textarea.addEventListener('keydown', replaceHandler);
                return;
            }

            // For other styles, text selection is required
            if (!selectedText) {
                // No text selected, do nothing
                return;
            }

            let prefix = '';
            let suffix = '';

            // Apply style based on action
            switch (style) {
                case 'single':
                    // Одностраничная: [^X]{ text }[^X]
                    prefix = '[^X]{';
                    suffix = '}[^X]';
                    break;
                case 'start':
                    // Начало: [^X]{ text ~[^X]
                    prefix = '[^X]{';
                    suffix = '~[^X]';
                    break;
                case 'continuation':
                    // Продолжение: [^X]~ text ~[^X]
                    prefix = '[^X]~';
                    suffix = '~[^X]';
                    break;
                case 'end':
                    // Окончание: [^X]~ text }[^X]
                    prefix = '[^X]~';
                    suffix = '}[^X]';
                    break;
            }

            // Apply the formatting
            textarea.value = beforeText + prefix + selectedText + suffix + afterText;

            // Select the first X so user can type a number to replace it
            // Find position of first X (it's at position 2 in the prefix: [^X)
            const firstXPosition = start + 2; // Position after [^
            textarea.selectionStart = firstXPosition;
            textarea.selectionEnd = firstXPosition + 1; // Select the X

            // Trigger input event for undo/redo tracking
            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);

            // Refocus textarea
            textarea.focus();

            // Add event listener to replace both X's when user types
            const replaceHandler = function(e) {
                // Only handle single character keys (numbers, letters)
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();

                    const currentText = textarea.value;
                    const newChar = e.key;

                    // Calculate the position of the second X
                    // First X is at: start + 2
                    // After first X: we have "]" + rest of prefix + selectedText + suffix
                    // Second X is in the suffix at position: start + prefix.length + selectedText.length + suffix.indexOf('X')
                    const secondXPosition = start + prefix.length + selectedText.length + suffix.indexOf('X');

                    // Split the text at both X positions
                    const beforeFirstX = currentText.substring(0, firstXPosition);
                    const betweenXs = currentText.substring(firstXPosition + 1, secondXPosition);
                    const afterSecondX = currentText.substring(secondXPosition + 1);

                    // Build new text with both X's replaced
                    textarea.value = beforeFirstX + newChar + betweenXs + newChar + afterSecondX;

                    // Position cursor after the entire footnote
                    const newCursorPos = beforeFirstX.length + newChar.length + betweenXs.length + newChar.length + (suffix.length - suffix.indexOf('X') - 1);
                    textarea.selectionStart = newCursorPos;
                    textarea.selectionEnd = newCursorPos;

                    // Trigger input event
                    const inputEvent = new Event('input', { bubbles: true });
                    textarea.dispatchEvent(inputEvent);

                    // Remove this event listener after first use
                    textarea.removeEventListener('keydown', replaceHandler);
                }
            };

            // Add the event listener
            textarea.addEventListener('keydown', replaceHandler);
        }
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(-100%);
                opacity: 0;
            }
        }

        .page-image {
            cursor: grab;
            transition: transform 0.3s ease;
        }

        .page-image:active {
            cursor: grabbing;
        }

        .custom-dropdown {
            position: relative;
        }

        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 1000;
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #ddd);
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            padding: 0.5rem 0;
            min-width: 160px;
            margin-top: 0.25rem;
        }

        .dropdown-item {
            padding: 0.5rem 1rem;
            color: var(--text-color, #333);
            text-decoration: none;
            display: block;
            transition: background-color 0.2s;
            cursor: pointer;
        }

        .dropdown-item:hover {
            background-color: var(--hover-bg, #f5f5f5);
            color: var(--text-color, #333);
        }

        /* Dark mode support for dropdown */
        body.dark-mode .dropdown-menu {
            background: var(--card-bg);
            border-color: var(--border-color);
        }

        body.dark-mode .dropdown-item {
            color: var(--text-color);
        }

        body.dark-mode .dropdown-item:hover {
            background-color: var(--toolbar-bg);
        }
    `;
    document.head.appendChild(style);

});
