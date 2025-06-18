'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface Book {
  id: number;
  title: string;
  price: number;
  category: string;
  availability: string;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const student = localStorage.getItem('student');
    if (!student) {
      router.push('/login');
    } else {
      loadFavorites();
    }
  }, [router]);

  const loadFavorites = async () => {
    try {
      const student = JSON.parse(localStorage.getItem('student') || '{}');
      if (!student.id) {
        toast.error('No student ID found. Please log in again.');
        router.push('/login');
        return;
      }
      const res = await axios.get(`http://localhost:8008/favorites`, {
        params: { studentId: student.id },
      });
      const favoriteIds = res.data.map((fav: any) => fav.bookId);
      setFavorites(favoriteIds);
      console.log('Loaded favorites:', favoriteIds); // Debug log
    } catch (err) {
      console.error('Error loading favorites:', err);
      toast.error('Failed to load favorites');
    }
  };

  const handleScrapeBooks = async () => {
    try {
      setLoading(true);
      await axios.get('http://localhost:8000/scrape-books');
      const res = await axios.get('http://localhost:8000/recommendations');
      const booksData = res.data.map((book: Book, index: number) => ({
        ...book,
        id: book.id || index + 1, // Fallback ID if book.id is missing
      }));
      setBooks(booksData);
      console.log('Loaded books:', booksData); // Debug log
      toast.success('Books scraped successfully!');
    } catch (err) {
      toast.error('Failed to scrape books');
      console.error('Error scraping books:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBookSummary = async (title: string) => {
    try {
      const res = await axios.get(`http://localhost:8000/books/summary?title=${encodeURIComponent(title)}`);
      toast.info(res.data.summary, { autoClose: 10000 });
    } catch (err) {
      toast.error('Failed to get summary');
      console.error('Error getting summary:', err);
    }
  };

  const toggleFavorite = async (bookId: number) => {
    if (!Number.isInteger(bookId)) {
      toast.error('Invalid book ID');
      console.error('Invalid bookId:', bookId);
      return;
    }
    try {
      const student = JSON.parse(localStorage.getItem('student') || '{}');
      if (!student.id) {
        toast.error('No student ID found. Please log in again.');
        router.push('/login');
        return;
      }
      console.log('Toggling favorite for bookId:', bookId, 'studentId:', student.id); // Debug log
      if (favorites.includes(bookId)) {
        await axios.delete(`http://localhost:8008/favorites`, {
          params: {
            bookId: bookId,
            studentId: student.id,
          },
        });
        setFavorites(favorites.filter((id) => id !== bookId));
        toast.success('Removed from favorites');
      } else {
        await axios.post('http://localhost:8008/favorites', {
          bookId: bookId,
          studentId: student.id,
        });
        setFavorites([...favorites, bookId]);
        toast.success('Added to favorites');
      }
      console.log('Updated favorites:', favorites); // Debug log
    } catch (err) {
      toast.error('Failed to update favorites');
      console.error('Error updating favorites:', err);
    }
  };

  return (
    <div className="books-container">
      <div className="header">
        <h1>Recommended Books</h1>
        <button onClick={handleScrapeBooks} disabled={loading}>
          {loading ? 'Scraping...' : 'Scrape Books'}
        </button>
      </div>

      {books.length > 0 ? (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <h2>{book.title}</h2>
              <p>Price: ${book.price}</p>
              <p>Category: {book.category}</p>
              <p>Availability: {book.availability}</p>
              <div className="book-actions">
                <button onClick={() => getBookSummary(book.title)}>Get Summary</button>
                <button
                  onClick={() => toggleFavorite(book.id)}
                  className={`favorite-btn ${favorites.includes(book.id) ? 'favorited' : ''}`}
                >
                  {favorites.includes(book.id) ? '❤️' : '♡'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-books">
          <p>
            {loading ? 'Loading books...' : 'No books available. Click "Scrape Books" to load recommendations.'}
          </p>
        </div>
      )}

      <style jsx>{`
        .books-container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        h1 {
          font-size: 24px;
          font-weight: bold;
        }
        button {
          background-color: #6b46c1;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        .book-card {
          border: 1px solid #ccc;
          padding: 16px;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        .book-card h2 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .book-card p {
          margin: 4px 0;
          color: #555;
        }
        .book-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
        .book-actions button {
          font-size: 14px;
          padding: 6px 12px;
        }
        .book-actions button:first-child {
          background-color: #2563eb;
        }
        .book-actions button:first-child:hover {
          background-color: #1d4ed8;
        }
        .favorite-btn {
          background-color: #f0f0f0;
          color: #333;
        }
        .favorite-btn.favorited {
          background-color: #ff4081;
          color: white;
        }
        .no-books {
          text-align: center;
          padding: 40px 0;
          color: #999;
        }
      `}</style>
    </div>
  );
}