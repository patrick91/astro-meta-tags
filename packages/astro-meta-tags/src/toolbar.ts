const getWindowContent = () => {
  const pageTitle = document.querySelector("title")?.textContent;
  const canonicalUrl = document
    .querySelector("link[rel='canonical']")
    ?.getAttribute("href");
  const metaTitle = document
    .querySelector("meta[name='title']")
    ?.getAttribute("content");
  const metaDescription = document
    .querySelector("meta[name='description']")
    ?.getAttribute("content");

  const themeColorMeta = document.querySelector("meta[name='theme-color']");
  const themeColor = themeColorMeta?.getAttribute("content");

  const getTagTuple = (tag, attributeName = "property") => [
    tag.getAttribute(attributeName) ?? "",
    tag.getAttribute("content") ?? "",
  ];

  const ogMetaTags: string[][] = Array.from(
    document.querySelectorAll("meta[property^='og:']"),
  )
    .map((tag) => getTagTuple(tag, "property"))
    .map(([a, b]) => [a ?? "", b ?? ""]);

  const twitterMetaTags: string[][] = Array.from(
    document.querySelectorAll("meta[name^='twitter:']"),
  )
    .map((tag) => getTagTuple(tag, "name"))
    .map(([a, b]) => [a ?? "", b ?? ""]);

  const alternateLinks: string[][] = Array.from(
    document.querySelectorAll("link[rel='alternate'][hreflang]"),
  )
    .map((tag) => [
      tag.getAttribute("hreflang") ?? "",
      tag.getAttribute("href") ?? "",
    ])
    .map(([a, b]) => [a ?? "", b ?? ""]);

  const iconLinks: string[][] = Array.from(
    document.querySelectorAll("link[rel='icon'], link[rel='apple-touch-icon']"),
  )
    .map((tag) => [
      tag.getAttribute("rel") ?? "",
      tag.getAttribute("href") ?? "",
      tag.getAttribute("sizes") ?? "",
      tag.getAttribute("type") ?? "",
    ])
    .map(([rel, href, sizes, type]) => [
      rel === "apple-touch-icon" ? "Apple Touch Icon" : "Favicon",
      href ?? "",
      sizes ? `${sizes}` : "",
      type ?? "",
    ])
    .map(([label, href, sizes, type]) => [
      sizes ? `${label} (${sizes})` : label,
      href,
    ]);

  const getSingleTagHtml = ([property, content]: [string, string]) => {
    let contentTag: HTMLElement | Text;

    if (!content) {
      content = "N/A";
    }

    if (
      ["og:image", "twitter:image"].includes(property) ||
      property.includes("Favicon") ||
      property.includes("Apple Touch Icon")
    ) {
      contentTag = document.createElement("img");
      contentTag.setAttribute("src", content);
      if (
        property.includes("Favicon") ||
        property.includes("Apple Touch Icon")
      ) {
        contentTag.style.maxWidth = "32px";
        contentTag.style.height = "auto";
      }
    } else if (property === "Theme color" && content !== "N/A") {
      contentTag = document.createElement("div");
      contentTag.style.width = "100px";
      contentTag.style.height = "20px";
      contentTag.style.backgroundColor = content;
    } else {
      contentTag = document.createTextNode(content);
    }

    const tagHtml = document.createDocumentFragment();

    const propertyName = document.createElement("dt");
    propertyName.textContent = property;

    const propertyValue = document.createElement("dd");
    propertyValue.append(contentTag);

    tagHtml.append(propertyName, propertyValue);

    return tagHtml;
  };

  const getTagsHtml = (
    title: string,
    tags: string[][],
    wrapWithDetails = true,
  ) => {
    const dl = document.createElement("dl");

    for (const [property, content] of tags) {
      dl.append(getSingleTagHtml([property, content]));
    }

    if (!wrapWithDetails) {
      return dl.outerHTML;
    }

    const details = document.createElement("details");

    const summary = document.createElement("summary");
    summary.textContent = title;

    details.append(summary, dl);

    return details.outerHTML;
  };

  const standardTags = [
    ["Page title", pageTitle],
    ["Canonical URL", canonicalUrl],
    ["Meta description", metaDescription],
    ["Theme color", themeColor],
  ].map(([k, v]) => [k ?? "", v ?? ""]);

  const standardTagsHtml = getTagsHtml("Standard", standardTags, false);

  const ogTagsHtml =
    ogMetaTags.length > 0 ? getTagsHtml("Open Graph", ogMetaTags) : "";
  const twitterTagsHtml =
    twitterMetaTags.length > 0 ? getTagsHtml("Twitter", twitterMetaTags) : "";
  const alternateTagsHtml =
    alternateLinks.length > 0
      ? getTagsHtml("Alternate Languages", alternateLinks)
      : "";
  const iconTagsHtml =
    iconLinks.length > 0 ? getTagsHtml("Icons", iconLinks) : "";

  return /* html */ `
<style>
    p, h1 {
        margin: 0;
    }

    h1 {
        color: white;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    dl {
        display: grid;
        grid-template-columns: max-content 1fr;
        grid-gap: 10px;
    }

    dt {
        color: white;
    }

    dd {
        margin: 0;
    }

    details {
        margin-bottom: 20px;
    }

    img {
        max-width: 100%;
        height: auto;
    }

    summary {
        cursor: pointer;
        color: white;
        font-weight: bold;
    }

    footer {
        display: flex;
        justify-content: flex-end;
        font-size: 0.8em;
    }

    :host astro-dev-toolbar-window {
        max-height: calc(100vh - 80px);
        overflow-y: auto;
    }
</style>

${standardTagsHtml}
${iconTagsHtml}
${ogTagsHtml}
${twitterTagsHtml}
${alternateTagsHtml}

<hr />

<footer>
    <a href="https://github.com/sponsors/patrick91" target="_blank" rel="noopener noreferrer">👀</a>
</footer>`;
};

export default {
  name: "Meta tags",
  id: "meta-tags",
  icon: `<svg fill="none" viewBox="0 0 24 24" height="1em" width="1em">
    <path fill="currentColor" d="M4 14v6h6v-2H6v-4H4z" />
    <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9 9v6h6V9H9zm4 2h-2v2h2v-2z"
        clipRule="evenodd"
    />
    <path
        fill="currentColor"
        d="M4 10V4h6v2H6v4H4zM20 10V4h-6v2h4v4h2zM20 14v6h-6v-2h4v-4h2z"
    />
    </svg>
  `,
  init(canvas: HTMLElement, eventTarget: EventTarget) {
    eventTarget.addEventListener("app-toggled", () => {
      const windowElement = document.createElement("astro-dev-toolbar-window");

      windowElement.innerHTML = getWindowContent();

      canvas.append(windowElement);
    });
  },
};
