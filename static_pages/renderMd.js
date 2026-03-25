import { Marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import * as mhl from "https://cdn.jsdelivr.net/npm/marked-highlight@2.2.3/+esm";
import hljs from "https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/+esm";
const HL_STYLES = {
  light: "https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/atom-one-light.min.css",
  dark: "https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/atom-one-dark.min.css",
};

const toggleLabel = document.createElement("label");
const toggleInput = document.createElement("input");
const toggleSlider = document.createElement("span");
toggleLabel.className = "toggle";
toggleInput.type = "checkbox";
toggleSlider.className = "slider";
toggleLabel.appendChild(toggleInput);
toggleLabel.appendChild(toggleSlider);
document.body.appendChild(toggleLabel);

const style = document.createElement("link");
style.setAttribute("rel", "stylesheet");
style.setAttribute("href", `../styles.css`);
document.head.appendChild(style);

const storedTheme = localStorage.getItem("colorTheme");
toggleInput.checked = storedTheme === "dark";
const themeStyle = document.createElement("link");
themeStyle.setAttribute("rel", "stylesheet");
themeStyle.setAttribute("href", `../styles-${storedTheme ?? "light"}.css`);
document.head.appendChild(themeStyle);

const hlstyle = document.createElement("link");
hlstyle.setAttribute("rel", "stylesheet");
hlstyle.setAttribute("href", HL_STYLES[storedTheme ?? "light"]);
document.head.appendChild(hlstyle);

toggleInput.addEventListener("input", () => {
  const theme = toggleInput.checked ? "dark" : "light";
  themeStyle.setAttribute("href", `../styles-${theme}.css`);
  hlstyle.setAttribute("href", HL_STYLES[theme]);
  localStorage.setItem("colorTheme", theme);
});

const contentArea = document.querySelector(".md-block");
const path = contentArea.dataset.src;

const marked = new Marked(
  mhl.markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
);

fetch(path)
  .then(f => f.text())
  .then(t => {
    contentArea.innerHTML = marked.parse(t);
  });
