// PaymentScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  Easing,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const PaymentScreen = ({ navigation, route }) => {
  const { destino, precio } = route.params || {
    destino: "Koh Samui",
    precio: "$1,200",
  };

  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("credit");
  const [isProcessing, setIsProcessing] = useState(false);

  // Animations
  const containerAnim = useRef(new Animated.Value(0)).current; // 0 -> 1
  const headerAnim = useRef(new Animated.Value(0)).current;
  const sheenAnim = useRef(new Animated.Value(-1)).current; // for button sheen

  useEffect(() => {
    // Staggered entrance: header then content
    Animated.stagger(90, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // sheen loop (infinite subtle wave)
    Animated.loop(
      Animated.timing(sheenAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: true,
      })
    ).start();

    // reset sheen to -1 when unmount (clean)
    return () => sheenAnim.stopAnimation();
  }, []);

  // Format helpers
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, "").replace(/\D/g, "");
    const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 3) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  // Payment handler (keeps original behavior)
  const handlePayment = () => {
    if (selectedMethod === "credit") {
      if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
        Alert.alert("Error", "Please fill all the fields");
        return;
      }
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert("Payment Successful!", `Your booking for ${destino} has been confirmed.`, [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"),
        },
      ]);
    }, 1800);
  };

  // Stars renderer
  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const arr = [];
    for (let i = 0; i < 5; i++) {
      arr.push(
        <Ionicons
          key={i}
          name={i < full ? "star" : "star-outline"}
          size={12}
          color="#FFCD4A"
          style={{ marginRight: 4 }}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{arr}</View>;
  };

  // Payment method component (styled for new palette)
  const PaymentMethod = ({ icon, title, method, isSelected }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.paymentMethod,
        isSelected && styles.paymentMethodSelected,
      ]}
      onPress={() => setSelectedMethod(method)}
    >
      <View style={styles.methodLeft}>
        <View style={[styles.methodIcon, isSelected && styles.methodIconSelected]}>{icon}</View>
        <Text style={[styles.methodText, isSelected && styles.methodTextSelected]}>{title}</Text>
      </View>
      {isSelected && <Ionicons name="checkmark-circle" size={22} color="#2B6E70" />}
    </TouchableOpacity>
  );

  // Animated wrappers for blocks (so they appear with fade+scale+slide)
  const AnimatedBlock = ({ children, index = 0, style }) => {
    const delay = 120 + index * 70;
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      const a = Animated.parallel([
        Animated.timing(anim, {
          toValue: 1,
          duration: 520,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      a.start();
    }, []);

    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 0],
    });
    const scaleV = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.98, 1],
    });
    const opacity = anim;

    return (
      <Animated.View style={[{ opacity, transform: [{ translateY }, { scale: scaleV }] }, style]}>
        {children}
      </Animated.View>
    );
  };

  // Button sheen transform calculation
  const sheenTranslate = sheenAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width * 0.9, width * 0.9],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* HEADER */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
              {
                scale: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.995, 1],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={["#D8C6FF", "#C5E8FF", "#FFF1D6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#2F4750" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Payment</Text>

            <View style={{ width: 36 }} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* CONTENT */}
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking summary */}
        <AnimatedBlock index={0} style={{ paddingHorizontal: 18 }}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Destination</Text>
              <Text style={styles.summaryValue}>{destino}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>10 Days</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Travelers</Text>
              <Text style={styles.summaryValue}>2 Adults</Text>
            </View>

            <View style={styles.divider} />

            <View style={[styles.summaryRow, { marginTop: 6 }]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{precio}</Text>
            </View>
          </View>
        </AnimatedBlock>

        {/* Payment methods */}
        <AnimatedBlock index={1} style={{ paddingHorizontal: 18 }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment method</Text>

            <PaymentMethod
              icon={<Ionicons name="card" size={18} color="#6B8EA7" />}
              title="Credit Card"
              method="credit"
              isSelected={selectedMethod === "credit"}
            />
            <PaymentMethod
              icon={<FontAwesome5 name="paypal" size={18} color="#6B8EA7" />}
              title="PayPal"
              method="paypal"
              isSelected={selectedMethod === "paypal"}
            />
            <PaymentMethod
              icon={<FontAwesome5 name="google-wallet" size={18} color="#6B8EA7" />}
              title="Google Pay"
              method="google"
              isSelected={selectedMethod === "google"}
            />
          </View>
        </AnimatedBlock>

        {/* Card form */}
        {selectedMethod === "credit" && (
          <AnimatedBlock index={2} style={{ paddingHorizontal: 18 }}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Card information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="card" size={18} color="#6B8EA7" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="#9AAEB0"
                    value={cardNumber}
                    onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card holder</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={18} color="#6B8EA7" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#9AAEB0"
                    value={cardHolder}
                    onChangeText={setCardHolder}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>Expiry</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="calendar" size={18} color="#6B8EA7" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      placeholderTextColor="#9AAEB0"
                      value={expiryDate}
                      onChangeText={(t) => setExpiryDate(formatExpiryDate(t))}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={18} color="#6B8EA7" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor="#9AAEB0"
                      value={cvv}
                      onChangeText={setCvv}
                      keyboardType="number-pad"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            </View>
          </AnimatedBlock>
        )}

        {/* Security info */}
        <AnimatedBlock index={3} style={{ paddingHorizontal: 18 }}>
          <View style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#2F4750" />
              <Text style={styles.securityTitle}>Secure payment</Text>
            </View>
            <Text style={styles.securityText}>
              Your payment information is encrypted and never stored directly on our servers.
            </Text>
          </View>
        </AnimatedBlock>

        {/* Payment button */}
        <AnimatedBlock index={4} style={{ paddingHorizontal: 18, marginTop: 12 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePayment}
            disabled={isProcessing}
            style={{ borderRadius: 28, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["#C7B2FF", "#FFD8B2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.payButton, isProcessing && { opacity: 0.8 }]}
            >
              {/* sheen overlay */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.sheen,
                  {
                    transform: [{ translateX: sheenTranslate }],
                    opacity: 0.25,
                  },
                ]}
              />

              <View style={styles.payContent}>
                {isProcessing ? (
                  <>
                    <Animated.View style={{ marginRight: 10 }}>
                      <Ionicons name="refresh" size={18} color="#2F4750" />
                    </Animated.View>
                    <Text style={styles.payText}>Processing...</Text>
                  </>
                ) : (
                  <Text style={styles.payText}>Pay {precio}</Text>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </AnimatedBlock>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },

  // Header
  header: {
    paddingHorizontal: 18,
    marginTop: 12,
  },
  headerGradient: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#A89BFF",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#23383A",
  },

  // Summary card
  summaryCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#B7DADB",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#23383A",
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { color: "#6A8B90", fontSize: 13 },
  summaryValue: { color: "#2F4750", fontWeight: "700" },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F6",
    marginVertical: 12,
    borderRadius: 2,
  },
  totalLabel: { fontSize: 15, fontWeight: "800", color: "#23383A" },
  totalValue: { fontSize: 16, fontWeight: "900", color: "#2F4750" },

  // Section
  section: {
    marginTop: 18,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#23383A",
    marginBottom: 12,
  },

  // Payment methods
  paymentMethod: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#DDEFF0",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 3,
  },
  paymentMethodSelected: {
    borderWidth: 2,
    borderColor: "#C7B2FF",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F6F9FB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  methodIconSelected: {
    backgroundColor: "#C7B2FF",
  },
  methodText: {
    fontSize: 15,
    color: "#45686C",
    fontWeight: "700",
  },
  methodTextSelected: {
    color: "#23383A",
  },

  // Inputs
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    color: "#6A8B90",
    marginBottom: 8,
    fontWeight: "700",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#E6F3F4",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 2,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#2F4750", paddingVertical: 0 },

  row: {
    flexDirection: "row",
    marginTop: 6,
  },

  // Security
  securityCard: {
    marginTop: 12,
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#E8F3F2",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
  },
  securityHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  securityTitle: { marginLeft: 10, fontSize: 14, fontWeight: "800", color: "#23383A" },
  securityText: { color: "#6A8B90", lineHeight: 18 },

  // Pay button
  payButton: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    elevation: 6,
  },
  payContent: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  payText: { color: "#23383A", fontWeight: "900", fontSize: 16 },

  // Sheen overlay (animated)
  sheen: {
    position: "absolute",
    left: -width,
    top: 0,
    bottom: 0,
    width: width * 0.6,
    backgroundColor: "rgba(255,255,255,0.65)",
    transform: [{ rotate: "20deg" }],
  },
});

export default PaymentScreen;
