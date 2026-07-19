import { createClient } from './server'

export async function getProducts(filters?: { category?: string; gender?: string; search?: string; limit?: number; offset?: number }) {
  const supabase = await createClient()
  let query = supabase.from('products').select('*, categories(name, slug), product_images(image_url, is_primary)')
    .eq('is_active', true)

  if (filters?.category) query = query.eq('categories.slug', filters.category)
  if (filters?.gender) query = query.eq('gender', filters.gender)
  if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)

  query = query.order('created_at', { ascending: false })

  if (filters?.limit) query = query.limit(filters.limit)
  if (filters?.offset) query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 12) - 1)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug), product_images(*), product_sizes(*), fragrance_notes(*)')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

export async function getFeaturedProducts(limit = 4) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit)

  if (error) throw error
  return data
}

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw error
  return data
}

export async function getCollections() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collections')
    .select('*, collection_products(*, products(name, slug))')
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw error
  return data
}

export async function getCollectionBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collections')
    .select('*, collection_products(*, products(*, categories(name, slug)))')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data
}

export async function getBlogPosts(filters?: { category?: string; limit?: number }) {
  const supabase = await createClient()
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

export async function getProductReviews(productId: string, limit = 10) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getRelatedProducts(productId: string, limit = 4) {
  const supabase = await createClient()
  const product = await supabase.from('products').select('category_id').eq('id', productId).single()
  if (product.error || !product.data) return []

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .eq('category_id', product.data.category_id)
    .neq('id', productId)
    .limit(limit)

  if (error) throw error
  return data
}

export async function getShopProducts(filters?: {
  category?: string; gender?: string; search?: string;
  minPrice?: number; maxPrice?: number;
  sort?: string; limit?: number; offset?: number;
}) {
  const supabase = await createClient()
  let query = supabase.from('products').select('*, categories(name, slug), product_images(image_url, is_primary), product_sizes(size_ml, price)')
    .eq('is_active', true)

  if (filters?.category) query = query.eq('categories.slug', filters.category)
  if (filters?.gender) query = query.eq('gender', filters.gender)
  if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  if (filters?.minPrice) query = query.gte('price', filters.minPrice)
  if (filters?.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters?.sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (filters?.sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (filters?.sort === 'rating') query = query.order('rating', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  if (filters?.limit) query = query.limit(filters.limit)
  if (filters?.offset) query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 12) - 1)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getShopProductsCount(filters?: {
  category?: string; gender?: string; search?: string;
  minPrice?: number; maxPrice?: number; sizes?: string[];
}) {
  const supabase = await createClient()
  let query = supabase.from('products').select('id, product_sizes(size_ml)', { count: 'exact', head: true }).eq('is_active', true)

  if (filters?.category) query = query.eq('categories.slug', filters.category)
  if (filters?.gender) query = query.eq('gender', filters.gender)
  if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  if (filters?.minPrice) query = query.gte('price', filters.minPrice)
  if (filters?.maxPrice) query = query.lte('price', filters.maxPrice)

  const { count, error } = await query
  if (error) throw error

  if (!filters?.sizes?.length) return count || 0

  const { data: allProducts } = await supabase
    .from('products')
    .select('id, product_sizes(size_ml)')
    .eq('is_active', true)

  if (!allProducts) return count || 0

  const sizeFilters = filters.sizes.map(s => parseInt(s.replace('ml', '')))
  const filteredCount = allProducts.filter(p =>
    p.product_sizes?.some((s: { size_ml: number }) => sizeFilters.includes(s.size_ml))
  ).length

  return filteredCount
}
