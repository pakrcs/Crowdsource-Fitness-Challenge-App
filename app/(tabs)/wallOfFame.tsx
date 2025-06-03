import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { getLeaderboard, LeaderboardUser } from '../api/wofAPI';


export default function WallOfFameScreen() {
    const [user, setUser] = useState<null | { uid: string }>(null);
    const [data, setData] = useState<(LeaderboardUser & { points: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [initialIndex, setInitialIndex] = useState(0);

    useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);

    // Fetch leaderbaord
    const fetchBoard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Get user badsges and sort
            const users = await getLeaderboard();
            const withPoints = users
                .map(u => ({
                    ...u,
                    points: u.bronze_badges * 1
                        + u.silver_badges * 2
                        + u.gold_badges * 3
                }))
                .sort((a, b) => {
                    if (b.points !== a.points) return b.points - a.points;
                    return a.username.localeCompare(b.username);
                });
            setData(withPoints);
            if (user) {
                const idx = withPoints.findIndex(x => x.firebase_uid === user.uid);
                if (idx >= 0) setInitialIndex(idx);
            }
        } catch (e) {
            console.warn(error);
            setError('Could not load leaderboard');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Only fetch board after user is found
    useEffect(() => {
        if (!user) return;    
        fetchBoard();
    }, [user, fetchBoard]);

    // Refresh board
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchBoard();
        setRefreshing(false);
    }, [fetchBoard]);

    // Load/Error
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    if (error) {
        return (
            <View style={styles.center}>
                <Text style={{ color: 'red' }}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                keyExtractor={item => item.firebase_uid}
                initialScrollIndex={initialIndex}
                getItemLayout={(_, index) => ({
                    length: 64,
                    offset: 64 * index,
                    index
                })}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                // LIST HEADER
                ListHeaderComponent={() => (
                    <View style={styles.headerRow}>
                        <Text style={styles.rankHeader}>#</Text>
                        <Text style={styles.usernameHeader}>Username</Text>
                        <Text style={styles.badgeHeader}>🥉</Text>
                        <Text style={styles.badgeHeader}>🥈</Text>
                        <Text style={styles.badgeHeader}>🥇</Text>
                        <Text style={styles.pointsHeader}>Pts</Text>
                    </View>
                )}
                stickyHeaderIndices={[0]}
                // ROW RENDER
                renderItem={({ item, index }) => {
                    const isMe = item.firebase_uid === user?.uid;
                    return (
                        <View style={[styles.listItem, isMe && styles.currentUserItem]}>
                            <Text style={styles.rankText}>{index + 1}</Text>
                            <Text style={[styles.username, isMe && styles.currentUserText]}>
                                {item.username}
                            </Text>
                            <Text style={styles.badgeNumber}>{item.bronze_badges}</Text>
                            <Text style={styles.badgeNumber}>{item.silver_badges}</Text>
                            <Text style={styles.badgeNumber}>{item.gold_badges}</Text>
                            <Text style={styles.points}>{item.points}</Text>
                        </View>
                    );
                }}
            />
        </View>
    );
}

// STYLE
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#282c34',
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    center: {
        flex: 1,
        backgroundColor: '#282c34',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header
    headerRow: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f242b',
        paddingHorizontal: 12,
        borderRadius: 6,
        marginBottom: 4,
    },
    rankHeader: { width: 24, color: '#bbb', fontWeight: 'bold' },
    usernameHeader: { flex: 1, color: '#bbb', fontWeight: 'bold' },
    badgeHeader: { width: 30, textAlign: 'center', color: '#bbb', fontWeight: 'bold' },
    pointsHeader: { width: 40, textAlign: 'right', color: '#bbb', fontWeight: 'bold' },

    // Rows
    listItem: {
        height: 64,
        backgroundColor: '#292f36',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginVertical: 2,
        borderRadius: 6,
    },
    currentUserItem: {
        borderWidth: 2,
        borderColor: '#32cd32',
    },
    rankText: { width: 24, color: '#fff', fontWeight: 'bold' },
    username: { flex: 1, color: '#fff', fontSize: 16 },
    currentUserText: { color: '#32cd32' },
    badgeNumber: { width: 30, textAlign: 'center', color: '#fff', fontWeight: 'bold' },
    points: { width: 40, textAlign: 'right', color: '#32cd32', fontWeight: 'bold' },
});