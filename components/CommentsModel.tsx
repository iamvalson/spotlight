import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Comment from "./Comment";
import { Loader } from "./Loader";

type CommentsModel = {
  postId: Id<"posts">;
  visible: boolean;
  onClose: () => void;
};

export default function CommentsModel({
  postId,
  visible,
  onClose,
}: CommentsModel) {
  const [newcomment, setNewComment] = useState("");
  const comments = useQuery(api.comments.getComments, { postId });
  const addComment = useMutation(api.comments.addComment);

  const handleAddComment = async () => {
    if (!newcomment.trim()) return;

    try {
      await addComment({
        content: newcomment,
        postId,
      });

      setNewComment("");
    } catch (error) {
      console.log("Error adding comment: ", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments</Text>
          <View style={{ width: 24 }}></View>
        </View>

        {comments === undefined ? (
          <Loader />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <Comment comment={item} />}
            style={styles.commentsList}
          />
        )}

        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={COLORS.grey}
            value={newcomment}
            onChangeText={setNewComment}
            multiline
          />

          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!newcomment.trim()}
          >
            <Text
              style={[
                styles.postButton,
                !newcomment.trim() && styles.postButtonDisabled,
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
