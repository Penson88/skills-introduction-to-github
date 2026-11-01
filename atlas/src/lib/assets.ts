/** Resolve bundled resources relative to the document, including GitHub project Pages. */
export function assetUrl(path: string, documentUrl: string = document.baseURI): string {
  if (/^https:\/\//.test(path)) return path;
  return new URL(path.replace(/^\//, './'), documentUrl).href
    .replace(/%7B/gi, '{').replace(/%7D/gi, '}');
}
