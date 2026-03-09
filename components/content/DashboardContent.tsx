import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../theme/useTheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "../Card";
import { PieChart } from "react-native-gifted-charts";

const DashboardContent: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  interface StatItem {
    title: string;
    value: string;
    description: string;
    icon: any;
    color: string;
  }

  const stats: StatItem[] = [
    {
      title: "CRITICAL ALERTS",
      value: "3",
      description: "Unresolved",
      icon: "shield-alert" as any,
      color: theme.colors.danger,
    },
    {
      title: "HIGH ALERTS",
      value: "1",
      description: "Unresolved",
      icon: "show-chart" as any,
      color: theme.colors.warning,
    },
    {
      title: "IN PROGRESS",
      value: "0",
      description: "Being worked",
      icon: "show-chart" as any,
      color: theme.colors.warning,
    },
    {
      title: "ACKNOWLEDGED",
      value: "0",
      description: "Total",
      icon: "groups" as any,
      color: theme.colors.purple,
    },
  ];

  const recentAlerts = [
    {
      id: 1,
      title: "Test Alert 4",
      client: "Test Client",
      severity: "critical",
      time: "7:52 AM",
      isNew: true,
    },
    {
      id: 2,
      title: "Test Alert 3",
      client: "Test Client",
      severity: "high",
      time: "7:45 AM",
      isNew: true,
    },
    {
      id: 3,
      title: "Test Alert 2",
      client: "Test Client",
      severity: "critical",
      time: "Yesterday",
      isNew: false,
    },
    {
      id: 4,
      title: "Test Alert 1",
      client: "Test Client",
      severity: "high",
      time: "Yesterday",
      isNew: false,
    },
  ];

  const notifications = [
    {
      id: 1,
      userName: "Steve Theoden",
      message: "Completed security audit",
      status: "success",
      color: theme.colors.danger,
    },
    {
      id: 2,
      userName: "Steve Theoden", 
      message: "Updated firewall settings",
      status: "success",
      color: theme.colors.warning,
    },
    {
      id: 3,
      userName: "Sarah Johnson",
      message: "System maintenance completed",
      status: "success",
      color: theme.colors.info,
    },
  ];

  const pieData = [
    {
      value: 25,
      color: theme.colors.warning,
      text: "25%",
    },
    {
      value: 75,
      color: theme.colors.danger,
      text: "75%",
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: 20 + insets.bottom },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        Dashboard
      </Text>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[
              styles.statCard,
              { backgroundColor: theme.colors.bgSecondary },
            ]}
          >
            <View style={styles.statMain}>
              <View style={styles.statTop}>
                <Text
                  style={[
                    styles.statTitle,
                    { color: theme.colors.textSecondary },
                  ]}
                  numberOfLines={2}
                >
                  {stat.title}
                </Text>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name={stat.icon}
                    size={20}
                    color={stat.color}
                  />
                </View>
              </View>
              <Text
                style={[styles.statValue, { color: theme.colors.textPrimary }]}
              >
                {stat.value}
              </Text>
              <Text
                style={[
                  styles.statDescription,
                  { color: theme.colors.textTertiary },
                ]}
                numberOfLines={1}
              >
                {stat.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Card style={styles.cardSpacing}>
        <Card.Section hasBorder>
          <View style={styles.alertsHeader}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Recent Alerts
            </Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text
                style={[
                  styles.viewAllText,
                  { color: theme.colors.textTertiary },
                ]}
              >
                View all
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={16}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </Card.Section>

        <Card.Section>
          <View style={styles.alertsList}>
            {recentAlerts.map((alert, index) => (
              <View key={alert.id} style={styles.alertItem}>
                <View style={styles.timelineContainer}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor:
                          alert.severity === "critical"
                            ? theme.colors.danger
                            : theme.colors.warning,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: theme.colors.textSecondary },
                    ]}
                  />
                </View>
                <View style={styles.alertContent}>
                  <View style={styles.alertMain}>
                    <Text
                      style={[
                        styles.alertTitle,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {alert.title}
                    </Text>
                    <Text
                      style={[
                        styles.alertClient,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {alert.client}
                    </Text>
                    <View style={styles.alertBadges}>
                      <View
                        style={[
                          styles.severityBadge,
                          {
                            backgroundColor:
                              alert.severity === "critical"
                                ? theme.colors.danger + '20'
                                : theme.colors.warning + '20',
                            borderColor:
                              alert.severity === "critical"
                                ? theme.colors.danger
                                : theme.colors.warning,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name="lock"
                          size={10}
                          color={
                            alert.severity === "critical"
                              ? theme.colors.dangerLight
                              : theme.colors.warningLight
                          }
                        />
                        <Text
                          style={[
                            styles.severityBadgeText,
                            {
                              color:
                                alert.severity === "critical"
                                  ? theme.colors.dangerLight
                                  : theme.colors.warningLight,
                            },
                          ]}
                        >
                          {alert.severity === "critical" ? "Critical" : "High"}
                        </Text>
                      </View>
                      {alert.isNew && (
                        <View
                          style={[
                            styles.newBadge,
                            { 
                              backgroundColor: theme.colors.action + '20',
                              borderColor: theme.colors.action,
                              borderWidth: 1,
                            }
                          ]}
                        >
                          <Text
                            style={[
                              styles.newBadgeText,
                              { color: theme.colors.action }
                            ]}
                          >
                            New
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.alertRight}>
                    <Text
                      style={[
                        styles.alertTime,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {alert.time}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card.Section>
      </Card>

      <Card style={styles.cardSpacing}>
        <Card.Section hasBorder>
          <View style={styles.alertsHeader}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Priority Distribution
            </Text>
          </View>
        </Card.Section>

        <Card.Section hasBorder>
          <View style={styles.donutChartContainer}>
            <PieChart
              data={pieData}
              donut
              radius={60}
              innerRadius={35}
              innerCircleColor={theme.colors.bgSecondary}
            />
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: theme.colors.danger },
                  ]}
                />
                <View style={styles.legendTextContainer}>
                  <Text
                    style={[
                      styles.legendText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Critical
                  </Text>
                  <Text
                    style={[
                      styles.legendValue,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    75%
                  </Text>
                </View>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: theme.colors.warning },
                  ]}
                />
                <View style={styles.legendTextContainer}>
                  <Text
                    style={[
                      styles.legendText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    High
                  </Text>
                  <Text
                    style={[
                      styles.legendValue,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    25%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card.Section>
        <Card.Section>
          <View style={styles.alertsHeader}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Recent Notifications
            </Text>
          </View>
        </Card.Section>

        <Card.Section>
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationLeft}>
                    <Text
                      style={[
                        styles.userName,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {notification.userName}
                    </Text>
                    <Text
                      style={[
                        styles.notificationMessage,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {notification.message}
                    </Text>
                  </View>
                  <View style={styles.notificationRight}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: theme.colors.success + '20',
                        borderColor: theme.colors.success,
                        borderWidth: 1,
                      }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: theme.colors.successLight }
                      ]}>
                        sent
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card.Section>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 10,
  },
  cardSpacing: {
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    minHeight: 100,
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statMain: {
    flex: 1,
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(102, 102, 102, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  statTitle: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
    lineHeight: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 11,
    lineHeight: 13,
  },
  alertsContainer: {
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertsContent: {
    flex: 1,
    paddingLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  alertsList: {
    // Padding moved to alertsContent
  },
  alertItem: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  timelineContainer: {
    alignItems: "center",
    marginRight: 15,
    position: "relative",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 2,
  },
  timelineLine: {
    position: "absolute",
    top: 12,
    width: 2,
    height: 50,
    zIndex: 1,
  },
  alertContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 2,
  },
  alertMain: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  alertClient: {
    fontSize: 14,
  },
  alertRight: {
    alignItems: "flex-end",
  },
  alertTime: {
    fontSize: 12,
    marginBottom: 6,
  },
  alertBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
    borderWidth: 1,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  chartsContainer: {
    marginTop: 25,
  },
  chartCard: {
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartSection: {
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  chartContent: {
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    marginVertical: 15,
  },
  notificationsSection: {
    marginTop: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  donutChartContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  donutChart: {
    width: 120,
    height: 120,
    position: "relative",
  },
  donutSegment: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 25,
    borderColor: "transparent",
  },
  criticalSegment: {
    borderTopColor: "#FF6B6B",
    borderRightColor: "#FF6B6B",
    transform: [{ rotate: "45deg" }],
  },
  highSegment: {
    borderBottomColor: "#FFA726",
    borderLeftColor: "#FFA726",
    transform: [{ rotate: "225deg" }],
  },
  donutHole: {
    position: "absolute",
    top: 25,
    left: 25,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "transparent",
  },
  chartLegend: {
    paddingLeft: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  legendTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  notificationsList: {
    gap: 12,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  notificationContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginLeft: 12,
  },
  notificationLeft: {
    flex: 1,
  },
  notificationRight: {
    alignItems: "flex-end",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
});

export default DashboardContent;
