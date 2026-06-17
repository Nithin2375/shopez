import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProducts, getCategories } from '../services/productService';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('featured');

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || 'All';
  const maxPrice = Number(searchParams.get('maxPrice')) || 2000;

  useEffect(() => {
    // Fetch unique categories from the database
    getCategories()
      .then((res) => {
        if (res.data.success) {
          setCategories(['All', ...res.data.categories]);
        }
      })
      .catch((err) => console.error("Categories Fetch Error:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({ keyword, category: category === 'All' ? undefined : category, maxPrice, limit: 24 })
      .then((res) => setProducts(res.data.products || []))
      .catch((err) => {console.error("Products API Error:",err);
        setProducts([])})
      .finally(() => setLoading(false));
  }, [keyword, category, maxPrice]);

  const visibleProducts = useMemo(() => {
    let result = products;

    if (category !== 'All') {
      result = result.filter((product) => product.category === category);
    }

    if (keyword) {
      result = result.filter((product) => product.name.toLowerCase().includes(keyword.toLowerCase()));
    }

    result = result.filter((product) => product.price <= maxPrice);

    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'rating') result = [...result].sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));

    return result;
  }, [products, category, keyword, maxPrice, sort]);

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value && value !== 'All') params[key] = value;
    else delete params[key];
    setSearchParams(params);
  };

  return (
    <main className="page">
      <div className="container catalog-layout">
        <aside className="panel filters">
          <h2>Filters</h2>
          <hr />

          <div className="filter-title">Categories</div>
          <div className="category-list">
            {categories.map((item) => (
              <button
                className={`category-button ${category === item ? 'active' : ''}`}
                key={item}
                type="button"
                onClick={() => updateParam('category', item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="filter-title">Max Price</div>
          <div className="price-row">
            <span />
            <span style={{ color: 'var(--primary)' }}>₹{maxPrice}</span>
          </div>
          <input
            className="range"
            type="range"
            min="100"
            max="2000"
            step="50"
            value={maxPrice}
            onChange={(event) => updateParam('maxPrice', event.target.value)}
          />
          <div className="price-row">
            <span>₹0</span>
            <span>₹2000</span>
          </div>

          <button className="button full" type="button" style={{ marginTop: 34 }} onClick={() => setSearchParams({})}>
            Reset Filters
          </button>
        </aside>

        <section className="catalog-main">
          <div className="panel catalog-toolbar">
            <div className="muted">
              Showing <strong style={{ color: 'var(--text)' }}>{visibleProducts.length}</strong> items
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span className="muted">Sort by:</span>
              <select className="select" value={sort} style={{ width: 'auto', minWidth: 160 }} onChange={(event) => setSort(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </label>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : visibleProducts.length ? (
            <div className="products-grid">
              {visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          ) : (
            <div className="panel" style={{ padding: 42, textAlign: 'center' }}>
              <h2>No products found</h2>
              <p className="muted">Try another category, search term, or price.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
