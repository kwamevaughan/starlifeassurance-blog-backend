import Head from "next/head";
import { useRouter } from "next/router";

const SEO = ({
  title = "Blog Admin - Content Management System",
  description = "A modern blog content management system built with Next.js and Supabase for creating and managing blog posts.",
  keywords = "",
  image = "",
  noindex = false,
  imageWidth = 1200,
  imageHeight = 630,
}) => {
  const router = useRouter();
  // Construct the full URL for the current page
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${
    router.asPath === "/" ? "" : router.asPath.split("?")[0]
  }`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Blog Admin" />
      <meta name="robots" content={noindex ? "noindex" : "index, follow"} />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={imageWidth.toString()} />
      <meta property="og:image:height" content={imageHeight.toString()} />
      <meta
        property="og:image:alt"
        content="Blog Admin - Content Management System"
      />
      <meta
        property="og:site_name"
        content="Blog Admin"
      />
      <meta property="og:locale" content="en_US" />
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta
        name="twitter:image:alt"
        content="Blog Admin - Content Management System"
      />
    </Head>
  );
};

export default SEO;