import React from 'react';
import { Linking, StyleSheet } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';

import { tailwind } from '@/theme';
import { useSaraColors } from '@/hooks/useSaraColors';

type MarkdownDisplayProps = {
  messageContent: string;
  isIncoming?: boolean;
  isOutgoing?: boolean;
  isBotText?: boolean;
  isPrivate?: boolean;
  isMessageFailed?: boolean;
};

export const MarkdownDisplay = (props: MarkdownDisplayProps) => {
  const { messageContent, isIncoming, isOutgoing, isBotText, isPrivate, isMessageFailed } = props;
  const colors = useSaraColors();

  const handleURL = (url: string) => {
    Linking.openURL(url).then(() => {});
    return true;
  };

  const computedColor = (() => {
    if (isMessageFailed) {
      return '#FFFFFF';
    }
    if (isPrivate) {
      return tailwind.color('text-amber-950');
    }
    if (isOutgoing) {
      return '#FFFFFF'; // Always white for outgoing messages
    }
    if (isIncoming || isBotText) {
      return colors.textPrimary;
    }
    return colors.textPrimary;
  })();

  const fontFamily = isPrivate ? 'Inter-500-20' : 'Inter-400-20';

  const styles = StyleSheet.create({
    text: {
      fontSize: 16,
      letterSpacing: 0.32,
      lineHeight: 22,
      color: computedColor,
      fontFamily,
    },
    strong: {
      fontFamily: 'Inter-600-20',
      fontWeight: '600',
    },
    em: {
      fontStyle: 'italic',
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 0,
      fontFamily,
      color: computedColor,
    },
    bullet_list: {
      minWidth: 200,
    },
    ordered_list: {
      minWidth: 200,
    },
    list_item: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      color: computedColor,
      fontFamily,
    },
    bullet_list_icon: {
      marginLeft: 0,
      marginRight: 8,
      fontWeight: '900',
      color: computedColor,
      fontFamily,
    },
  });
  return (
    <Markdown
      mergeStyle
      markdownit={MarkdownIt({
        linkify: true,
        typographer: true,
      })}
      onLinkPress={handleURL}
      style={styles}>
      {messageContent}
    </Markdown>
  );
};
