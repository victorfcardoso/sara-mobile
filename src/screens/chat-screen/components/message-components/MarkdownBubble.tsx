import React from 'react';
import { StyleSheet } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { openURL } from '@/utils/urlUtils';

import { tailwind } from '@/theme';
import { MESSAGE_VARIANTS } from '@/constants';

type MarkdownBubbleProps = {
  messageContent: string;
  variant: string;
};

const SARA_COLORS = {
  incomingText: '#16273D',
  outgoingText: '#FFFFFF',
};

export const MarkdownBubble = (props: MarkdownBubbleProps) => {
  const { messageContent, variant } = props;
  const handleURL = (url: string) => {
    openURL({ URL: url });
    return true;
  };

  const computedColor = (() => {
    if (variant === MESSAGE_VARIANTS.PRIVATE) {
      return tailwind.color('text-amber-950');
    }
    if (variant === MESSAGE_VARIANTS.AGENT || variant === MESSAGE_VARIANTS.ERROR) {
      return SARA_COLORS.outgoingText;
    }
    return SARA_COLORS.incomingText;
  })();

  const fontFamily = variant === MESSAGE_VARIANTS.PRIVATE ? 'Inter-500-20' : 'Inter-400-20';

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
    ordered_list_icon: {
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
