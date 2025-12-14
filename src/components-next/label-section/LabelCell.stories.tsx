import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { LabelCell } from './LabelCell';
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
];

const meta = {
  title: 'LabelCell',
  component: LabelCell,
  args: {
    value: sampleLabels[0],
    index: 0,
    handleLabelPress: (title: string) => console.log('Label pressed:', title),
    isLastItem: false,
    isActive: false,
  },
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: '#FFFFFF',
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof LabelCell>;

export default meta;

type Story = StoryObj<typeof meta>;

// Bug label (red)
export const BugLabel: Story = {
  args: {
    value: sampleLabels[0],
    index: 0,
    isLastItem: false,
    isActive: false,
  },
};

// Feature label (blue)
export const FeatureLabel: Story = {
  args: {
    value: sampleLabels[1],
    index: 1,
    isLastItem: false,
    isActive: false,
  },
};

// Active/selected label
export const ActiveLabel: Story = {
  args: {
    value: sampleLabels[0],
    index: 0,
    isLastItem: false,
    isActive: true,
  },
};

// Last item (no bottom border)
export const LastItem: Story = {
  args: {
    value: sampleLabels[4],
    index: 4,
    isLastItem: true,
    isActive: false,
  },
};

// All labels list
export const AllLabels: Story = {
  render: () => (
    <View>
      {sampleLabels.map((label, index) => (
        <LabelCell
          key={label.id}
          value={label}
          index={index}
          handleLabelPress={title => console.log('Pressed:', title)}
          isLastItem={index === sampleLabels.length - 1}
          isActive={false}
        />
      ))}
    </View>
  ),
};

// Labels with some selected
export const WithSelections: Story = {
  render: () => (
    <View>
      {sampleLabels.map((label, index) => (
        <LabelCell
          key={label.id}
          value={label}
          index={index}
          handleLabelPress={title => console.log('Pressed:', title)}
          isLastItem={index === sampleLabels.length - 1}
          isActive={index === 0 || index === 2} // Bug and Enhancement are selected
        />
      ))}
    </View>
  ),
};

// Different color labels
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
      <View>
        {colorLabels.map((label, index) => (
          <LabelCell
            key={label.id}
            value={label}
            index={index}
            handleLabelPress={title => console.log('Pressed:', title)}
            isLastItem={index === colorLabels.length - 1}
            isActive={false}
          />
        ))}
      </View>
    );
  },
};

// In a card context
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
        overflow: 'hidden',
      }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Select Labels</Text>
      </View>
      <View>
        {sampleLabels.slice(0, 4).map((label, index) => (
          <LabelCell
            key={label.id}
            value={label}
            index={index}
            handleLabelPress={title => console.log('Pressed:', title)}
            isLastItem={index === 3}
            isActive={index === 1}
          />
        ))}
      </View>
    </View>
  ),
};
