import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { AlertTicket } from '../services/api';

interface AlertBannerProps {
  alerts: AlertTicket[];
  onDismiss: () => void;
  onPress: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss, onPress }) => {
  const slideY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const hasCritical = alerts.some((a) => a.severity === 'critical');
  const bgColor = hasCritical ? '#dc3545' : '#ff8c00';
  const title =
    hasCritical
      ? `⚠️ ${alerts.filter((a) => a.severity === 'critical').length} Critical Alert${alerts.filter((a) => a.severity === 'critical').length > 1 ? 's' : ''} Detected`
      : `🔔 ${alerts.length} New High Alert${alerts.length > 1 ? 's' : ''} Detected`;
  const body =
    alerts.length === 1
      ? alerts[0].message
      : `${alerts.length} new alerts require your attention`;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(slideY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => dismiss(), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: bgColor, transform: [{ translateY: slideY }], opacity },
      ]}
    >
      <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="warning" size={26} color="#fff" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.body} numberOfLines={2}>{body}</Text>
        </View>
        <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Progress bar that shrinks over 5 seconds */}
      <ProgressBar duration={5000} color="rgba(255,255,255,0.4)" />
    </Animated.View>
  );
};

const ProgressBar: React.FC<{ duration: number; color: string }> = ({ duration, color }) => {
  const width = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressBar,
          { backgroundColor: color, width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  body: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressBar: {
    height: 3,
  },
});

export default AlertBanner;
