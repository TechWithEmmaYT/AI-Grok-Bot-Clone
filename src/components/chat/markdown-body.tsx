import { useMarkdown } from "react-native-marked";
import { Fragment } from "react";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

/**
 * Renders an assistant message as Markdown.
 *
 * Model output is Markdown whether or not we ask for it — lists, bold, code
 * spans, tables — and shown as plain text it arrives as literal asterisks and
 * pipes.
 *
 * `useMarkdown` is used rather than the package's `<Markdown>` component
 * because that one renders a FlatList, and nesting a virtualised list inside
 * the chat ScrollView breaks measurement and scroll position. The hook returns
 * plain nodes instead.
 */
export function MarkdownBody({ value }: { value: string }) {
  const [foreground, muted, primary, border] = useCSSVariable([
    "--color-foreground",
    "--color-muted",
    "--color-primary",
    "--color-border",
  ]);

  const nodes = useMarkdown(value, {
    theme: {
      colors: {
        text: foreground as string,
        link: primary as string,
        code: muted as string,
        border: border as string,
      },
    },
    styles: {
      // The bubble already provides the padding and the type scale; these only
      // stop the library's own defaults from fighting it.
      paragraph: { paddingVertical: 2 },
      text: { fontFamily: "Inter_400Regular", fontSize: 16, lineHeight: 24 },
      strong: { fontFamily: "Inter_600SemiBold" },
      h1: { fontFamily: "Inter_700Bold", fontSize: 20, lineHeight: 28 },
      h2: { fontFamily: "Inter_700Bold", fontSize: 18, lineHeight: 26 },
      h3: { fontFamily: "Inter_600SemiBold", fontSize: 17, lineHeight: 24 },
      li: { fontFamily: "Inter_400Regular", fontSize: 16, lineHeight: 24 },
      codespan: { fontFamily: "Inter_500Medium", fontSize: 14 },
      codeText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
      code: { borderRadius: 12, padding: 12 },
      blockquote: { borderLeftWidth: 2, paddingLeft: 12 },
    },
  });

  return (
    <View>
      {nodes.map((node, index) => (
        <Fragment key={index}>{node}</Fragment>
      ))}
    </View>
  );
}
