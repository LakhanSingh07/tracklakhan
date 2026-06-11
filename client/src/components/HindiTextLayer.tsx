import { useEffect } from "react";
import { useApp } from "@/lib/appContext";
import { hindiTextMap } from "@/lib/hindiCopy";

const originalText = new WeakMap<Text, string>();
const translatedAttrs: string[] = ["placeholder", "aria-label", "title"];
const ignoredTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SVG"]);

function translateExact(value: string) {
  return hindiTextMap[value.trim()];
}

function applyTextNode(node: Text, hindi: boolean) {
  const parent = node.parentElement;
  if (!parent || ignoredTags.has(parent.tagName)) return;

  if (!originalText.has(node)) {
    originalText.set(node, node.nodeValue || "");
  }

  const original = originalText.get(node) || "";
  if (!hindi) {
    if (node.nodeValue !== original) node.nodeValue = original;
    return;
  }

  const translated = translateExact(original);
  if (!translated) return;

  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  node.nodeValue = `${leading}${translated}${trailing}`;
}

function applyAttributes(element: Element, hindi: boolean) {
  if (ignoredTags.has(element.tagName) && element.tagName !== "INPUT") return;

  translatedAttrs.forEach((attr) => {
    const value = element.getAttribute(attr);
    const originalAttr = `data-flowai-original-${attr}`;

    if (!value && !element.hasAttribute(originalAttr)) return;

    if (!element.hasAttribute(originalAttr) && value) {
      element.setAttribute(originalAttr, value);
    }

    const original = element.getAttribute(originalAttr) || "";

    if (!hindi) {
      if (original) element.setAttribute(attr, original);
      return;
    }

    const translated = translateExact(original);
    if (translated) element.setAttribute(attr, translated);
  });
}

function walk(root: ParentNode, hindi: boolean) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    applyTextNode(node as Text, hindi);
    node = walker.nextNode();
  }

  if (root instanceof Element) applyAttributes(root, hindi);
  root.querySelectorAll?.("*").forEach((element) => applyAttributes(element, hindi));
}

export function HindiTextLayer() {
  const { language } = useApp();

  useEffect(() => {
    const hindi = language === "hi";
    walk(document.body, hindi);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            applyTextNode(node as Text, hindi);
          } else if (node instanceof Element) {
            walk(node, hindi);
          }
        });

        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          applyAttributes(mutation.target, hindi);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: translatedAttrs,
    });

    return () => observer.disconnect();
  }, [language]);

  return null;
}
