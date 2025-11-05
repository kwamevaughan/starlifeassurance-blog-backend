// Public-facing news page - Exact replica of original with dynamic content
import React, { useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';

export default function NewsPage({ topNews, moreNews }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Load the original JavaScript functionality
  useEffect(() => {
    // Load WebFont
    if (typeof window !== 'undefined' && window.WebFont) {
      window.WebFont.load({
        google: {
          families: ["Work Sans:regular,500,600,700,800"]
        }
      });
    }

    // Load the original JavaScript file
    const script = document.createElement('script');
    script.src = '/js/starlifeassurance.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>News | StarLife Assurance</title>
        <meta content="StarLife Assurance Limited Company is a leading Life Assurance Company offering a wide range of need -based life assurance products designed to meet the financial security needs of the insuring public." name="description" />
        <meta content="News | StarLife Assurance" property="og:title" />
        <meta content="StarLife Assurance Limited Company is a leading Life Assurance Company offering a wide range of need -based life assurance products designed to meet the financial security needs of the insuring public." property="og:description" />
        <meta content="News | StarLife Assurance" property="twitter:title" />
        <meta content="StarLife Assurance Limited Company is a leading Life Assurance Company offering a wide range of need -based life assurance products designed to meet the financial security needs of the insuring public." property="twitter:description" />
        <meta property="og:type" content="website" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link href="/css/normalize.css" rel="stylesheet" type="text/css" />
        <link href="/css/components.css" rel="stylesheet" type="text/css" />
        <link href="/css/starlifeassurance.css" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"></script>
        <script type="text/javascript" dangerouslySetInnerHTML={{
          __html: `WebFont.load({  google: {    families: ["Work Sans:regular,500,600,700,800"]  }});`
        }} />
        <script type="text/javascript" dangerouslySetInnerHTML={{
          __html: `!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`
        }} />
        <link href="/images/favicon.png" rel="shortcut icon" type="image/x-icon" />
        <link href="/images/webclip.png" rel="apple-touch-icon" />
      </Head>

      <section className="nav-section alt">
          <div data-animation="over-left" data-collapse="all" data-duration="400" data-easing="ease" data-easing2="ease" data-doc-height="1" role="banner" className="navbar w-nav">
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
                    <a href="/news" aria-current="page" className="nav-label w-inline-block w--current">
                      <img src="/images/Icon-Set-12.svg" loading="lazy" alt="" className="nav-link-icon" />
                      <div>News</div>
                    </a>
                    <a href="/social-impact" className="nav-label w-inline-block">
                      <img src="/images/Icon-Set-13.svg" loading="lazy" alt="" className="nav-link-icon" />
                      <div>Social Impact</div>
                    </a>
                    <a href="/contact" className="nav-label w-inline-block">
                      <img src="/images/Icon-Set-11.svg" loading="lazy" alt="" className="nav-link-icon" />
                      <div>Contact</div>
                    </a>
                  </div>
                  <div className="nav-column marketing">
                    <img src="/images/Star-Life-Logo-White.svg" loading="lazy" alt="" className="nav-brand" />
                    <div className="content-block nav">
                      <h1 className="nav-header-h1">Your Solid Partner for Life.</h1>
                      <p>StarLife Assurance Limited Company is a leading Life Assurance Company offering a wide range of need-based life assurance products designed to meet the financial security needs of the insuring public.<br /><br />Incorporated as a limited liability company in compliance with the new Insurance Law 2006, Act 724 in October 2005, thus making it the first Life Assurance company to be separated as a composite Company.</p>
                    </div>
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
              </nav>
              <div data-w-id="0cf8ff80-a0db-ff2f-18e6-729117168a8d" className="nav-menu w-nav-button">
                <div className="nav-menu-khebab-wrapper">
                  <div data-w-id="d8d235f0-5555-3bcf-5baa-79f1ee6dee46" className="nav-menu-khebab-item"></div>
                  <div data-w-id="9fccc316-8586-1722-a404-77a6007fc175" className="nav-menu-khebab-item"></div>
                </div>
              </div>
              <a href="tel:+233302739600" className="nav-tel w-inline-block">
                <img src="/images/ico-phone.png" loading="lazy" alt="" className="icons nav" />
                <div className="nav-contact-label">+233 30 273 9600</div>
              </a>
            </div>
          </div>
          <div className="nav-page-title">
            <div className="w-layout-blockcontainer container nav-section-title w-container">
              <h1 className="product-heading-1">News</h1>
            </div>
          </div>
        </section>

        <section className="sub-section news">
          <div className="w-layout-blockcontainer container w-container">
            <div className="content-block news">
              <h2 className="heading-2">Top News</h2>
            </div>
            <div className="w-layout-grid grid-news-highlight">
              {topNews && topNews.length > 0 ? topNews.map((article) => (
                <div key={article.id} className="news-block">
                  <div 
                    className="news-cover"
                    style={{
                      backgroundImage: article.article_image ? `url(${article.article_image})` : 'none'
                    }}
                  ></div>
                  <div className="news-summary-block">
                    <h3 className="heading-3">{article.article_name}</h3>
                    <div className="blog-tag-wrapper">
                      <div className="blog-tags">By {article.author || 'StarLife Admin'}</div>
                      <div className="blog-tags">{formatDate(article.created_at)}</div>
                    </div>
                    <p>{truncateText(article.meta_description || '')}</p>
                    <div className="news-column-cta-block">
                      <a href={`/blog/${article.slug}`} className="button-primary news w-button">Read more</a>
                      <div className="news-date">{formatDate(article.created_at)}</div>
                    </div>
                  </div>
                </div>
              )) : (
                // Fallback content when no articles are available
                Array.from({ length: 3 }, (_, index) => (
                  <div key={`placeholder-${index}`} className="news-block">
                    <div className="news-cover"></div>
                    <div className="news-summary-block">
                      <h3 className="heading-3">Article Heading Here</h3>
                      <div className="blog-tag-wrapper">
                        <div className="blog-tags">By StarLife Admin</div>
                        <div className="blog-tags">Coming Soon</div>
                      </div>
                      <p>Stay tuned for the latest news and updates from StarLife Assurance. We&apos;ll be sharing important insights and company updates here soon.</p>
                      <div className="news-column-cta-block">
                        <a href="#" className="button-primary news w-button">Coming Soon</a>
                        <div className="news-date">Coming Soon</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="sub-section news explore">
          <div className="w-layout-blockcontainer container w-container">
            <div className="content-block news">
              <h2 className="heading-2">Explore More News</h2>
            </div>
            <div className="w-layout-grid grid-news">
              {moreNews && moreNews.length > 0 ? (
                // Group articles into rows of 3
                Array.from({ length: Math.ceil(moreNews.length / 3) }, (_, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="grid-block news">
                    {moreNews.slice(rowIndex * 3, (rowIndex + 1) * 3).map((article, colIndex) => {
                      const isImageColumn = colIndex % 2 === 0;
                      return (
                        <div key={article.id} className={`news-column-item ${isImageColumn ? 'img' : ''}`}>
                          <h3 className="heading-3">{article.article_name}</h3>
                          {!isImageColumn && (
                            <p>{truncateText(article.meta_description || '')}</p>
                          )}
                          <div className="news-column-cta-block">
                            <a href={`/blog/${article.slug}`} className="button-primary news explore w-button">Read more</a>
                            <div className="news-date">{formatDate(article.created_at)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                // Fallback content matching original structure
                Array.from({ length: 4 }, (_, rowIndex) => (
                  <div key={`placeholder-row-${rowIndex}`} className="grid-block news">
                    <div className="news-column-item img">
                      <h3 className="heading-3">Heading</h3>
                      <div className="news-column-cta-block">
                        <a href="#" className="button-primary news explore w-button">Coming Soon</a>
                        <div className="news-date">Coming Soon</div>
                      </div>
                    </div>
                    <div className="news-column-item">
                      <h3 className="heading-3">News article heading</h3>
                      <p>Stay tuned for more news and updates from StarLife Assurance. We&apos;ll be sharing important insights and company updates here soon.</p>
                      <div className="news-column-cta-block">
                        <a href="#" className="button-primary news explore w-button">Coming Soon</a>
                        <div className="news-date">Coming Soon</div>
                      </div>
                    </div>
                    <div className="news-column-item img">
                      <h3 className="heading-3">Heading</h3>
                      <div className="news-column-cta-block">
                        <a href="#" className="button-primary news explore w-button">Coming Soon</a>
                        <div className="news-date">Coming Soon</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="news-load-more-block">
              <a href="#" className="button-primary w-button">Load More</a>
            </div>
          </div>
        </section>

        <section className="section footer">
          <div className="w-layout-blockcontainer container w-container">
            <div className="w-layout-grid grid-footer">
              <div className="grid-block footer">
                <h4 className="footer-h4">About Us</h4>
                <a href="/about" className="footer-link">Overview</a>
                <a href="/about/team" className="footer-link">Teams</a>
                <a href="/news" aria-current="page" className="footer-link w--current">News</a>
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
              <div id="w-node-_82fa5887-67dc-2ba8-75ac-6bbe560c7792-560c7779" className="grid-block footer">
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
              <div id="w-node-_82fa5887-67dc-2ba8-75ac-6bbe560c77a1-560c7779" className="grid-block social">
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

        {/* Zoho SalesIQ Script */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `var $zoho = $zoho || {}; $zoho.salesiq = $zoho.salesiq || { widgetcode: "siq2bfe37dfcf481e5feac3f4e1a81d9261542fc52a907a5f3e1091ff3db3d2a04c", values: {}, ready: function () { } }; var d = document; s = d.createElement("script"); s.type = "text/javascript"; s.id = "zsiqscript"; s.defer = true; s.src = "https://salesiq.zoho.com/widget"; t = d.getElementsByTagName("script")[0]; t.parentNode.insertBefore(s, t); d.write("<div id='zsiqwidget'></div>");`
          }}
        />
    </>
  );
}

// This function runs at build time and fetches the blog data
export async function getStaticProps() {
  try {
    // Fetch top 3 published blog posts for the highlight section
    const { data: topNews, error: topError } = await supabase
      .from('blogs')
      .select(`
        id,
        article_name,
        article_image,
        meta_description,
        slug,
        author,
        created_at,
        is_published
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (topError) throw topError;

    // Fetch more blog posts for the explore section (skip the top 3)
    const { data: moreNews, error: moreError } = await supabase
      .from('blogs')
      .select(`
        id,
        article_name,
        article_image,
        meta_description,
        slug,
        author,
        created_at,
        is_published
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(3, 14); // Get posts 4-15 (12 more posts)

    if (moreError) throw moreError;

    return {
      props: {
        topNews: topNews || [],
        moreNews: moreNews || []
      },
      // Regenerate the page every hour to get fresh content
      revalidate: 3600
    };
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return {
      props: {
        topNews: [],
        moreNews: []
      },
      revalidate: 3600
    };
  }
}