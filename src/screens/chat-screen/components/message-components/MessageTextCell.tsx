import React from 'react';
import { Animated, Text, Dimensions } from 'react-native';

import { tailwind } from '@/theme';
import { Channel, Message, MessageStatus, MessageType } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';

import { MarkdownDisplay } from './MarkdownDisplay';
import { MESSAGE_STATUS, INBOX_TYPES, TEXT_MAX_WIDTH } from '@/constants';
import { DeliveryStatus } from './DeliveryStatus';
import { EmailMeta } from './EmailMeta';
import { useSaraColors } from '@/hooks/useSaraColors';

type MessageTextCellProps = {
  text: string;
  timeStamp: number;
  isIncoming: boolean;
  isOutgoing: boolean;
  isActivity: boolean;
  status: MessageStatus;
  isAvatarRendered?: boolean;
  channel?: Channel;
  messageType: MessageType;
  sourceId?: string;
  isPrivate: boolean;
  errorMessage: string;
  sender: Message['sender'];
  contentAttributes: Message['contentAttributes'];
};

export const MessageTextCell = (props: MessageTextCellProps) => {
  const {
    text,
    timeStamp,
    isIncoming,
    isOutgoing,
    status,
    isAvatarRendered,
    channel,
    messageType,
    sourceId,
    isPrivate,
    errorMessage,
    sender,
    contentAttributes,
  } = props;
  const colors = useSaraColors();

  // const [singleLineLongText, setSingleLineLongText] = useState(false);
  // const [singleLineShortText, setSingleLineShortText] = useState(false);
  // const [isMultiLine, setIsMultiLine] = useState(false);
  // const [multiLineShortText, setMultiLineShortText] = useState(false);

  // const handleTextLayout = (
  //   event: NativeSyntheticEvent<TextLayoutEventData>,
  // ) => {
  //   const textLines = event.nativeEvent.lines;
  //   if (textLines.length === 1) {
  //     // The Text is Single Line
  //     if (textLines[textLines.length - 1].width < (2 * TEXT_MAX_WIDTH) / 3) {
  //       // The Text width is less than half of max width so rendering the
  //       // Timestamp inline
  //       setSingleLineShortText(true);
  //     } else {
  //       // The text width is more than the max widthd
  //       setSingleLineLongText(true);
  //     }
  //   } else {
  //     // There are multiple lines for the Text
  //     setIsMultiLine(true);
  //     if (textLines[textLines.length - 1].width < (2 * TEXT_MAX_WIDTH) / 3) {
  //       // There last line is not full width meaning we can move the
  //       //   time stamp indicator
  //       setMultiLineShortText(true);
  //     } else {
  //     }
  //   }
  // };

  const isMessageFailed = status === MESSAGE_STATUS.FAILED;

  const isEmailMessage = channel === INBOX_TYPES.EMAIL;

  const windowWidth = Dimensions.get('window').width;

  const EMAIL_MESSAGE_WIDTH = windowWidth - 52; // 52 is the sum of the left and right padding (12 + 12) and avatar width (24) and gap between avatar and message (4)

  return (
    <Animated.View
      style={[
        tailwind.style(
          'relative pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden',
          isEmailMessage ? `max-w-[${EMAIL_MESSAGE_WIDTH}px]` : `max-w-[${TEXT_MAX_WIDTH}px]`,
          isMessageFailed ? 'bg-ruby-700' : '',
          isAvatarRendered
            ? isOutgoing
              ? 'rounded-br-none'
              : isIncoming
                ? 'rounded-bl-none'
                : ''
            : '',
        ),
        !isMessageFailed &&
          (isIncoming
            ? {
                backgroundColor: colors.backgroundLight,
                borderWidth: 1,
                borderColor: colors.border,
              }
            : null),
        !isMessageFailed &&
          (isOutgoing
            ? {
                backgroundColor: colors.accent,
              }
            : null),
      ]}>
      {contentAttributes && <EmailMeta {...{ contentAttributes, sender }} />}
      <MarkdownDisplay {...{ isIncoming, isOutgoing, isMessageFailed }} messageContent={text} />
      {/* <Text
        // onTextLayout={handleTextLayout}
        style={tailwind.style(
          isIncoming || isOutgoing
            ? "text-base tracking-[0.32px] leading-[22px] font-inter-normal-20"
            : "",
          isIncoming ? "text-white" : "",
          isOutgoing ? "text-gray-950" : "",
        )} 
      >
        {text}
      </Text> */}
      <Animated.View
        style={tailwind.style(
          'h-[21px] pt-[5px] pb-0.5 flex flex-row items-center justify-end',
          // singleLineShortText ? "pl-1.5" : "",
          // singleLineLongText || isMultiLine ? "justify-end" : "",
          // multiLineShortText ? " absolute bottom-0.5 right-2.5" : "",
        )}>
        <Text
          style={[
            tailwind.style('text-xs font-inter-420-20 tracking-[0.32px] pr-1'),
            isIncoming && !isMessageFailed ? { color: colors.textMeta } : undefined,
            isOutgoing && !isMessageFailed ? { color: 'rgba(255, 255, 255, 0.85)' } : undefined,
            isMessageFailed ? { color: tailwind.color('text-whiteA-A11') } : undefined,
          ]}>
          {unixTimestampToReadableTime(timeStamp)}
        </Text>
        <DeliveryStatus
          isPrivate={isPrivate}
          status={status}
          messageType={messageType}
          channel={channel}
          sourceId={sourceId}
          errorMessage={errorMessage}
          deliveredColor={isOutgoing ? 'text-white' : 'text-gray-500'}
          sentColor={isOutgoing ? 'text-white' : 'text-gray-500'}
        />
      </Animated.View>
    </Animated.View>
  );
};
