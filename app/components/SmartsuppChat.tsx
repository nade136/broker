import Script from "next/script";

const DEFAULT_KEY = "41fdbab79ae702552a2a0e86f1e01e2d9f076faf";

const smartsuppKey =
  process.env.NEXT_PUBLIC_SMARTSUPP_KEY?.trim() || DEFAULT_KEY;

/**
 * Smartsupp live chat — use on marketing homepage and user dashboard only (not admin).
 */
export default function SmartsuppChat() {
  if (!smartsuppKey) return null;

  const inline = `
var _smartsupp = _smartsupp || {};
_smartsupp.key = ${JSON.stringify(smartsuppKey)};
window.smartsupp||(function(d) {
  var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
  s=d.getElementsByTagName('script')[0];c=d.createElement('script');
  c.type='text/javascript';c.charset='utf-8';c.async=true;
  c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
})(document);
`.trim();

  return (
    <>
      <Script id="smartsupp-loader" strategy="afterInteractive">
        {inline}
      </Script>
      <noscript>
        Powered by{" "}
        <a
          href="https://www.smartsupp.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Smartsupp
        </a>
      </noscript>
    </>
  );
}
