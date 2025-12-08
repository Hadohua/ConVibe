/**
 * app/(tabs)/feed.tsx - 共识 Feed 页面
 * 
 * 显示音乐提案列表，用户可投票参与共识
 */

import { View, SafeAreaView } from "react-native";
import ConsensusFeed from "../../components/ConsensusFeed";

export default function FeedScreen() {
    return (
        <SafeAreaView className="flex-1 bg-dark-50">
            <View className="flex-1 px-4 pt-4">
                <ConsensusFeed />
            </View>
        </SafeAreaView>
    );
}
