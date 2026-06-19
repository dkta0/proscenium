import { Node, Extension } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import History from "@tiptap/extension-history";
import { ALL_ELEMENT_TYPES as ELEMENT_TYPES, ElementType } from "../formats/formats";

function elementNode(type: ElementType): Node {
  return Node.create({
    name: type,
    group: "block",
    content: "inline*",
    defining: true,
    parseHTML() {
      return [{ tag: `div[data-element="${type}"]` }];
    },
    renderHTML() {
      return ["div", { "data-element": type, class: `el-${type}` }, 0];
    },
  });
}

export const SCHEMA_NODE_NAMES = ELEMENT_TYPES;

export function buildExtensions(): Extension[] {
  const nodes = ELEMENT_TYPES.map(elementNode);
  const doc = Document.extend({ content: "block+" });
  return [doc, Text, History, ...nodes] as unknown as Extension[];
}
