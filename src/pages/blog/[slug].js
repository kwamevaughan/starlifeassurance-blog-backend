// Individual blog post page
import React from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function BlogPost({ post, relatedPosts }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>{post.meta_title || post.article_name} | StarLife Assurance</title>
        <meta name="description" content={post.meta_description} />
        <meta property="og:title" content={post.meta_title || post.article_name} />
        <meta property="og:description" content={post.meta_description} />
        {post.article_image && <meta property="og:image" content={post.article_image} />}
        <meta property="og:type" content="article" />
        <link rel="stylesheet" href="/css/news-styles.css" />
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="blog-post-page">
        {/* Navigation */}
        <section className="nav-section alt">
          <div className="navbar w-nav">
            <div className="container nav w-container">
              <a href="/" className="brand w-nav-brand"></a>
              <nav role="navigation" className="nav--menu-wrapper w-nav-menu">
                <div className="div-block">
                  <div className="nav-column links">
                    <a href="/" className="nav-label w-inline-block">
                      <img src="/images/Icon-Set-09.svg" loading="lazy" alt="" className="nav-link-icon" />
                      <div>Home</div>
                    </a>
                    <a href="/about" className="nav-label w-inline-block">
                      <img src="/images/Icon-Set-10.svg" loading="lazy" alt="" className="nav-link-icon" />
                      <div>About us</div>
                    </a>
                    <a href="/solutions/corporate-products" className="nav-label w-inline-block">
                      <img src="/images/Icon-Set-14.svg" loading="lazy" alt="" className="nav-link-icon" />
                      <div>Solutions</div>
                    </a>
                    <a href="https://clientonboarding.starlifeassurance.com/" className="nav-label w-inline-block">
                      <img src="/images/Icon-Set-16.svg" loading="lazy" alt="" className="nav-link-icon" />
                      <div>Claims</div>
                    </a>
                    <a href="https://clientonboarding.starlifeassurance.com/" target="_blank" className="nav-label w-inline-block">
                      <img src="/images/Icon-Set-15.svg" loading="lazy" alt="" className="nav-link-icon" />
                      <div>Pay Online</div>
                    </a>
                    <a href="https://clientonboarding.starlifeassurance.com/" target="_blank" className="nav-label w-inline-block">
                      <img src="/images/Icon-Set-17.svg" loading="lazy" alt="" className="nav-link-icon" />
                      <div>Portal</div>
                    </a>
                    <a href="/news" className="nav-label w-inline-block">
                      <img src="/images/Icon-Set-12.svg" loading="lazy" alt="" className="nav-link-icon" />
                      <div>News</div>
                    </a>
                    <a href="/social-impact" className="nav-label w-inline-block">
                      <img src="/images/Icon-Set-13.svg" loading="lazy" alt="" className="nav-link-icon" />
                      <div>Contact</div>
                    </a>
                  </div>
                </div>
              </nav>
              <a href="tel:+233302739600" className="nav-tel w-inline-block">
                <img src="/images/ico-phone.png" loading="lazy" alt="" className="icons nav" />
                <div className="nav-contact-label">+233 30 273 9600</div>
              </a>
            </div>
          </div>
        </section>

        {/* Blog Post Content */}
        <section className="sub-section blog-post">
          <div className="w-layout-blockcontainer container w-container">
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <a href="/" className="breadcrumb-link">Home</a>
              <span> / </span>
              <a href="/news" className="breadcrumb-link">News</a>
              <span> / </span>
              <span className="breadcrumb-current">{post.article_name}</span>
            </div>

            {/* Article Header */}
            <div className="blog-post-header">
              <h1 className="blog-post-title">{post.article_name}</h1>
              <div className="blog-post-meta">
                <div className="blog-tags">By {post.author || 'StarLife Admin'}</div>
                <div className="blog-tags">{formatDate(post.created_at)}</div>
                {post.category_name && <div className="blog-tags">{post.category_name}</div>}
              </div>
              {post.article_image && (
                <div className="blog-post-featured-image">
                  <img 
                    src={post.article_image} 
                    alt={post.article_name}
                    style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="blog-post-content">
              <div 
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: post.article_body || post.content }}
              />
            </div>

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="related-posts">
                <h3 className="heading-3">Related Articles</h3>
                <div className="w-layout-grid grid-news">
                  {relatedPosts.map((relatedPost) => (
                    <div key={relatedPost.id} className="grid-block news">
                      <div className="news-column-item">
                        <h4 className="heading-4">{relatedPost.article_name}</h4>
                        <p>{relatedPost.meta_description}</p>
                        <div className="news-column-cta-block">
                          <a href={`/blog/${relatedPost.slug}`} className="button-primary news explore w-button">Read more</a>
                          <div className="news-date">{formatDate(relatedPost.created_at)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back to News */}
            <div className="back-to-news">
              <a href="/news" className="button-primary w-button">← Back to News</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="section footer">
          <div className="w-layout-blockcontainer container w-container">
            <div className="w-layout-grid grid-footer">
              <div className="grid-block footer">
                <h4 className="footer-h4">About Us</h4>
                <a href="/about" className="footer-link">Overview</a>
                <a href="/about/team" className="footer-link">Teams</a>
                <a href="/news" className="footer-link">News</a>
                <a href="/social-impact" className="footer-link">Social Impact</a>
                <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
                <a href="/disclaimer" className="footer-link">Disclaimer</a>
              </div>
              <div className="grid-block footer">
                <h4 className="footer-h4">Quick links</h4>
                <a href="/solutions/corporate-products" className="footer-link">Solutions</a>
                <a href="https://clientonboarding.starlifeassurance.com/" target="_blank" className="footer-link">Pay Online</a>
                <a href="https://clientonboarding.starlifeassurance.com/" target="_blank" className="footer-link">Claims</a>
                <a href="https://clientonboarding.starlifeassurance.com/" target="_blank" className="footer-link">Portal</a>
              </div>
              <div className="grid-block footer">
                <h4 className="footer-h4">Location</h4>
                <div className="footer-location-wrapper">
                  <img src="/images/ico-location.png" loading="lazy" alt="" className="icons" />
                  <a href="#" className="footer-link">No. 3 Mankata Avenue, Behind<br />National Service Secretariat,<br />Airport Residential Area</a>
                </div>
                <div className="footer-location-wrapper">
                  <img src="/images/ico-mailbox.png" loading="lazy" alt="" className="icons" />
                  <a href="#" className="footer-link">P.O. Box AN 5783 , Accra – North Ghana</a>
                </div>
                <a href="tel:+233302739600" className="footer-location-wrapper w-inline-block">
                  <img src="/images/ico-phone.png" loading="lazy" alt="" className="icons" />
                  <div className="footer-link">+233 30 273 9600</div>
                </a>
              </div>
              <div className="grid-block social">
                <h4 className="footer-h4">Follow us on</h4>
                <div className="footer-social-block">
                  <a href="https://x.com/starlifegh" target="_blank" className="social-link w-inline-block">
                    <img src="/images/ico-x.png" loading="lazy" alt="" className="social-ico" />
                  </a>
                  <a href="https://www.linkedin.com/company/starlife-assurance/" target="_blank" className="social-link w-inline-block">
                    <img src="/images/ico-linkedin.png" loading="lazy" alt="" className="social-ico" />
                  </a>
                  <a href="https://www.instagram.com/starlife_assurance/" target="_blank" className="social-link w-inline-block">
                    <img src="/images/ico-instagram.png" loading="lazy" alt="" className="social-ico" />
                  </a>
                  <a href="https://web.facebook.com/starlifeassurance" target="_blank" className="social-link w-inline-block">
                    <img src="/images/ico-facebook.png" loading="lazy" alt="" className="social-ico" />
                  </a>
                </div>
              </div>
            </div>
            <div className="footer-copyright-block">
              <img src="/images/Star-Life-Logo-White.svg" loading="lazy" alt="" className="footer-brand" />
              <div className="footer-brand-label">2025 Starlife Assurance</div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  try {
    // Get all published blog post slugs
    const { data: posts, error } = await supabase
      .from('blogs')
      .select('slug')
      .eq('is_published', true);

    if (error) throw error;

    const paths = posts.map((post) => ({
      params: { slug: post.slug }
    }));

    return {
      paths,
      fallback: 'blocking' // Enable ISR for new posts
    };
  } catch (error) {
    console.error('Error fetching blog paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    // Fetch the specific blog post
    const { data: post, error: postError } = await supabase
      .from('blogs')
      .select(`
        *,
        blog_categories (
          name
        )
      `)
      .eq('slug', params.slug)
      .eq('is_published', true)
      .single();

    if (postError || !post) {
      return {
        notFound: true
      };
    }

    // Fetch related posts (same category, excluding current post)
    const { data: relatedPosts } = await supabase
      .from('blogs')
      .select(`
        id,
        article_name,
        slug,
        meta_description,
        created_at
      `)
      .eq('category_id', post.category_id)
      .eq('is_published', true)
      .neq('id', post.id)
      .limit(3);

    return {
      props: {
        post: {
          ...post,
          category_name: post.blog_categories?.name || null
        },
        relatedPosts: relatedPosts || []
      },
      revalidate: 3600 // Regenerate every hour
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return {
      notFound: true
    };
  }
}