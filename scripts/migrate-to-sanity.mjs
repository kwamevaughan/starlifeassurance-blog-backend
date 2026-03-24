/**
 * Migration script: Supabase → Sanity
 *
 * Usage:
 *   node scripts/migrate-to-sanity.mjs
 *
 * Prerequisites:
 *   npm install @sanity/client node-fetch cheerio dotenv
 */

import { createClient as createSanityClient } from '@sanity/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import { load } from 'cheerio'
import 'dotenv/config'

// ─── Clients ─────────────────────────────────────────────────────────────────

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomKey() {
  return Math.random().toString(36).slice(2, 10)
}

function slugify(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ─── HTML → Portable Text ─────────────────────────────────────────────────────

function htmlToPortableText(html) {
  if (!html) return []

  const $ = load(html)
  const blocks = []

  const styleMap = { h1:'h1', h2:'h2', h3:'h3', h4:'h4', h5:'h5', h6:'h6', p:'normal', blockquote:'blockquote' }
  const markMap  = { strong:'strong', b:'strong', em:'em', i:'em', u:'underline', s:'strike-through', strike:'strike-through', del:'strike-through', code:'code' }

  function extractSpans(node, inheritedMarks = []) {
    const spans = []
    $(node).contents().each((_, child) => {
      if (child.type === 'text') {
        if (child.data) spans.push({ _type:'span', _key:randomKey(), text:child.data, marks:[...inheritedMarks] })
      } else if (child.type === 'tag') {
        const tag = child.name.toLowerCase()
        if (tag === 'a') {
          const href = $(child).attr('href') || ''
          const markKey = randomKey()
          const linkMark = { _type:'link', _key:markKey, href, blank:true }
          const childSpans = extractSpans(child, [...inheritedMarks, markKey])
          childSpans.forEach(s => s._linkDef = linkMark)
          spans.push(...childSpans)
        } else if (tag === 'br') {
          spans.push({ _type:'span', _key:randomKey(), text:'\n', marks:[...inheritedMarks] })
        } else if (markMap[tag]) {
          spans.push(...extractSpans(child, [...inheritedMarks, markMap[tag]]))
        } else {
          spans.push(...extractSpans(child, inheritedMarks))
        }
      }
    })
    return spans
  }

  function buildBlock(el, style = 'normal', listItem = null, level = 1) {
    const spans = extractSpans(el)
    const markDefs = []
    spans.forEach(span => { if (span._linkDef) { markDefs.push(span._linkDef); delete span._linkDef } })
    const block = {
      _type: 'block', _key: randomKey(), style, markDefs,
      children: spans.length > 0 ? spans : [{ _type:'span', _key:randomKey(), text:'', marks:[] }],
    }
    if (listItem) { block.listItem = listItem; block.level = level }
    return block
  }

  function processListItems(listEl, listType, level = 1) {
    $(listEl).children('li').each((_, li) => {
      const liClone = $(li).clone()
      liClone.find('ul, ol').remove()
      blocks.push(buildBlock(liClone, 'normal', listType, level))
      $(li).children('ul').each((_, n) => processListItems(n, 'bullet', level + 1))
      $(li).children('ol').each((_, n) => processListItems(n, 'number', level + 1))
    })
  }

  $('body').children().each((_, el) => {
    const tag = el.name?.toLowerCase()
    if (!tag) return

    if (styleMap[tag]) {
      blocks.push(buildBlock(el, styleMap[tag]))
    } else if (tag === 'ul') {
      processListItems(el, 'bullet')
    } else if (tag === 'ol') {
      processListItems(el, 'number')
    } else if (tag === 'pre') {
      blocks.push({ _type:'block', _key:randomKey(), style:'normal', markDefs:[],
        children:[{ _type:'span', _key:randomKey(), text:$(el).text(), marks:['code'] }] })
    } else if (tag === 'img') {
      const src = $(el).attr('src')
      if (src) blocks.push({ _type:'imageUrl', _key:randomKey(), url:src })
    } else if (tag === 'figure') {
      const src = $(el).find('img').attr('src')
      if (src) blocks.push({ _type:'imageUrl', _key:randomKey(), url:src })
    } else if (['div','section','article'].includes(tag)) {
      $(el).children().each((_, child) => {
        const ct = child.name?.toLowerCase()
        if (!ct) return
        if (styleMap[ct]) blocks.push(buildBlock(child, styleMap[ct]))
        else if (ct === 'ul') processListItems(child, 'bullet')
        else if (ct === 'ol') processListItems(child, 'number')
      })
    } else {
      const text = $(el).text().trim()
      if (text) blocks.push(buildBlock(el, 'normal'))
    }
  })

  return blocks
}

// ─── Image upload ─────────────────────────────────────────────────────────────

async function uploadImageToSanity(imageUrl) {
  if (!imageUrl || imageUrl.startsWith('/')) return null
  try {
    console.log(`  ↑ Uploading: ${imageUrl.slice(0, 80)}...`)
    const res = await fetch(imageUrl)
    if (!res.ok) { console.warn(`  ✗ Fetch failed (${res.status})`); return null }

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    // node-fetch v3 uses arrayBuffer(), not buffer()
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const asset = await sanity.assets.upload('image', buffer, {
      contentType,
      filename: imageUrl.split('/').pop().split('?')[0] || 'image.jpg',
    })
    return { _type:'image', asset:{ _type:'reference', _ref:asset._id } }
  } catch (err) {
    console.warn(`  ✗ Upload failed: ${err.message}`)
    return null
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function migrate() {
  console.log('\n🚀 Starting Supabase → Sanity migration\n')

  for (const key of ['NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','NEXT_PUBLIC_SANITY_PROJECT_ID','SANITY_API_TOKEN']) {
    if (!process.env[key]) { console.error(`❌ Missing env var: ${key}`); process.exit(1) }
  }

  // 1. Fetch from Supabase
  console.log('📥 Fetching from Supabase...')
  const { data: categories, error: catErr } = await supabase.from('blog_categories').select('id, name, slug').order('name')
  if (catErr) throw catErr
  console.log(`  ✓ ${categories.length} categories`)

  const { data: tags, error: tagErr } = await supabase.from('blog_tags').select('id, name, slug').order('name')
  if (tagErr) throw tagErr
  console.log(`  ✓ ${tags.length} tags`)

  const { data: posts, error: postErr } = await supabase
    .from('blogs')
    .select(`id, article_name, article_body, article_image, excerpt, slug,
      is_published, is_draft, author, publish_date, created_at,
      meta_title, meta_description, meta_keywords, focus_keyword, category_id,
      author_details:hr_users(name, username),
      post_tags:blog_post_tags(tag_id)`)
    .order('created_at', { ascending: true })
  if (postErr) throw postErr
  console.log(`  ✓ ${posts.length} posts\n`)

  // 2. Categories
  console.log('📁 Migrating categories...')
  const categoryIdMap = {}
  for (const cat of categories) {
    const doc = { _type:'category', _id:`category-${cat.id}`, title:cat.name, slug:{ _type:'slug', current:cat.slug || slugify(cat.name) } }
    await sanity.createOrReplace(doc)
    categoryIdMap[cat.id] = doc._id
    console.log(`  ✓ ${cat.name}`)
  }

  // 3. Tags
  console.log('\n🏷️  Migrating tags...')
  const tagIdMap = {}
  for (const tag of tags) {
    const doc = { _type:'tag', _id:`tag-${tag.id}`, title:tag.name, slug:{ _type:'slug', current:tag.slug || slugify(tag.name) } }
    await sanity.createOrReplace(doc)
    tagIdMap[tag.id] = doc._id
    console.log(`  ✓ ${tag.name}`)
  }

  // 4. Posts
  console.log(`\n📝 Migrating ${posts.length} posts...\n`)
  let success = 0, failed = 0

  for (const post of posts) {
    try {
      console.log(`→ "${post.article_name}"`)

      const bodyBlocks = htmlToPortableText(post.article_body || '')
      const resolvedBody = []
      for (const block of bodyBlocks) {
        if (block._type === 'imageUrl') {
          const uploaded = await uploadImageToSanity(block.url)
          if (uploaded) resolvedBody.push({ ...uploaded, _key:block._key })
        } else {
          resolvedBody.push(block)
        }
      }

      const featuredImage = post.article_image ? await uploadImageToSanity(post.article_image) : null

      const tagRefs = (post.post_tags || [])
        .filter(pt => tagIdMap[pt.tag_id])
        .map(pt => ({ _type:'reference', _ref:tagIdMap[pt.tag_id], _key:randomKey() }))

      const authorName = post.author_details?.name || post.author_details?.username || post.author || 'StarLife Admin'

      const sanityPost = {
        _type: 'post',
        _id: `post-${post.id}`,
        title: post.article_name,
        slug: { _type:'slug', current: post.slug || slugify(post.article_name) },
        author: authorName,
        excerpt: post.excerpt || '',
        body: resolvedBody,
        isPublished: post.is_published || false,
        isDraft: post.is_draft !== false,
        publishDate: post.publish_date || post.created_at,
        metaTitle: post.meta_title || post.article_name,
        metaDescription: post.meta_description || '',
        metaKeywords: post.meta_keywords || '',
        focusKeyword: post.focus_keyword || '',
        legacyId: String(post.id),
        createdAt: post.created_at,
        ...(featuredImage && { featuredImage }),
        ...(post.category_id && categoryIdMap[post.category_id] && {
          category: { _type:'reference', _ref:categoryIdMap[post.category_id] }
        }),
        ...(tagRefs.length > 0 && { tags: tagRefs }),
      }

      await sanity.createOrReplace(sanityPost)
      console.log(`  ✓ Done\n`)
      success++
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}\n`)
      failed++
    }
  }

  console.log('─'.repeat(50))
  console.log(`✅ Migration complete`)
  console.log(`   Posts:      ${success} succeeded, ${failed} failed`)
  console.log(`   Categories: ${categories.length}`)
  console.log(`   Tags:       ${tags.length}`)
  console.log('─'.repeat(50))
}

migrate().catch(err => { console.error('\n❌ Migration failed:', err); process.exit(1) })
