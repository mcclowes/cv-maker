const meta = (config) => {
  if(!config || !config.name) {
    return `<title>CV</title>
    <meta name="description" content="CV made with cv-maker">

    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no">

    <link rel="icon" href="/favicon.ico" />`
  }

  return `
    <title>${config.name} CV</title>
    <meta name="description" content="${config.description}">

    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no">

    <link rel="icon" href="/favicon.ico" />

    <!--  Social tags -->
    <!--  Essential META Tags -->
    <meta property="og:title" content="The CV of ${config.name}">
    <meta property="og:description" content="${config.description}">
    <meta property="og:image" content="${config.previewImage}">
    <meta property="og:url" content="${config.url}">
    <meta name="twitter:card" content="summary_large_image">


    <!--  Non-Essential, But Recommended -->
    <meta property="og:site_name" content="The CV of ${config.name}">
    <meta name="twitter:image:alt" content="${config.previewImageText}">


    <!--  Non-Essential, But Required for Analytics -->
    <meta name="twitter:site" content="${config.twitterUsername}">
  `
}

export default meta;