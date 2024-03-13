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

  const getTagTuple = (tag: Element, attributeName: string = "property") =>
    [tag.getAttribute(attributeName), tag.getAttribute("content")] as [
      string,
      string
    ];

  const ogMetaTags = Array.from(
    document.querySelectorAll("meta[property^='og:']")
  ).map((tag) => getTagTuple(tag, "property"));

  const twitterMetaTags = Array.from(
    document.querySelectorAll("meta[name^='twitter:']")
  ).map((tag) => getTagTuple(tag, "name"));

  const getSingleTagHtml = ([property, content]: [string, string]) => {
    let contentTag: HTMLElement | Text;
    if (["og:image", "twitter:image"].includes(property)) {
      contentTag = document.createElement("img");
      contentTag.setAttribute("src", content);
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
    tags: [string, string][],
    wrapWithDetails = true
  ) => {
    const dl = document.createElement("dl");

    for (const tag of tags) {
      dl.append(getSingleTagHtml(tag));
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
    ["Meta title", metaTitle],
    ["Meta description", metaDescription],
  ].filter(([, value]) => value) as [string, string][];

  let standardTagsHtml = getTagsHtml("Standard", standardTags, false);

  let ogTagsHtml =
    ogMetaTags.length > 0 ? getTagsHtml("Open Graph", ogMetaTags) : "";
  let twitterTagsHtml =
    twitterMetaTags.length > 0 ? getTagsHtml("Twitter", twitterMetaTags) : "";

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
${ogTagsHtml}
${twitterTagsHtml}

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
