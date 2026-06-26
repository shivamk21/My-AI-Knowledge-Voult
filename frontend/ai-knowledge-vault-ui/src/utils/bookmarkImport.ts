import type { ImportedLink, ImportedLinkSourceType } from '../types';

const allowedExtensions = new Set(['html', 'htm', 'txt']);

export function isSupportedImportFile(file: File) {
  const extension = getFileExtension(file.name);
  return allowedExtensions.has(extension);
}

export function parseImportedLinks(fileName: string, content: string): ImportedLink[] {
  const extension = getFileExtension(fileName);

  if (extension === 'html' || extension === 'htm') {
    return parseBookmarkHtml(content);
  }

  if (extension === 'txt') {
    return parseTextLinks(content);
  }

  throw new Error('Only .html, .htm, and .txt files are supported.');
}

function parseBookmarkHtml(content: string): ImportedLink[] {
  const document = new DOMParser().parseFromString(content, 'text/html');
  const rootList = document.querySelector('dl');
  const links: ImportedLink[] = [];

  if (rootList) {
    walkBookmarkList(rootList, [], links);
  } else {
    Array.from(document.querySelectorAll('a[href]')).forEach((anchor) => {
      addImportedLink(links, {
        url: anchor.getAttribute('href') ?? '',
        title: cleanText(anchor.textContent) || undefined,
        sourceType: 'Bookmark HTML'
      });
    });
  }

  const parsedUrls = new Set(links.map((link) => link.url));
  Array.from(document.querySelectorAll('a[href]')).forEach((anchor) => {
    const normalizedUrl = normalizeUrl(anchor.getAttribute('href') ?? '');

    if (normalizedUrl && !parsedUrls.has(normalizedUrl)) {
      addImportedLink(links, {
        url: normalizedUrl,
        title: cleanText(anchor.textContent) || undefined,
        sourceType: 'Bookmark HTML',
        category: getAnchorFolderPath(anchor)
      });
      parsedUrls.add(normalizedUrl);
    }
  });

  return dedupeLinks(links);
}

function walkBookmarkList(list: Element, folders: string[], links: ImportedLink[]) {
  const children = Array.from(list.children);

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];

    if (child.tagName === 'DT') {
      const anchor = findDirectChild(child, 'A');
      const heading = findDirectChild(child, 'H3');
      const nestedList = findDirectChild(child, 'DL');

      if (anchor) {
        addImportedLink(links, {
          url: anchor.getAttribute('href') ?? '',
          title: cleanText(anchor.textContent) || undefined,
          sourceType: 'Bookmark HTML',
          category: folders.join(' / ') || undefined
        });
      }

      if (heading) {
        const folderName = cleanText(heading.textContent);
        const siblingList = nestedList ?? findNextElement(children, index, 'DL');

        if (siblingList) {
          walkBookmarkList(siblingList, folderName ? [...folders, folderName] : folders, links);
          if (siblingList === children[index + 1]) {
            index += 1;
          }
        }
      } else if (nestedList) {
        walkBookmarkList(nestedList, folders, links);
      }
    } else if (child.tagName === 'DL') {
      walkBookmarkList(child, folders, links);
    }
  }
}

function parseTextLinks(content: string): ImportedLink[] {
  const matches = content.match(/\b(?:https?|ftp):\/\/[^\s<>"'`]+/gi) ?? [];
  const links: ImportedLink[] = [];

  matches.forEach((match) => {
    addImportedLink(links, {
      url: trimUrl(match),
      sourceType: 'Text File'
    });
  });

  return dedupeLinks(links);
}

function addImportedLink(
  links: ImportedLink[],
  input: { url: string; title?: string; sourceType: ImportedLinkSourceType; category?: string }
) {
  const url = normalizeUrl(input.url);

  if (!url) {
    return;
  }

  const title = input.title?.trim() || titleFromUrl(url);

  links.push({
    id: `${input.sourceType}-${links.length}-${url}`,
    url,
    title,
    description: describeUrl(url, title),
    sourceType: input.sourceType,
    category: input.category
  });
}

function describeUrl(url: string, title: string) {
  const parsed = parseUrl(url);
  const host = parsed?.hostname.replace(/^www\./, '') || '';
  const path = safeDecodeURIComponent(parsed?.pathname ?? '').toLowerCase();
  const titleText = title.toLowerCase();

  if (host.includes('github.com')) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return `GitHub repository or project page for ${humanize(parts.slice(0, 2).join(' '))}.`;
    }
    return 'GitHub code hosting or project resource.';
  }

  if (host.includes('w3schools.com')) {
    const topic = titleText.includes('html') || path.includes('html') ? 'HTML ' : '';
    return `${topic}learning/tutorial resource from W3Schools.`;
  }

  if (host.includes('youtube.com') || host.includes('youtu.be')) {
    return `Video resource on YouTube${title ? ` about ${stripTrailingPunctuation(title)}` : ''}.`;
  }

  if (host.includes('stackoverflow.com')) {
    return `Stack Overflow question or discussion about ${humanize(path.split('/').filter(Boolean).pop() ?? title)}.`;
  }

  if (host.includes('google.com') && path.includes('/search')) {
    return `Google search result page related to ${getSearchQuery(parsed) || stripTrailingPunctuation(title)}.`;
  }

  if (path.includes('tutorial') || titleText.includes('tutorial')) {
    return `Tutorial or learning resource from ${formatHost(host)}.`;
  }

  if (path.includes('docs') || titleText.includes('documentation') || titleText.includes('docs')) {
    return `Documentation resource from ${formatHost(host)}.`;
  }

  if (path.includes('swagger') || titleText.includes('swagger')) {
    return `Swagger or API documentation page from ${formatHost(host)}.`;
  }

  if (path.includes('login') || titleText.includes('login')) {
    return `Login or account access page for ${formatHost(host)}.`;
  }

  const readablePath = humanize(path.split('/').filter(Boolean).slice(0, 2).join(' '));
  return readablePath
    ? `${formatHost(host)} page related to ${readablePath}.`
    : `Web resource from ${formatHost(host)}.`;
}

function normalizeUrl(value: string) {
  const url = trimUrl(value);

  if (!url) {
    return '';
  }

  try {
    return new URL(url).href;
  } catch {
    return '';
  }
}

function titleFromUrl(url: string) {
  const parsed = parseUrl(url);

  if (!parsed) {
    return url;
  }

  const host = parsed.hostname.replace(/^www\./, '');
  const lastPathPart = parsed.pathname.split('/').filter(Boolean).pop();
  return lastPathPart ? `${formatHost(host)} - ${humanize(lastPathPart)}` : formatHost(host);
}

function parseUrl(url: string) {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

function getSearchQuery(url: URL | undefined) {
  const query = url?.searchParams.get('q');
  return query ? humanize(query) : '';
}

function dedupeLinks(links: ImportedLink[]) {
  const seen = new Set<string>();

  return links.filter((link) => {
    const key = `${link.url}|${link.category ?? ''}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function findDirectChild(element: Element, tagName: string) {
  return Array.from(element.children).find((child) => child.tagName === tagName);
}

function findNextElement(elements: Element[], startIndex: number, tagName: string) {
  for (let index = startIndex + 1; index < elements.length; index += 1) {
    if (elements[index].tagName === tagName) {
      return elements[index];
    }
    if (elements[index].tagName === 'DT') {
      return undefined;
    }
  }

  return undefined;
}

function getAnchorFolderPath(anchor: Element) {
  const folders: string[] = [];
  let element = anchor.parentElement;

  while (element) {
    if (element.tagName === 'DL') {
      const folder = getFolderNameForList(element);
      if (folder) {
        folders.unshift(folder);
      }
    }

    element = element.parentElement;
  }

  return folders.join(' / ') || undefined;
}

function getFolderNameForList(list: Element) {
  const parentHeading = list.parentElement ? findDirectChild(list.parentElement, 'H3') : undefined;
  if (parentHeading) {
    return cleanText(parentHeading.textContent);
  }

  const previous = list.previousElementSibling;
  if (!previous) {
    return '';
  }

  if (previous.tagName === 'H3') {
    return cleanText(previous.textContent);
  }

  if (previous.tagName === 'DT') {
    return cleanText(findDirectChild(previous, 'H3')?.textContent ?? '');
  }

  return '';
}

function cleanText(value: string | null) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function trimUrl(value: string) {
  return value.trim().replace(/[),.;\]]+$/g, '');
}

function stripTrailingPunctuation(value: string) {
  return value.trim().replace(/[.]+$/g, '');
}

function humanize(value: string) {
  return value
    .replace(/[-_+%]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function formatHost(host: string) {
  if (!host) {
    return 'this site';
  }

  return host
    .split('.')
    .filter((part) => part && part !== 'com' && part !== 'org' && part !== 'net')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}
