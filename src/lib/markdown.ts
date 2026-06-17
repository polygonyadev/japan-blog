// Wandelt nackte URLs/Domains in Markdown-Links um, ohne bestehende
// [Text](URL)-Links, Bilder oder Inline-Code zu zerstören.
// Beispiel: "nippon-os.com" -> "[nippon-os.com](https://nippon-os.com)"
const TLD = "com|net|org|io|dev|me|app|blog|ch|de|at|jp|co|xyz|info|shop|art|fm|tv|email|page";

export function autolink(md: string): string {
  if (!md) return md;
  const re = new RegExp(
    // nicht direkt nach ] ( [ Wortzeichen @ . / - (verhindert bestehende Links / E-Mails / Mid-Word)
    String.raw`(?<![\]\(\[\w@./-])` +
    // 1) volle URL (http/https/www) ODER 2) nackte Domain mit bekanntem TLD + optionalem Pfad
    String.raw`((?:https?:\/\/|www\.)[^\s)<]+|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:` + TLD + String.raw`)(?:\/[^\s)<]*)?)`,
    "gi"
  );
  return md.replace(re, (m) => {
    // Satzzeichen am Ende nicht in den Link ziehen
    const trail = m.match(/[.,;:!?)]+$/);
    const tail = trail ? trail[0] : "";
    const url = tail ? m.slice(0, m.length - tail.length) : m;
    const href = /^https?:\/\//i.test(url) ? url : `https://${url.replace(/^www\./i, "")}`;
    return `[${url}](${href})${tail}`;
  });
}
