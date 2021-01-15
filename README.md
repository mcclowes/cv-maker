# cv-maker

With this tool, you can write your CV in markdown, style it with CSS, and track changes with Git. You can have several versions of your CV at once. The result is a clean CV in both HTML and PDF form.

You can see the result of the CV here: https://cv.mcclowes.com/

## Quick guide to getting going

To make this CV your own:
- Click `Use this template` to create a new repo based on this project
- Do a find of `Joe Bloggs` with your name (including in `src/generate`)
- Edit `src/sections` with your own CV content
- Build the CV (see below)

If you want to deploy the CV on the web:
- Work out where you're going to build & host it (I suggest Vercel)
- Replace the favicon
- Make sure the styles all work online too

## Building

`npm install && npm run build`

To set up multiple CV configs, edit `src/createCV`

To build multiple CVs run `npm run build -- x y z'
e.g. `npm run build -- engineering product'

## Styling

You can create various themes in `src/styles`. `cv.css` is a good example of the what to do, including light/dark modes (which works on the web only)

## Storing the PDFs

If you want to keep the CVs in Git, I suggest using [git lfs](https://git-lfs.github.com/).

If you DON'T want to keep the CVs in Git, stop tracking them through `.gitignore`:
`echo .gitignore >> *.pdf`

# API

- `\page` creates a page break (otherwise it'll all be on one page)