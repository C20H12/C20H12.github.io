import { Marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import * as mhl from 'https://cdn.jsdelivr.net/npm/marked-highlight@2.2.3/+esm';
import hljs from 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/+esm';

const style = document.createElement("link");
style.setAttribute("rel", "stylesheet")
style.setAttribute("href", "https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/1c-light.min.css")
document.head.appendChild(style);

const contentArea = document.querySelector(".md-block");
const path = contentArea.dataset.src;

const marked = new Marked(
  mhl.markedHighlight({
	  emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

fetch(path)
  .then(f => f.text())
  .then(t => {
    contentArea.innerHTML = marked.parse(t);
  });
