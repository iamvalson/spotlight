// app/menu/index.tsx
import { COLORS } from "@/constants/theme";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function MenuScreen() {
  const { signOut } = useAuth();

  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomColor: COLORS.surface,
          borderBottomWidth: 0.5,
        }}
      >
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={{ color: COLORS.white, fontWeight: "bold", fontSize: 15 }}>
          Settings and activity
        </Text>
        <View style={{ width: 24 }}></View>
      </View>
      <ScrollView style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <View>
          <Text style={{ color: COLORS.grey, fontWeight: "600" }}>
            How you use spotlight
          </Text>
          <TouchableOpacity
            style={{
              paddingTop: 30,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
            onPress={() => router.push("/(tabs)/bookmarks")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="bookmark-outline"
                size={27}
                color={COLORS.white}
              />
              <Text
                style={{
                  color: COLORS.white,
                  paddingLeft: 10,
                  fontSize: 16,
                  fontWeight: "400",
                }}
              >
                Bookmarks
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color={COLORS.grey}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingTop: 25,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
            onPress={() => router.push("/(tabs)/notifications")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="notifications-outline"
                size={27}
                color={COLORS.white}
              />
              <Text
                style={{
                  color: COLORS.white,
                  paddingLeft: 10,
                  fontSize: 16,
                  fontWeight: "400",
                }}
              >
                Notifications
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color={COLORS.grey}
            />
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 30 }}>
          <Text style={{ color: COLORS.grey, fontWeight: "600" }}>Login</Text>
          <TouchableOpacity style={{ marginTop: 20 }}>
            <Text
              style={{
                color: "#4E71FF",
                paddingBottom: 10,
                fontSize: 16,
              }}
            >
              Add acoount
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 10 }} onPress={() => signOut()}>
            <Text style={{ color: "red", fontSize: 16 }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
