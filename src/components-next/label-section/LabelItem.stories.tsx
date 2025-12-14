import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { LabelItem } from './LabelItem';
import { Label } from '@/types/common/Label';

// Sample labels for stories
const sampleLabels: Label[] = [
  {
    id: 1,
    title: 'Bug',
    description: 'Bug report',
    color: '#EF4444',
    showOnSidebar: true,
  },
  {
    id: 2,
    title: 'Feature',
    description: 'Feature request',
    color: '#3B82F6',
    showOnSidebar: true,
  },
  {
    id: 3,
    title: 'Enhancement',
    description: 'Enhancement',
    color: '#10B981',
    showOnSidebar: true,
  },
  {
    id: 4,
    title: 'Documentation',
    description: 'Docs',
    color: '#8B5CF6',
    showOnSidebar: true,
  },
  {
    id: 5,
    title: 'Question',
    description: 'Question',
    color: '#F59E0B',
    showOnSidebar: true,
  },
  {
    id: 6,
    title: 'Urgent',
    description: 'Urgent',
    color: '#DC2626',
    showOnSidebar: true,
  },
  {
    id: 7,
    title: 'Low Priority',
    description: 'Low priority',
    color: '#9CA3AF',
    showOnSidebar: true,
  },
];

const meta = {
  title: 'LabelItem',
  component: LabelItem,
  args: {
    item: sampleLabels[0],
    index: 0,
  },
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: '#F8F5F3',
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof LabelItem>;

export default meta;

type Story = StoryObj<typeof meta>;

// Bug label (red)
export const BugLabel: Story = {
  args: {
    item: sampleLabels[0],
    index: 0,
  },
};

// Feature label (blue)
export const FeatureLabel: Story = {
  args: {
    item: sampleLabels[1],
    index: 1,
  },
};

// Enhancement label (green)
export const EnhancementLabel: Story = {
  args: {
    item: sampleLabels[2],
    index: 2,
  },
};

// Documentation label (purple)
export const DocumentationLabel: Story = {
  args: {
    item: sampleLabels[3],
    index: 3,
  },
};

// Multiple labels in a row
export const MultipleLabelRow: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {sampleLabels.slice(0, 4).map((label, index) => (
        <LabelItem key={label.id} item={label} index={index} />
      ))}
    </View>
  ),
};

// All labels in a grid
export const AllLabelsGrid: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {sampleLabels.map((label, index) => (
        <LabelItem key={label.id} item={label} index={index} />
      ))}
    </View>
  ),
};

// Color variations showcase
export const ColorVariations: Story = {
  render: () => {
    const colorLabels: Label[] = [
      { id: 1, title: 'Red', description: '', color: '#EF4444', showOnSidebar: true },
      { id: 2, title: 'Blue', description: '', color: '#3B82F6', showOnSidebar: true },
      { id: 3, title: 'Green', description: '', color: '#10B981', showOnSidebar: true },
      { id: 4, title: 'Purple', description: '', color: '#8B5CF6', showOnSidebar: true },
      { id: 5, title: 'Yellow', description: '', color: '#F59E0B', showOnSidebar: true },
      { id: 6, title: 'Pink', description: '', color: '#EC4899', showOnSidebar: true },
      { id: 7, title: 'Teal', description: '', color: '#14B8A6', showOnSidebar: true },
      { id: 8, title: 'Orange', description: '', color: '#F97316', showOnSidebar: true },
    ];

    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {colorLabels.map((label, index) => (
          <LabelItem key={label.id} item={label} index={index} />
        ))}
      </View>
    );
  },
};

// Long label text
export const LongLabelText: Story = {
  args: {
    item: {
      id: 1,
      title: 'This is a very long label name that might wrap',
      description: 'Long label',
      color: '#3B82F6',
      showOnSidebar: true,
    },
    index: 0,
  },
};

// In a card context with title
export const InCardContext: Story = {
  render: () => (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        padding: 16,
      }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
        Conversation Labels
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: -12, marginTop: -12 }}>
        {sampleLabels.slice(0, 5).map((label, index) => (
          <LabelItem key={label.id} item={label} index={index} />
        ))}
      </View>
    </View>
  ),
};

// Mixed priority labels
export const PriorityLabels: Story = {
  render: () => (
    <View>
      <Text style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14, color: '#666' }}>
        Priority System
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: -12, marginTop: -12 }}>
        <LabelItem
          item={{
            id: 1,
            title: 'Critical',
            description: '',
            color: '#DC2626',
            showOnSidebar: true,
          }}
          index={0}
        />
        <LabelItem
          item={{
            id: 2,
            title: 'High',
            description: '',
            color: '#F97316',
            showOnSidebar: true,
          }}
          index={1}
        />
        <LabelItem
          item={{
            id: 3,
            title: 'Medium',
            description: '',
            color: '#F59E0B',
            showOnSidebar: true,
          }}
          index={2}
        />
        <LabelItem
          item={{
            id: 4,
            title: 'Low',
            description: '',
            color: '#10B981',
            showOnSidebar: true,
          }}
          index={3}
        />
      </View>
    </View>
  ),
};
