import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, size }: { name: TabIconName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4B8BFF',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f1f5f9',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="create" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="papers"
        options={{
          title: 'Papers',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="document-text" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="bar-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="person" color={color} size={size} />
          ),
        }}
      />
      {/* Hidden screens accessible via router.push but not shown in tab bar */}
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          title: 'Chat',
        }}
      />
      <Tabs.Screen
        name="image-studio"
        options={{
          href: null,
          title: 'Image Studio',
        }}
      />
      <Tabs.Screen
        name="rank-details"
        options={{
          href: null,
          title: 'Rank Details',
        }}
      />
    </Tabs>
  );
}
