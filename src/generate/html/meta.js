import { escapeHtml, escapeHtmlAttr, escapeJsonForScript } from "./escape.js";

const generateStructuredData = (config) => {
  const { name, description, url, email, jobTitle, employer } = config;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description,
    url,
  };

  if (email) {
    structuredData.email = email;
  }

  if (jobTitle) {
    structuredData.jobTitle = jobTitle;
  }

  if (employer) {
    structuredData.worksFor = {
      "@type": "Organization",
      name: employer,
    };
  }

  return `<script type="application/ld+json">${escapeJsonForScript(JSON.stringify(structuredData))}</script>`;
};

const meta = (config) => {
  if (!config || !config.name) {
    return `
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no">

        <link rel="icon" href="assets/favicon.ico" />

        <title>CV</title>
        <meta name="description" content="CV made with cv-maker">
    `;
  }

  const { description, name, preview, twitterUser, url } = config;

  const safeName = escapeHtml(name);
  const safeDescription = escapeHtmlAttr(description);
  const safeUrl = escapeHtmlAttr(url);
  const previewImage = preview?.image ? escapeHtmlAttr(preview.image) : "";
  const previewText = preview?.text ? escapeHtmlAttr(preview.text) : "";
  const twitterHandle = twitterUser ? escapeHtmlAttr(twitterUser) : "";

  return `
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no">

    <link rel="icon" href="assets/favicon.ico" />
    ${url ? `<link rel="canonical" href="${safeUrl}">` : ""}

    <title>${safeName} CV</title>
    <meta name="description" content="${safeDescription}">

    <!--  Social tags -->
    <meta property="og:type" content="website">
    <meta property="og:description" content="${safeDescription}">
    ${previewImage ? `<meta property="og:image" content="${previewImage}">` : ""}
    <meta property="og:site_name" content="The CV of ${safeName}">
    <meta property="og:title" content="The CV of ${safeName}">
    ${url ? `<meta property="og:url" content="${safeUrl}">` : ""}

    <meta name="twitter:card" content="summary_large_image">
    ${previewText ? `<meta name="twitter:image:alt" content="${previewText}">` : ""}
    ${twitterHandle ? `<meta name="twitter:site" content="${twitterHandle}">` : ""}

    <!-- Structured data for AI/search engines -->
    ${generateStructuredData(config)}
  `;
};

export default meta;
