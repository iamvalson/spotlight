import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import Story from "@/components/Story";
import { STORIES } from "@/constants/mock-data";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useConvex, useQuery } from "convex/react";
import { useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import { styles } from "../../styles/feed.styles";

export default function Index() {
  const convex = useConvex();

  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [version, setVersion] = useState(0);

  const posts = useQuery(api.posts.getFeedPosts, { version });

  if (posts === undefined) return <Loader />;

  if (posts.length === 0) return <NoPostsFound />;

  const onRefresh = () => {
    setRefreshing(true);
    setVersion((v) => v + 1);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>spotlight</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={<StoriesSection />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const StoriesSection = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
    >
      {STORIES.map((story) => (
        <Story key={story.id} story={story} />
      ))}
    </ScrollView>
  );
};

{
  /* STORIES */
}
/*
 */

const NoPostsFound = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 20, color: COLORS.primary }}>No posts yet</Text>
    </View>
  );
};
