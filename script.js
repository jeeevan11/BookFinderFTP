
        class BookLibrary {
            constructor() {
                this.savedBooks = JSON.parse(localStorage.getItem('savedBooks')) || [];
                this.currentTab = 'search';
                this.initializeEventListeners();
                this.displaySavedBooks();
            }

            initializeEventListeners() {
                document.getElementById('searchButton').addEventListener('click', () => this.searchBooks());
                document.getElementById('searchInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.searchBooks();
                });

                // Tab switching
                document.querySelectorAll('.tab-button').forEach(button => {
                    button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
                });
            }

            async searchBooks() {
                const query = document.getElementById('searchInput').value;
                if (!query) return;

                try {
                    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
                    const data = await response.json();
                    this.displaySearchResults(data.items || []);
                } catch (error) {
                    console.error('Error fetching books:', error);
                }
            }

            displaySearchResults(books) {
                const container = document.getElementById('searchResults');
                container.innerHTML = '';

                books.forEach(book => {
                    const bookCard = this.createBookCard(book, true);
                    container.appendChild(bookCard);
                });
            }

            displaySavedBooks() {
                const container = document.getElementById('savedBooks');
                container.innerHTML = '';

                this.savedBooks.forEach(book => {
                    const bookCard = this.createBookCard(book, false);
                    container.appendChild(bookCard);
                });
            }

            createBookCard(book, isSearchResult) {
                const bookData = isSearchResult ? book.volumeInfo : book;
                const bookId = isSearchResult ? book.id : book.id;

                const card = document.createElement('div');
                card.className = 'book-card';
                
                const thumbnail = isSearchResult 
                    ? bookData.imageLinks?.thumbnail 
                    : bookData.thumbnail;

                card.innerHTML = `
                    <img src="${thumbnail || 'https://via.placeholder.com/128x192'}" alt="Book cover">
                    <div class="book-title">${bookData.title}</div>
                    <div class="book-author">${bookData.authors?.join(', ') || 'Unknown Author'}</div>
                    <button class="${isSearchResult ? 'save-button' : 'remove-button'}">
                        ${isSearchResult ? 'Save to Library' : 'Remove from Library'}
                    </button>
                `;

                const button = card.querySelector('button');
                button.addEventListener('click', () => {
                    if (isSearchResult) {
                        this.saveBook(book);
                    } else {
                        this.removeBook(bookId);
                    }
                });

                return card;
            }

            saveBook(book) {
                const bookData = {
                    id: book.id,
                    title: book.volumeInfo.title,
                    authors: book.volumeInfo.authors || ['Unknown Author'],
                    thumbnail: book.volumeInfo.imageLinks?.thumbnail
                };

                if (!this.savedBooks.some(b => b.id === book.id)) {
                    this.savedBooks.push(bookData);
                    this.updateLocalStorage();
                    this.displaySavedBooks();
                }
            }

            removeBook(bookId) {
                this.savedBooks = this.savedBooks.filter(book => book.id !== bookId);
                this.updateLocalStorage();
                this.displaySavedBooks();
            }

            switchTab(tab) {
                this.currentTab = tab;
                document.querySelectorAll('.tab-button').forEach(button => {
                    button.classList.toggle('active', button.dataset.tab === tab);
                });
                document.getElementById('searchResults').style.display = tab === 'search' ? 'grid' : 'none';
                document.getElementById('savedBooks').style.display = tab === 'saved' ? 'grid' : 'none';
            }

            updateLocalStorage() {
                localStorage.setItem('savedBooks', JSON.stringify(this.savedBooks));
            }
        }

        // Initialize the library
        const library = new BookLibrary();